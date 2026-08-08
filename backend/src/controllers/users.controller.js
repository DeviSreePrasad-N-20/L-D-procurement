import { z } from 'zod';
import { prisma } from '../config/db.js';
import { hashPassword } from '../services/auth.service.js';
import { recordAudit } from '../utils/audit.js';

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    where: { organizationId: req.user.organizationId, deletedAt: null },
    select: {
      id: true, name: true, email: true, status: true, lastLoginAt: true, createdAt: true,
      role: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.json({ data: users.map((u) => ({ ...u, role: u.role.name })) });
}

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([
    'ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER', 'WAREHOUSE_USER', 'SUPPLIER',
    'FINANCE_REVIEWER', 'EMPLOYEE', 'MANAGER', 'INSTRUCTOR', 'LEARNING_ADMIN', 'HR_PARTNER', 'BUSINESS_LEADER',
  ]),
});

export async function createUser(req, res) {
  const { name, email, password, role } = req.body;

  const roleRecord = await prisma.role.findUnique({ where: { name: role } });
  if (!roleRecord) return res.status(400).json({ error: { code: 'INVALID_ROLE', message: 'Unknown role' } });

  const passwordHash = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash, roleId: roleRecord.id, organizationId: req.user.organizationId },
    });

    await recordAudit({
      organizationId: req.user.organizationId, actorId: req.user.id,
      action: 'CREATE', entityType: 'User', entityId: user.id,
    });

    res.status(201).json({ data: { id: user.id, name: user.name, email: user.email, role } });
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'A user with this email already exists.' } });
    }
    throw error;
  }
}

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export async function updateUserStatus(req, res) {
  const target = await prisma.user.findFirst({
    where: { id: req.params.id, organizationId: req.user.organizationId },
  });
  if (!target) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });

  const previousValue = { status: target.status };
  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { status: req.body.status, version: { increment: 1 } },
  });

  await recordAudit({
    organizationId: req.user.organizationId, actorId: req.user.id,
    action: 'UPDATE', entityType: 'User', entityId: target.id,
    metadata: { previousValue, newValue: { status: updated.status } },
  });

  res.json({ data: { id: updated.id, status: updated.status } });
}
