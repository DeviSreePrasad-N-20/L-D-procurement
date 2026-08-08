import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listNotifications, markRead } from '../controllers/notifications.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth);
router.get('/', asyncHandler(listNotifications));
router.patch('/:id/read', asyncHandler(markRead));

export default router;
