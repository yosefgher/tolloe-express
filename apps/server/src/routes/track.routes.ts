import { Router } from 'express';
import { trackShipment } from '../controllers/shipment.controller';

const router = Router();

router.get('/:trackingNumber', trackShipment);

export default router;
