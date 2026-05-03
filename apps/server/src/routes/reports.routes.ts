import { Router } from 'express';
import * as ctrl from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();
router.use(authenticate, requireRole('ADMIN', 'SUPERVISOR'));

router.get('/daily', ctrl.getDailyReport);
router.get('/range', ctrl.getDateRangeReport);
router.get('/staff', ctrl.getStaffReport);
router.get('/audit-logs', ctrl.getAuditLogs);

export default router;
