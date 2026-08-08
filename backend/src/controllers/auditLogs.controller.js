import { prisma } from '../config/db.js';

export async function listAuditLogs(req, res) {
  const { actorId, action, entityType, from, to, page = 1, pageSize = 25 } = req.query;

  const where = {
    organizationId: req.user.organizationId,
    ...(actorId ? { actorId } : {}),
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({ data: logs, page: Number(page), pageSize: Number(pageSize), total });
}
