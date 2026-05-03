import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

async function getBizClient(userId: string) {
  const biz = await prisma.businessClient.findUnique({ where: { userId } });
  if (!biz) throw createError('Business client profile not found', 404);
  return biz;
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await prisma.businessClient.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { include: { profile: true } } },
    });
    if (!biz) throw createError('Business profile not found', 404);
    res.json({ success: true, data: biz });
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const updated = await prisma.businessClient.update({ where: { id: biz.id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function listApiKeys(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const keys = await prisma.apiKey.findMany({ where: { businessClientId: biz.id }, orderBy: { createdAt: 'desc' } });
    // Mask all but last 4 chars
    const masked = keys.map(k => ({ ...k, key: '••••••••' + k.key.slice(-4) }));
    res.json({ success: true, data: masked });
  } catch (err) { next(err); }
}

export async function createApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const key = 'te_live_' + crypto.randomBytes(24).toString('hex');
    const apiKey = await prisma.apiKey.create({
      data: { businessClientId: biz.id, name: req.body.name || 'API Key', key },
    });
    // Return full key only once
    res.status(201).json({ success: true, data: apiKey });
  } catch (err) { next(err); }
}

export async function deleteApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const key = await prisma.apiKey.findFirst({ where: { id: req.params.keyId, businessClientId: biz.id } });
    if (!key) throw createError('API key not found', 404);
    await prisma.apiKey.delete({ where: { id: key.id } });
    res.json({ success: true, message: 'API key deleted' });
  } catch (err) { next(err); }
}

export async function listWebhooks(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const webhooks = await prisma.webhook.findMany({ where: { businessClientId: biz.id } });
    res.json({ success: true, data: webhooks });
  } catch (err) { next(err); }
}

export async function createWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const secret = crypto.randomBytes(20).toString('hex');
    const webhook = await prisma.webhook.create({
      data: { businessClientId: biz.id, url: req.body.url, events: req.body.events, secret },
    });
    res.status(201).json({ success: true, data: webhook });
  } catch (err) { next(err); }
}

export async function deleteWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const biz = await getBizClient(req.user!.userId);
    const wh = await prisma.webhook.findFirst({ where: { id: req.params.webhookId, businessClientId: biz.id } });
    if (!wh) throw createError('Webhook not found', 404);
    await prisma.webhook.delete({ where: { id: wh.id } });
    res.json({ success: true, message: 'Webhook deleted' });
  } catch (err) { next(err); }
}
