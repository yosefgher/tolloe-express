import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

const INCLUDE = { author: { include: { profile: true } } };

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImageUrl: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  publishedAt: z.string().datetime().optional(),
});

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { publishedAt: { not: null, lte: new Date() } },
        include: INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.blogPost.count({ where: { publishedAt: { not: null, lte: new Date() } } }),
    ]);
    res.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug }, include: INCLUDE });
    if (!post) throw createError('Post not found', 404);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createSchema.parse(req.body);
    const post = await prisma.blogPost.create({
      data: { ...body, authorId: req.user!.userId, publishedAt: body.publishedAt ? new Date(body.publishedAt) : null },
      include: INCLUDE,
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await prisma.blogPost.update({
      where: { slug: req.params.slug },
      data: req.body,
      include: INCLUDE,
    });
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.blogPost.delete({ where: { slug: req.params.slug } });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
}
