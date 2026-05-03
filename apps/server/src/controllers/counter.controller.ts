import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { startOfDay, endOfDay } from 'date-fns';
import { createShipment } from '../services/shipment.service';

export async function getCounterDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.user!.userId;
    const today = new Date();

    const session = await prisma.cashSession.findFirst({
      where: { staffId, closedAt: null },
      include: { counter: { include: { branch: true } } },
      orderBy: { openedAt: 'desc' },
    });

    const [todayShipments, todayRevenue, todayByService, todayByPayment] = await Promise.all([
      prisma.shipment.count({
        where: { processedById: staffId, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          shipment: { processedById: staffId, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } },
          status: 'PAID',
        },
      }),
      prisma.shipment.groupBy({
        by: ['serviceType'],
        _count: true,
        where: { processedById: staffId, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } },
      }),
      prisma.payment.groupBy({
        by: ['method'],
        _count: true,
        _sum: { amount: true },
        where: {
          shipment: { processedById: staffId, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } },
        },
      }),
    ]);

    const recentShipments = await prisma.shipment.findMany({
      where: { processedById: staffId, createdAt: { gte: startOfDay(today) } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        recipient: { include: { profile: true } },
        deliveryAddress: true,
        payment: true,
      },
    });

    res.json({
      success: true,
      data: {
        session,
        stats: {
          todayShipments,
          todayRevenue: Number(todayRevenue._sum.amount || 0),
          byService: todayByService,
          byPayment: todayByPayment.map(p => ({ ...p, _sum: { amount: Number(p._sum.amount || 0) } })),
        },
        recentShipments,
      },
    });
  } catch (err) { next(err); }
}

export async function openSession(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.user!.userId;
    const { counterId, openingBalance } = req.body;

    const existing = await prisma.cashSession.findFirst({ where: { staffId, closedAt: null } });
    if (existing) throw createError('You already have an open session. Close it first.', 400);

    const session = await prisma.cashSession.create({
      data: { counterId, staffId, openingBalance: parseFloat(openingBalance) },
      include: { counter: { include: { branch: true } } },
    });

    await prisma.auditLog.create({
      data: { userId: staffId, action: 'OPEN_SESSION', entityType: 'CashSession', entityId: session.id, newValue: { openingBalance } },
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) { next(err); }
}

export async function closeSession(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.user!.userId;
    const { id } = req.params;
    const { closingBalance, notes } = req.body;

    const session = await prisma.cashSession.findUnique({ where: { id } });
    if (!session) throw createError('Session not found', 404);
    if (session.staffId !== staffId && req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPERVISOR') {
      throw createError('Not authorized', 403);
    }

    const variance = parseFloat(closingBalance) - (Number(session.openingBalance) + Number(session.cashReceived));

    const updated = await prisma.cashSession.update({
      where: { id },
      data: { closingBalance: parseFloat(closingBalance), variance, notes, closedAt: new Date() },
      include: { counter: { include: { branch: true } } },
    });

    await prisma.auditLog.create({
      data: { userId: staffId, action: 'CLOSE_SESSION', entityType: 'CashSession', entityId: id, newValue: { closingBalance, variance } },
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function getCurrentSession(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.user!.userId;
    const session = await prisma.cashSession.findFirst({
      where: { staffId, closedAt: null },
      include: { counter: { include: { branch: true } } },
      orderBy: { openedAt: 'desc' },
    });
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
}

export async function createCounterShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.user!.userId;
    const session = await prisma.cashSession.findFirst({ where: { staffId, closedAt: null } });

    const shipment = await createShipment({ ...req.body, processedById: staffId, cashSessionId: session?.id, counterId: session?.counterId });

    // Update session cash received if payment is CASH
    if (session && (req.body.paymentMethod === 'CASH' || req.body.paymentMethod === 'COD')) {
      await prisma.cashSession.update({
        where: { id: session.id },
        data: { cashReceived: { increment: Number(shipment.totalPrice) } },
      });
    }

    res.status(201).json({ success: true, data: shipment });
  } catch (err) { next(err); }
}

export async function getTodayShipments(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = req.user!.userId;
    const today = new Date();
    const shipments = await prisma.shipment.findMany({
      where: { processedById: staffId, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { include: { profile: true } },
        recipient: { include: { profile: true } },
        deliveryAddress: true,
        payment: true,
        counter: true,
      },
    });
    res.json({ success: true, data: shipments });
  } catch (err) { next(err); }
}

export async function getReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: {
        sender: { include: { profile: true } },
        recipient: { include: { profile: true } },
        pickupAddress: true,
        deliveryAddress: true,
        payment: true,
        counter: { include: { branch: true } },
        processedBy: { include: { profile: true } },
      },
    });
    if (!shipment) throw createError('Not found', 404);
    res.json({ success: true, data: shipment });
  } catch (err) { next(err); }
}

export async function listCounters(_req: Request, res: Response, next: NextFunction) {
  try {
    const counters = await prisma.counter.findMany({
      include: { branch: true },
      orderBy: [{ branch: { name: 'asc' } }, { name: 'asc' }],
    });
    res.json({ success: true, data: counters });
  } catch (err) { next(err); }
}

export async function listBranches(_req: Request, res: Response, next: NextFunction) {
  try {
    const branches = await prisma.branch.findMany({
      include: { counters: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: branches });
  } catch (err) { next(err); }
}

export async function createBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const branch = await prisma.branch.create({ data: req.body, include: { counters: true } });
    res.status(201).json({ success: true, data: branch });
  } catch (err) { next(err); }
}

export async function createCounter(req: Request, res: Response, next: NextFunction) {
  try {
    const counter = await prisma.counter.create({ data: req.body, include: { branch: true } });
    res.status(201).json({ success: true, data: counter });
  } catch (err) { next(err); }
}
