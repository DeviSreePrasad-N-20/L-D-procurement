import { prisma } from '../config/db.js';

/**
 * Writes an append-only audit event. Never call prisma.auditLog.update/delete
 * anywhere else in the codebase - audit records must stay immutable.
 */
export async function recordAudit({
  organizationId,
  actorId = null,
  action,
  entityType = null,
  entityId = null,
  outcome = 'SUCCESS',
  metadata = null,
}) {
  try {
    await prisma.auditLog.create({
      data: { organizationId, actorId, action, entityType, entityId, outcome, metadata },
    });
  } catch (err) {
    console.error('[audit] failed to record event', action, err.message);
  }
}
