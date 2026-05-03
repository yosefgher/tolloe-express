import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('ADMIN'), ctrl.listUsers);
router.get('/:id', ctrl.getUser);
router.put('/:id', ctrl.updateUser);
router.get('/:id/addresses', ctrl.listAddresses);
router.post('/:id/addresses', ctrl.createAddress);
router.delete('/:id/addresses/:addressId', ctrl.deleteAddress);

export default router;
