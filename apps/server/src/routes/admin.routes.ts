import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import * as ctrl from '../controllers/admin.controller';
import { listBranches, createBranch, listCounters, createCounter } from '../controllers/counter.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { ensureUploadDir } from '../services/upload.service';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ensureUploadDir()),
  filename: (_req, file, cb) => cb(null, `cms-${nanoid(8)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/reports', ctrl.getReports);
router.get('/drivers', ctrl.listDrivers);
router.post('/drivers', ctrl.createDriver);
router.put('/drivers/:id', ctrl.updateDriver);
router.get('/service-areas', ctrl.listServiceAreas);
router.post('/service-areas', ctrl.createServiceArea);
router.put('/service-areas/:id', ctrl.updateServiceArea);
router.get('/promo-codes', ctrl.listPromoCodes);
router.post('/promo-codes', ctrl.createPromoCode);
router.get('/cms', ctrl.getCmsContent);
router.put('/cms/:key', ctrl.updateCmsContent);
router.post('/cms/upload', upload.single('file'), ctrl.uploadCmsImage);
router.get('/branches', listBranches);
router.post('/branches', createBranch);
router.get('/counters', listCounters);
router.post('/counters', createCounter);

export default router;
