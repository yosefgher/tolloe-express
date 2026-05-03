import { Router } from 'express';
import { estimate } from '../controllers/calculator.controller';

const router = Router();
router.post('/estimate', estimate);

export default router;
