import { prisma } from '../lib/prisma';
import { haversineDistance } from '../lib/tracking';
import { createError } from '../middleware/errorHandler';
import type { ServiceType, PriceEstimateResponse } from '@repo/types';

const BASE_RATES: Record<ServiceType, number> = {
  SAME_DAY: 200,
  EXPRESS: 120,
  STANDARD: 80,
  ECONOMY: 50,
};

const WEIGHT_RATE = 15; // ETB per kg
const DISTANCE_RATE = 2; // ETB per km
const COD_SURCHARGE = 30; // ETB flat

const ESTIMATED_DAYS: Record<ServiceType, number> = {
  SAME_DAY: 1,
  EXPRESS: 2,
  STANDARD: 5,
  ECONOMY: 7,
};

export async function estimatePrice(params: {
  originCity: string;
  destinationCity: string;
  weight: number;
  serviceType: ServiceType;
  isCOD?: boolean;
}): Promise<PriceEstimateResponse> {
  const [origin, destination] = await Promise.all([
    prisma.serviceArea.findFirst({ where: { cityName: params.originCity, isActive: true } }),
    prisma.serviceArea.findFirst({ where: { cityName: params.destinationCity, isActive: true } }),
  ]);

  if (!origin) throw createError(`Origin city "${params.originCity}" not found in service areas`, 400);
  if (!destination) throw createError(`Destination city "${params.destinationCity}" not found in service areas`, 400);

  const distance = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const baseRate = BASE_RATES[params.serviceType];
  const weightCharge = params.weight * WEIGHT_RATE;
  const distanceCharge = Math.ceil(distance) * DISTANCE_RATE;
  const codSurcharge = params.isCOD ? COD_SURCHARGE : 0;
  const total = baseRate + weightCharge + distanceCharge + codSurcharge;

  return {
    baseRate,
    weightCharge,
    distanceCharge,
    codSurcharge,
    total: Math.ceil(total),
    currency: 'ETB',
    estimatedDays: ESTIMATED_DAYS[params.serviceType],
  };
}
