import { Router } from 'express';
import * as ctrl from '../controllers/counter.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();
router.use(authenticate, requireRole('ADMIN', 'SUPERVISOR', 'STAFF'));

router.get('/dashboard', ctrl.getCounterDashboard);
router.get('/sessions/current', ctrl.getCurrentSession);
router.post('/sessions/open', ctrl.openSession);
router.post('/sessions/:id/close', ctrl.closeSession);
router.get('/shipments/today', ctrl.getTodayShipments);
router.post('/shipments', ctrl.createCounterShipment);
router.get('/shipments/:id/receipt', ctrl.getReceipt);
router.get('/counters', ctrl.listCounters);
router.get('/branches', ctrl.listBranches);

export default router;
