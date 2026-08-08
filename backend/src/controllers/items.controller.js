import { z } from 'zod';
import { prisma } from '../config/db.js';
import { recordAudit } from '../utils/audit.js';

export const listItemsQuerySchema = z.object({
  category: z.enum(['COURSE_LICENCE', 'CONTENT_SUBSCRIPTION', 'CERTIFICATION_VOUCHER', 'TRAINING_MATERIAL', 'DEVICE']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listItems(req, res) {
  const { category, search, page, pageSize } = req.query;

  const where = {
    organizationId: req.user.organizationId, // tenant isolation
    deletedAt: null,
    ...(category ? { category } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
      include: {
        stockBalances: { select: { onHandQty: true, reservedQty: true, locationId: true } },
        replenishmentParams: true,
      },
    }),
    prisma.item.count({ where }),
  ]);

  res.json({ data: items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
}

export async function getItem(req, res) {
  const item = await prisma.item.findFirst({
    where: { id: req.params.id, organizationId: req.user.organizationId, deletedAt: null },
    include: {
      lots: true,
      stockBalances: { include: { location: true, lot: true } },
      replenishmentParams: true,
      forecasts: { orderBy: { createdAt: 'desc' }, take: 5, include: { modelVersion: true } },
    },
  });

  if (!item) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
  }
  res.json({ data: item });
}

export const createItemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['COURSE_LICENCE', 'CONTENT_SUBSCRIPTION', 'CERTIFICATION_VOUCHER', 'TRAINING_MATERIAL', 'DEVICE']),
  unit: z.string().default('unit'),
});

export async function createItem(req, res) {
  const item = await prisma.item.create({
    data: { ...req.body, organizationId: req.user.organizationId },
  });

  await recordAudit({
    organizationId: req.user.organizationId,
    actorId: req.user.id,
    action: 'CREATE',
    entityType: 'Item',
    entityId: item.id,
  });

  res.status(201).json({ data: item });
}
