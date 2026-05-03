import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as shipmentService from '../services/shipment.service';
import { sendShipmentCreatedNotification } from '../services/notification.service';
import type { Role, ServiceType } from '@repo/types';

const createSchema = z.object({
  recipientEmail: z.string().email(),
  serviceType: z.enum(['SAME_DAY', 'EXPRESS', 'STANDARD', 'ECONOMY']),
  weight: z.number().positive(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  notes: z.string().optional(),
  isCOD: z.boolean().optional(),
  promoCode: z.string().optional(),
  pickupAddress: z.object({
    street: z.string(),
    city: z.string(),
    region: z.string(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    region: z.string(),
    country: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

export async function listShipments(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await shipmentService.listShipments({
      userId: req.user!.userId,
      role: req.user!.role as Role,
      page,
      limit,
      status: req.query.status as string,
      search: req.query.search as string,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.getShipment(req.params.id, req.user!.userId, req.user!.role as Role);
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

export async function trackShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.getShipmentByTracking(req.params.trackingNumber);
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

export async function createShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createSchema.parse(req.body);
    const shipment = await shipmentService.createShipment({
      ...body,
      serviceType: body.serviceType as ServiceType,
      senderId: req.user!.userId,
    });

    // Fire-and-forget notification
    sendShipmentCreatedNotification(req.user!.userId, {
      trackingNumber: shipment.trackingNumber,
      recipientEmail: body.recipientEmail,
      serviceType: body.serviceType,
      totalPrice: Number(shipment.totalPrice),
    }).catch(console.error);

    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

export async function updateShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.updateShipment(req.params.id, req.body);
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

export async function addTrackingEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await shipmentService.addTrackingEvent(req.params.id, {
      ...req.body,
      staffId: req.user!.userId,
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function assignDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await shipmentService.assignDriver(req.params.id, req.body.driverId);
    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
}

export async function createProofOfDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const pod = await shipmentService.createProofOfDelivery(req.params.id, req.body);
    res.status(201).json({ success: true, data: pod });
  } catch (err) {
    next(err);
  }
}
