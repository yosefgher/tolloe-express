import { Router } from 'express';
import * as ctrl from '../controllers/blog.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/posts', ctrl.listPosts);
router.get('/posts/:slug', ctrl.getPost);
router.post('/posts', authenticate, requireRole('ADMIN', 'STAFF'), ctrl.createPost);
router.put('/posts/:slug', authenticate, requireRole('ADMIN', 'STAFF'), ctrl.updatePost);
router.delete('/posts/:slug', authenticate, requireRole('ADMIN'), ctrl.deletePost);

export default router;
