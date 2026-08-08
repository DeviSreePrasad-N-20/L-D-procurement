import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { listAuditLogs } from '../controllers/auditLogs.controller.js';

const router = Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(requireAuth);
// Audit visibility restricted to governance-facing roles; normal users cannot read or mutate audit records
router.get('/', requireRole('ADMIN', 'FINANCE_REVIEWER', 'PROCUREMENT_MANAGER'), asyncHandler(listAuditLogs));

export default router;
