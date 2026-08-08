import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';

/**
 * Verifies the JWT access token and attaches req.user (with role name + org)
 * so downstream RBAC checks and tenant isolation don't need extra queries.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing access token' } });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Account inactive or not found' } });
    }

    req.user = {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
      role: user.role.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' } });
  }
}
