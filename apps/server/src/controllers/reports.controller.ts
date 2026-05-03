import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { startOfDay, endOfDay, subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function getDailyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const start = startOfDay(date);
    const end = endOfDay(date);

    const [shipments, revenue, byService, byPayment, byCounter, byStaff] = await Promise.all([
      prisma.shipment.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', createdAt: { gte: start, lte: end } } }),
      prisma.shipment.groupBy({ by: ['serviceType'], _count: true, where: { createdAt: { gte: start, lte: end } } }),
      prisma.payment.groupBy({ by: ['method'], _count: true, _sum: { amount: true }, where: { createdAt: { gte: start, lte: end } } }),
      prisma.shipment.groupBy({ by: ['counterId'], _count: true, where: { createdAt: { gte: start, lte: end }, counterId: { not: null } } }),
      prisma.shipment.groupBy({ by: ['processedById'], _count: true, where: { createdAt: { gte: start, lte: end }, processedById: { not: null } } }),
    ]);

    // Resolve counter names
    const counterIds = byCounter.map(c => c.counterId).filter(Boolean) as string[];
    const counters = await prisma.counter.findMany({ where: { id: { in: counterIds } }, include: { branch: true } });
    const counterMap = Object.fromEntries(counters.map(c => [c.id, `${c.branch.name} — ${c.name}`]));

    // Resolve staff names
    const staffIds = byStaff.map(s => s.processedById).filter(Boolean) as string[];
    const staffUsers = await prisma.user.findMany({ where: { id: { in: staffIds } }, include: { profile: true } });
    const staffMap = Object.fromEntries(staffUsers.map(u => [u.id, `${u.profile?.firstName} ${u.profile?.lastName}`]));

    res.json({
      success: true,
      data: {
        date: format(date, 'yyyy-MM-dd'),
        totalShipments: shipments,
        totalRevenue: Number(revenue._sum.amount || 0),
        byService,
        byPayment: byPayment.map(p => ({ ...p, _sum: { amount: Number(p._sum.amount || 0) } })),
        byCounter: byCounter.map(c => ({ counterId: c.counterId, name: counterMap[c.counterId!] || 'Online', count: c._count })),
        byStaff: byStaff.map(s => ({ staffId: s.processedById, name: staffMap[s.processedById!] || 'Unknown', count: s._count })),
      },
    });
  } catch (err) { next(err); }
}

export async function getDateRangeReport(req: Request, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as string) || 'week';
    const today = new Date();
    let start: Date, end: Date;

    if (period === 'week') { start = startOfWeek(today); end = endOfWeek(today); }
    else if (period === 'month') { start = startOfMonth(today); end = endOfMonth(today); }
    else { start = subDays(today, parseInt(req.query.days as string) || 7); end = today; }

    const dailyData = [];
    const current = new Date(start);
    while (current <= end) {
      const s = startOfDay(current);
      const e = endOfDay(current);
      const [count, rev] = await Promise.all([
        prisma.shipment.count({ where: { createdAt: { gte: s, lte: e } } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', createdAt: { gte: s, lte: e } } }),
      ]);
      dailyData.push({ date: format(current, 'yyyy-MM-dd'), shipments: count, revenue: Number(rev._sum.amount || 0) });
      current.setDate(current.getDate() + 1);
    }

    res.json({ success: true, data: dailyData });
  } catch (err) { next(err); }
}

export async function getStaffReport(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const start = startOfDay(subDays(new Date(), days));

    const staffData = await prisma.shipment.groupBy({
      by: ['processedById'],
      _count: true,
      where: { processedById: { not: null }, createdAt: { gte: start } },
      orderBy: { _count: { processedById: 'desc' } },
    });

    const staffIds = staffData.map(s => s.processedById).filter(Boolean) as string[];
    const users = await prisma.user.findMany({ where: { id: { in: staffIds } }, include: { profile: true } });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    const revenue = await Promise.all(staffIds.map(id =>
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID', shipment: { processedById: id, createdAt: { gte: start } } },
      }).then(r => ({ id, revenue: Number(r._sum.amount || 0) }))
    ));
    const revenueMap = Object.fromEntries(revenue.map(r => [r.id, r.revenue]));

    res.json({
      success: true,
      data: staffData.map(s => ({
        staffId: s.processedById,
        name: `${userMap[s.processedById!]?.profile?.firstName || ''} ${userMap[s.processedById!]?.profile?.lastName || ''}`.trim(),
        email: userMap[s.processedById!]?.email,
        shipments: s._count,
        revenue: revenueMap[s.processedById!] || 0,
      })),
    });
  } catch (err) { next(err); }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { include: { profile: true } } },
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ success: true, data: { logs, total, page, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}
