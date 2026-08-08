import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { dashboard, replenishment, supplierScorecards, listApprovals, updateApproval, updateApprovalSchema, createPurchaseRequest, createPurchaseRequestSchema, outcomes, exportInventoryCsv } from '../controllers/operations.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const plannerRoles = ['ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER'];

router.use(requireAuth);
router.get('/dashboard', asyncHandler(dashboard));
router.get('/replenishment', asyncHandler(replenishment));
router.get('/suppliers/scorecards', asyncHandler(supplierScorecards));
router.get('/approvals', requireRole(...plannerRoles), asyncHandler(listApprovals));
router.patch('/approvals/:id', requireRole(...plannerRoles), validate(updateApprovalSchema), asyncHandler(updateApproval));
router.post('/purchase-requests', requireRole(...plannerRoles), validate(createPurchaseRequestSchema), asyncHandler(createPurchaseRequest));
router.get('/outcomes', asyncHandler(outcomes));
router.get('/reports/inventory.csv', asyncHandler(exportInventoryCsv));

export default router;
