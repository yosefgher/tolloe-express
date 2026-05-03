import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const updateSchema = z.object({
  phone: z.string().optional(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatarUrl: z.string().optional(),
  }).optional(),
}).partial();

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { phone: { contains: search } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, include: { profile: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id === 'me' ? req.user!.userId : req.params.id;
    if (req.user!.role !== 'ADMIN' && id !== req.user!.userId) throw createError('Access denied', 403);

    const user = await prisma.user.findUnique({ where: { id }, include: { profile: true, businessClient: true } });
    if (!user) throw createError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id === 'me' ? req.user!.userId : req.params.id;
    if (req.user!.role !== 'ADMIN' && id !== req.user!.userId) throw createError('Access denied', 403);

    const { phone, profile } = updateSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id },
      data: {
        phone,
        ...(profile && { profile: { update: profile } }),
      },
      include: { profile: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function listAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id === 'me' ? req.user!.userId : req.params.id;
    if (req.user!.role !== 'ADMIN' && id !== req.user!.userId) throw createError('Access denied', 403);

    const addresses = await prisma.address.findMany({ where: { userId: id } });
    res.json({ success: true, data: addresses });
  } catch (err) { next(err); }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id === 'me' ? req.user!.userId : req.params.id;
    if (req.user!.role !== 'ADMIN' && id !== req.user!.userId) throw createError('Access denied', 403);

    const address = await prisma.address.create({ data: { ...req.body, userId: id } });
    res.status(201).json({ success: true, data: address });
  } catch (err) { next(err); }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const addr = await prisma.address.findUnique({ where: { id: req.params.addressId } });
    if (!addr) throw createError('Address not found', 404);
    if (req.user!.role !== 'ADMIN' && addr.userId !== req.user!.userId) throw createError('Access denied', 403);

    await prisma.address.delete({ where: { id: req.params.addressId } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) { next(err); }
}
