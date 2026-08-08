import { z } from 'zod';
import { authenticate, rotateRefreshToken } from '../services/auth.service.js';
import { prisma } from '../config/db.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function login(req, res) {
  const { email, password } = req.body;
  const result = await authenticate(email, password);

  if (!result.ok) {
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' } });
  }

  res.json({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
}

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function refresh(req, res) {
  const { refreshToken } = req.body;
  const tokens = await rotateRefreshToken(refreshToken);
  res.json(tokens);
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, status: true, lastLoginAt: true, role: { select: { name: true } } },
  });
  res.json({ user: { ...user, role: user.role.name } });
}
