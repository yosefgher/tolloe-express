import { prisma } from '../lib/prisma';
import { generateTrackingNumber } from '../lib/tracking';
import { createError } from '../middleware/errorHandler';
import { estimatePrice } from './calculator.service';
import type { Role, ServiceType } from '@repo/types';

const SHIPMENT_INCLUDE = {
  sender: { include: { profile: true } },
  recipient: { include: { profile: true } },
  pickupAddress: true,
  deliveryAddress: true,
  trackingEvents: { orderBy: { timestamp: 'asc' as const } },
  payment: true,
  proofOfDelivery: true,
  driver: { include: { user: { include: { profile: true } } } },
};

export async function listShipments(params: {
  userId: string;
  role: Role;
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) {
  const skip = (params.page - 1) * params.limit;

  // Build where clause based on role
  const where: Record<string, unknown> = {};
  if (params.role === 'CUSTOMER') {
    where.OR = [{ senderId: params.userId }, { recipientId: params.userId }];
  } else if (params.role === 'BUSINESS_CLIENT') {
    const biz = await prisma.businessClient.findUnique({ where: { userId: params.userId } });
    if (biz) where.businessClientId = biz.id;
  }

  if (params.status) where.status = params.status;
  if (params.search) {
    where.OR = [
      { trackingNumber: { contains: params.search, mode: 'insensitive' } },
      { sender: { email: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: SHIPMENT_INCLUDE,
      skip,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shipment.count({ where }),
  ]);

  return { items, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
}

export async function getShipment(id: string, userId: string, role: Role) {
  const shipment = await prisma.shipment.findUnique({ where: { id }, include: SHIPMENT_INCLUDE });
  if (!shipment) throw createError('Shipment not found', 404);

  if (role === 'CUSTOMER' && shipment.senderId !== userId && shipment.recipientId !== userId) {
    throw createError('Access denied', 403);
  }

  return shipment;
}

export async function getShipmentByTracking(trackingNumber: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: {
      pickupAddress: true,
      deliveryAddress: true,
      trackingEvents: { orderBy: { timestamp: 'asc' } },
    },
  });
  if (!shipment) throw createError('Shipment not found', 404);
  return shipment;
}

export async function createShipment(data: {
  senderId?: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  recipientEmail: string;
  recipientName?: string;
  recipientPhone?: string;
  serviceType: ServiceType;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  notes?: string;
  isCOD?: boolean;
  codAmount?: number;
  paymentMethod?: string;
  promoCode?: string;
  processedById?: string;
  cashSessionId?: string;
  counterId?: string;
  pickupAddress: { street: string; city: string; region: string; country?: string; lat?: number; lng?: number };
  deliveryAddress: { street: string; city: string; region: string; country?: string; lat?: number; lng?: number };
}) {
  // Resolve or create sender (for counter-originated shipments)
  let resolvedSenderId = data.senderId;
  if (!resolvedSenderId && data.senderEmail) {
    const bcrypt = await import('bcryptjs');
    const nameParts = (data.senderName || 'Walk-in Customer').split(' ');
    let sender = await prisma.user.findUnique({ where: { email: data.senderEmail } });
    if (!sender) {
      sender = await prisma.user.create({
        data: {
          email: data.senderEmail,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          role: 'CUSTOMER',
          phone: data.senderPhone,
          profile: { create: { firstName: nameParts[0] || 'Walk-in', lastName: nameParts.slice(1).join(' ') || 'Customer' } },
        },
      });
    }
    resolvedSenderId = sender.id;
  }
  if (!resolvedSenderId) throw createError('Sender information is required', 400);

  // Resolve or create recipient
  let recipient = await prisma.user.findUnique({ where: { email: data.recipientEmail } });
  if (!recipient) {
    // Create a placeholder customer account for the recipient
    const bcrypt = await import('bcryptjs');
    const nameParts = (data.recipientName || 'Recipient').split(' ');
    recipient = await prisma.user.create({
      data: {
        email: data.recipientEmail,
        passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
        role: 'CUSTOMER',
        phone: data.recipientPhone,
        profile: { create: { firstName: nameParts[0] || 'Recipient', lastName: nameParts.slice(1).join(' ') || '' } },
      },
    });
  }

  // Validate promo code
  let promoCode = null;
  if (data.promoCode) {
    promoCode = await prisma.promoCode.findFirst({
      where: { code: data.promoCode, isActive: true },
    });
    if (promoCode && promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      throw createError('Promo code has expired', 400);
    }
    if (promoCode && promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      throw createError('Promo code has reached its usage limit', 400);
    }
  }

  // Calculate price
  const estimate = await estimatePrice({
    originCity: data.pickupAddress.city,
    destinationCity: data.deliveryAddress.city,
    weight: data.weight,
    serviceType: data.serviceType,
    isCOD: data.isCOD,
  });

  let totalPrice = estimate.total;
  if (promoCode) {
    if (promoCode.discountType === 'PERCENTAGE') {
      totalPrice = totalPrice * (1 - Number(promoCode.discountValue) / 100);
    } else {
      totalPrice = Math.max(0, totalPrice - Number(promoCode.discountValue));
    }
    await prisma.promoCode.update({ where: { id: promoCode.id }, data: { usedCount: { increment: 1 } } });
  }

  const trackingNumber = generateTrackingNumber();

  // Create address records
  const [pickup, delivery] = await Promise.all([
    prisma.address.create({
      data: {
        userId: resolvedSenderId,
        label: 'Pickup',
        street: data.pickupAddress.street,
        city: data.pickupAddress.city,
        region: data.pickupAddress.region,
        country: data.pickupAddress.country || 'Ethiopia',
        lat: data.pickupAddress.lat,
        lng: data.pickupAddress.lng,
      },
    }),
    prisma.address.create({
      data: {
        userId: recipient.id,
        label: 'Delivery',
        street: data.deliveryAddress.street,
        city: data.deliveryAddress.city,
        region: data.deliveryAddress.region,
        country: data.deliveryAddress.country || 'Ethiopia',
        lat: data.deliveryAddress.lat,
        lng: data.deliveryAddress.lng,
      },
    }),
  ]);

  const shipment = await prisma.shipment.create({
    data: {
      trackingNumber,
      status: 'PENDING',
      serviceType: data.serviceType,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      totalPrice: Math.ceil(totalPrice),
      isCOD: data.isCOD || false,
      codAmount: data.codAmount,
      notes: data.notes,
      senderId: resolvedSenderId,
      recipientId: recipient.id,
      pickupAddressId: pickup.id,
      deliveryAddressId: delivery.id,
      promoCodeId: promoCode?.id,
      processedById: data.processedById,
      cashSessionId: data.cashSessionId,
      counterId: data.counterId,
      trackingEvents: {
        create: {
          status: 'PENDING',
          location: data.pickupAddress.city,
          notes: 'Shipment created and awaiting pickup',
        },
      },
      payment: {
        create: {
          amount: Math.ceil(totalPrice),
          currency: 'ETB',
          method: (data.paymentMethod as never) || (data.isCOD ? 'COD' : 'CASH'),
          status: data.paymentMethod && data.paymentMethod !== 'COD' ? 'PAID' : 'PENDING',
        },
      },
    },
    include: SHIPMENT_INCLUDE,
  });

  return shipment;
}

export async function updateShipment(id: string, data: Record<string, unknown>) {
  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) throw createError('Shipment not found', 404);
  return prisma.shipment.update({ where: { id }, data, include: SHIPMENT_INCLUDE });
}

export async function addTrackingEvent(shipmentId: string, data: {
  status: string;
  location?: string;
  notes?: string;
  staffId?: string;
}) {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw createError('Shipment not found', 404);

  const [event] = await Promise.all([
    prisma.trackingEvent.create({
      data: {
        shipmentId,
        status: data.status as never,
        location: data.location,
        notes: data.notes,
        staffId: data.staffId,
      },
    }),
    prisma.shipment.update({ where: { id: shipmentId }, data: { status: data.status as never } }),
  ]);

  return event;
}

export async function assignDriver(shipmentId: string, driverId: string) {
  const [shipment, driver] = await Promise.all([
    prisma.shipment.findUnique({ where: { id: shipmentId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);
  if (!shipment) throw createError('Shipment not found', 404);
  if (!driver) throw createError('Driver not found', 404);

  return prisma.shipment.update({
    where: { id: shipmentId },
    data: { driverId },
    include: SHIPMENT_INCLUDE,
  });
}

export async function createProofOfDelivery(shipmentId: string, data: {
  receiverName: string;
  signatureUrl?: string;
  photoUrl?: string;
  notes?: string;
}) {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw createError('Shipment not found', 404);

  const [pod] = await Promise.all([
    prisma.proofOfDelivery.create({ data: { shipmentId, ...data } }),
    prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'DELIVERED', actualDelivery: new Date() },
    }),
    prisma.trackingEvent.create({
      data: { shipmentId, status: 'DELIVERED', notes: `Delivered to ${data.receiverName}` },
    }),
  ]);

  return pod;
}
