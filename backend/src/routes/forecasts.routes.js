import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { generateForecast, listForecasts } from '../controllers/forecasts.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth);

router.get('/items/:itemId/forecasts', asyncHandler(listForecasts));
router.post(
  '/items/:itemId/forecasts/generate',
  requireRole('ADMIN', 'INVENTORY_PLANNER', 'PROCUREMENT_MANAGER'),
  asyncHandler(generateForecast)
);

export default router;
