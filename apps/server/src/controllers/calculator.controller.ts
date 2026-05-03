import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { estimatePrice } from '../services/calculator.service';

const schema = z.object({
  originCity: z.string(),
  destinationCity: z.string(),
  weight: z.number().positive(),
  serviceType: z.enum(['SAME_DAY', 'EXPRESS', 'STANDARD', 'ECONOMY']),
  isCOD: z.boolean().optional(),
});

export async function estimate(req: Request, res: Response, next: NextFunction) {
  try {
    const body = schema.parse(req.body);
    const result = await estimatePrice(body as Parameters<typeof estimatePrice>[0]);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
