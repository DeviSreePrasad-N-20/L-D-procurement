import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { listUsers, createUser, createUserSchema, updateUserStatus, updateUserStatusSchema } from '../controllers/users.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth);
router.use(requireRole('ADMIN')); // full user management is admin-only

router.get('/', asyncHandler(listUsers));
router.post('/', validate(createUserSchema), asyncHandler(createUser));
router.patch('/:id/status', validate(updateUserStatusSchema), asyncHandler(updateUserStatus));

export default router;
