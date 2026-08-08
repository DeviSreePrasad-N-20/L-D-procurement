import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { recordAudit } from '../utils/audit.js';

const SALT_ROUNDS = 12;

export async function authenticate(email, password) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  // Constant-shape response whether the user exists or not, to avoid
  // leaking which emails are registered.
  if (!user || user.status !== 'ACTIVE' || user.deletedAt) {
    return { ok: false };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await recordAudit({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      outcome: 'FAILURE',
    });
    return { ok: false };
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role.name, orgId: user.organizationId });
  const refreshTokenRaw = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshTokenRaw),
      expiresAt: addDays(new Date(), 7),
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await recordAudit({
    organizationId: user.organizationId,
    actorId: user.id,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user.id,
    outcome: 'SUCCESS',
  });

  return {
    ok: true,
    accessToken,
    refreshToken: refreshTokenRaw,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      organizationId: user.organizationId,
    },
  };
}

export async function rotateRefreshToken(refreshTokenRaw) {
  const payload = verifyRefreshToken(refreshTokenRaw); // throws if invalid/expired
  const tokenHash = hashToken(refreshTokenRaw);

  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.sub, tokenHash, revoked: false },
  });
  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error('Refresh token is invalid or expired');
    err.status = 401;
    err.code = 'TOKEN_INVALID';
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user || user.status !== 'ACTIVE') {
    const err = new Error('Account inactive');
    err.status = 401;
    throw err;
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const newRefreshToken = signRefreshToken({ sub: user.id });
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(newRefreshToken), expiresAt: addDays(new Date(), 7) },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role.name, orgId: user.organizationId });
  return { accessToken, refreshToken: newRefreshToken };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
