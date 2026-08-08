/**
 * Least-privilege role gate. Usage: requireRole('ADMIN', 'PROCUREMENT_MANAGER')
 * Must run after requireAuth. Server-side enforcement - the frontend nav is
 * cosmetic only, this is the real boundary.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' } });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: `Role ${req.user.role} is not permitted to perform this action` },
      });
    }
    next();
  };
}

/**
 * Tenant isolation guard: ensures any organizationId referenced in params/body
 * matches the signed-in user's organization. Call explicitly in controllers
 * that accept an organizationId, or rely on req.user.organizationId when
 * building Prisma `where` clauses (preferred - always scope reads/writes to it).
 */
export function assertSameOrg(req, organizationId) {
  if (organizationId && organizationId !== req.user.organizationId) {
    const err = new Error('Cross-organization access denied');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
}
