import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date();
    const [
      totalShipments, todayShipments, pendingShipments, deliveredShipments,
      totalUsers, totalRevenue, recentShipments,
    ] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { createdAt: { gte: startOfDay(today), lte: endOfDay(today) } } }),
      prisma.shipment.count({ where: { status: 'PENDING' } }),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.user.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      prisma.shipment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { sender: { include: { profile: true } }, pickupAddress: true, deliveryAddress: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalShipments,
          todayShipments,
          pendingShipments,
          deliveredShipments,
          totalUsers,
          totalRevenue: Number(totalRevenue._sum.amount || 0),
        },
        recentShipments,
      },
    });
  } catch (err) { next(err); }
}

export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const dailyData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const [count, revenue] = await Promise.all([
        prisma.shipment.count({ where: { createdAt: { gte: startOfDay(date), lte: endOfDay(date) } } }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: 'PAID', createdAt: { gte: startOfDay(date), lte: endOfDay(date) } },
        }),
      ]);
      dailyData.push({ date: format(date, 'yyyy-MM-dd'), shipments: count, revenue: Number(revenue._sum.amount || 0) });
    }

    res.json({ success: true, data: dailyData });
  } catch (err) { next(err); }
}

export async function listDrivers(_req: Request, res: Response, next: NextFunction) {
  try {
    const drivers = await prisma.driver.findMany({
      include: { user: { include: { profile: true } } },
    });
    res.json({ success: true, data: drivers });
  } catch (err) { next(err); }
}

export async function createDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, vehicleType, licenseNumber, vehiclePlate } = req.body;
    const driver = await prisma.driver.create({
      data: { userId, vehicleType, licenseNumber, vehiclePlate },
      include: { user: { include: { profile: true } } },
    });
    res.status(201).json({ success: true, data: driver });
  } catch (err) { next(err); }
}

export async function updateDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: req.body,
      include: { user: { include: { profile: true } } },
    });
    res.json({ success: true, data: driver });
  } catch (err) { next(err); }
}

export async function listServiceAreas(_req: Request, res: Response, next: NextFunction) {
  try {
    const areas = await prisma.serviceArea.findMany({ orderBy: { cityName: 'asc' } });
    res.json({ success: true, data: areas });
  } catch (err) { next(err); }
}

export async function createServiceArea(req: Request, res: Response, next: NextFunction) {
  try {
    const area = await prisma.serviceArea.create({ data: req.body });
    res.status(201).json({ success: true, data: area });
  } catch (err) { next(err); }
}

export async function updateServiceArea(req: Request, res: Response, next: NextFunction) {
  try {
    const area = await prisma.serviceArea.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: area });
  } catch (err) { next(err); }
}

export async function listPromoCodes(_req: Request, res: Response, next: NextFunction) {
  try {
    const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: codes });
  } catch (err) { next(err); }
}

export async function createPromoCode(req: Request, res: Response, next: NextFunction) {
  try {
    const code = await prisma.promoCode.create({ data: req.body });
    res.status(201).json({ success: true, data: code });
  } catch (err) { next(err); }
}

export async function getCmsContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.siteContent.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push({ key: item.key, value: item.value, label: item.label, type: item.type });
      return acc;
    }, {} as Record<string, { key: string; value: string; label: string; type: string }[]>);
    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
}

export async function updateCmsContent(req: Request, res: Response, next: NextFunction) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const item = await prisma.siteContent.update({ where: { key }, data: { value } });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function uploadCmsImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw createError('No file uploaded', 400);
    const { key } = req.body;
    if (!key) throw createError('key is required', 400);
    const url = `/uploads/${req.file.filename}`;
    const item = await prisma.siteContent.update({ where: { key }, data: { value: url } });
    res.json({ success: true, data: { url, item } });
  } catch (err) { next(err); }
}

export async function getPublicCms(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.siteContent.findMany();
    const flat = Object.fromEntries(items.map(i => [i.key, i.value]));
    res.json({ success: true, data: flat });
  } catch (err) { next(err); }
}
