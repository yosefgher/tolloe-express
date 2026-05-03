import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as ctrl from '../controllers/shipment.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { parseCSV, parseXLSX, processBulkUpload } from '../services/upload.service';
import { streamInvoice } from '../services/pdf.service';
import { createError } from '../middleware/errorHandler';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// Public tracking is mounted separately at /track/:trackingNumber
// Invoice download (authenticated, own shipment or admin)
router.get('/:id/invoice', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await streamInvoice(req.params.id, res);
  } catch (err) { next(err); }
});

// All other routes require auth
router.use(authenticate);

router.get('/', ctrl.listShipments);
router.post('/', ctrl.createShipment);
router.get('/:id', ctrl.getShipment);
router.put('/:id', requireRole('ADMIN', 'STAFF'), ctrl.updateShipment);
router.post('/:id/events', requireRole('ADMIN', 'STAFF'), ctrl.addTrackingEvent);
router.put('/:id/assign-driver', requireRole('ADMIN', 'STAFF'), ctrl.assignDriver);
router.post('/:id/proof-of-delivery', requireRole('ADMIN', 'STAFF'), ctrl.createProofOfDelivery);

// Bulk upload (must come before /:id to avoid conflict)
router.post('/bulk-upload', requireRole('BUSINESS_CLIENT', 'ADMIN'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) throw createError('No file uploaded', 400);

      const ext = path.extname(req.file.originalname).toLowerCase();
      let rows;
      if (ext === '.csv') {
        rows = parseCSV(req.file.buffer);
      } else if (ext === '.xlsx' || ext === '.xls') {
        rows = parseXLSX(req.file.buffer);
      } else {
        throw createError('Unsupported file type. Use CSV or Excel.', 400);
      }

      const biz = await prisma.businessClient.findUnique({ where: { userId: req.user!.userId } });
      if (!biz) throw createError('Business client profile required', 403);

      const uploadRecord = await prisma.bulkUpload.create({
        data: {
          businessClientId: biz.id,
          userId: req.user!.userId,
          filename: `upload_${Date.now()}${ext}`,
          originalName: req.file.originalname,
          status: 'PROCESSING',
          totalRows: rows.length,
        },
      });

      processBulkUpload({ uploadId: uploadRecord.id, rows, senderId: req.user!.userId, businessClientId: biz.id })
        .catch(console.error);

      res.status(202).json({ success: true, data: { uploadId: uploadRecord.id, totalRows: rows.length, message: 'Processing started' } });
    } catch (err) { next(err); }
  }
);

export default router;
