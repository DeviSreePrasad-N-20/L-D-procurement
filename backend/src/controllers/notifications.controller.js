import { prisma } from '../config/db.js';

export async function listNotifications(req, res) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id, organizationId: req.user.organizationId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ data: notifications });
}

export async function markRead(req, res) {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notification) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });

  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
  res.json({ data: updated });
}
