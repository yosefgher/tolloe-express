import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { prisma } from '../lib/prisma';
import { createShipment } from './shipment.service';
import { env } from '../config/env';
import type { ServiceType } from '@repo/types';

export function ensureUploadDir() {
  const dir = path.resolve(env.UPLOAD_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

type BulkRow = {
  recipientEmail: string;
  pickupStreet: string;
  pickupCity: string;
  pickupRegion: string;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryRegion: string;
  weight: string;
  serviceType: string;
  notes?: string;
};

export function parseCSV(buffer: Buffer): BulkRow[] {
  return parse(buffer, { columns: true, skip_empty_lines: true, trim: true }) as BulkRow[];
}

export function parseXLSX(buffer: Buffer): BulkRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<BulkRow>(ws);
}

export async function processBulkUpload(params: {
  uploadId: string;
  rows: BulkRow[];
  senderId: string;
  businessClientId: string;
}) {
  let successRows = 0;
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 0; i < params.rows.length; i++) {
    const row = params.rows[i];
    try {
      await createShipment({
        senderId: params.senderId,
        recipientEmail: row.recipientEmail,
        serviceType: (row.serviceType?.toUpperCase() || 'STANDARD') as ServiceType,
        weight: parseFloat(row.weight) || 1,
        notes: row.notes,
        pickupAddress: {
          street: row.pickupStreet,
          city: row.pickupCity,
          region: row.pickupRegion,
        },
        deliveryAddress: {
          street: row.deliveryStreet,
          city: row.deliveryCity,
          region: row.deliveryRegion,
        },
      });
      successRows++;
    } catch (err) {
      errors.push({ row: i + 2, error: (err as Error).message });
    }
  }

  await prisma.bulkUpload.update({
    where: { id: params.uploadId },
    data: {
      status: 'COMPLETED',
      totalRows: params.rows.length,
      successRows,
      errorRows: errors.length,
      errorDetails: errors.length > 0 ? errors : undefined,
    },
  });

  return { totalRows: params.rows.length, successRows, errorRows: errors.length, errors };
}
