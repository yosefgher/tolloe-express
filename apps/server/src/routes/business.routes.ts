import { Router } from 'express';
import * as ctrl from '../controllers/business.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();
router.use(authenticate, requireRole('BUSINESS_CLIENT'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/api-keys', ctrl.listApiKeys);
router.post('/api-keys', ctrl.createApiKey);
router.delete('/api-keys/:keyId', ctrl.deleteApiKey);
router.get('/webhooks', ctrl.listWebhooks);
router.post('/webhooks', ctrl.createWebhook);
router.delete('/webhooks/:webhookId', ctrl.deleteWebhook);

export default router;
