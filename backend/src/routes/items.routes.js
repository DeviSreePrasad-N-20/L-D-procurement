import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  listItems, listItemsQuerySchema,
  getItem,
  createItem, createItemSchema,
} from '../controllers/items.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth);

// Read access: everyone signed in can view items relevant to their scope
router.get('/', validate(listItemsQuerySchema, { source: 'query' }), asyncHandler(listItems));
router.get('/:id', asyncHandler(getItem));

// Write access: restricted to planning/procurement roles
router.post(
  '/',
  requireRole('ADMIN', 'INVENTORY_PLANNER', 'PROCUREMENT_MANAGER'),
  validate(createItemSchema),
  asyncHandler(createItem)
);

export default router;
