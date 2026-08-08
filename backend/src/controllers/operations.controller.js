import { z } from 'zod';
import { prisma } from '../config/db.js';
import { recordAudit } from '../utils/audit.js';

const decimal = (value) => Number(value || 0);

function stockSummary(item, demandMultiplier = 1) {
  const onHand = item.stockBalances.reduce((total, balance) => total + decimal(balance.onHandQty), 0);
  const reserved = item.stockBalances.reduce((total, balance) => total + decimal(balance.reservedQty), 0);
  const available = onHand - reserved;
  const params = item.replenishmentParams?.[0];
  const safetyStock = decimal(params?.safetyStock);
  const reorderPoint = decimal(params?.reorderPoint);
  const reorderQty = decimal(params?.reorderQty);
  const forecast = decimal(item.forecasts?.[0]?.pointForecast) * demandMultiplier;
  const status = available <= safetyStock ? 'CRITICAL' : available <= reorderPoint ? 'WARNING' : 'HEALTHY';
  const recommendedQty = status === 'HEALTHY' ? 0 : Math.max(reorderQty, Math.ceil(forecast + safetyStock - available));

  return {
    id: item.id, sku: item.sku, name: item.name, category: item.category,
    onHand, reserved, available, safetyStock, reorderPoint, reorderQty,
    leadTimeDays: params?.leadTimeDays ?? null, forecastDemand: forecast,
    forecastConfidence: item.forecasts?.[0]?.confidence ?? null,
    status, recommendedQty,
  };
}

async function inventoryWithPlanning(orgId) {
  return prisma.item.findMany({
    where: { organizationId: orgId, deletedAt: null, active: true },
    orderBy: { name: 'asc' },
    include: {
      stockBalances: { select: { onHandQty: true, reservedQty: true } },
      replenishmentParams: true,
      forecasts: { orderBy: { createdAt: 'desc' }, take: 1, select: { pointForecast: true, confidence: true, createdAt: true } },
    },
  });
}

export async function dashboard(req, res) {
  const [items, notifications, pendingApprovals] = await Promise.all([
    inventoryWithPlanning(req.user.organizationId),
    prisma.notification.count({ where: { organizationId: req.user.organizationId, userId: req.user.id, read: false } }),
    prisma.approval.count({ where: { outcome: 'PENDING', purchaseRequest: { organizationId: req.user.organizationId } } }),
  ]);
  const rows = items.map(stockSummary);
  const critical = rows.filter((row) => row.status === 'CRITICAL').length;
  const warning = rows.filter((row) => row.status === 'WARNING').length;
  res.json({ data: { summary: { trackedItems: rows.length, critical, warning, unreadNotifications: notifications, pendingApprovals }, items: rows } });
}

export async function replenishment(req, res) {
  const demandMultiplier = Math.max(0.25, Math.min(3, Number(req.query.demandMultiplier) || 1));
  const items = await inventoryWithPlanning(req.user.organizationId);
  const rows = items.map((item) => stockSummary(item, demandMultiplier));
  res.json({ data: rows, scenario: { demandMultiplier } });
}

export async function supplierScorecards(req, res) {
  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: req.user.organizationId },
    include: { purchaseOrders: { select: { id: true, status: true, expectedAt: true, createdAt: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ data: suppliers.map((supplier) => ({
    id: supplier.id, name: supplier.name, contactEmail: supplier.contactEmail,
    leadTimeDays: supplier.leadTimeDays, riskScore: supplier.riskScore, active: supplier.active,
    scorecard: supplier.scorecard, openOrders: supplier.purchaseOrders.filter((order) => !['RECEIVED', 'CANCELLED'].includes(order.status)).length,
  })) });
}

export async function listApprovals(req, res) {
  const approvals = await prisma.approval.findMany({
    where: { purchaseRequest: { organizationId: req.user.organizationId } },
    include: {
      actor: { select: { name: true, email: true, role: { select: { name: true } } } },
      purchaseRequest: { 
        include: { 
          lines: { include: { item: { select: { name: true, sku: true } } } }, 
          purchaseOrder: true,
          requestedBy: { select: { name: true, email: true, role: { select: { name: true } } } }
        } 
      },
      aiRun: { include: { modelVersion: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: approvals });
}

export const updateApprovalSchema = z.object({
  outcome: z.enum(['APPROVED', 'REJECTED', 'DEFERRED', 'OVERRIDDEN', 'ESCALATED']),
  reason: z.string().min(3, 'A decision reason is required'),
});

export async function updateApproval(req, res) {
  const approval = await prisma.approval.findFirst({
    where: { id: req.params.id, purchaseRequest: { organizationId: req.user.organizationId } },
    include: { purchaseRequest: true },
  });
  if (!approval) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Approval not found' } });
  const updated = await prisma.approval.update({
    where: { id: approval.id },
    data: { outcome: req.body.outcome, reason: req.body.reason, actorId: req.user.id },
  });
  if (approval.purchaseRequest) {
    const status = req.body.outcome === 'APPROVED' ? 'APPROVED' : req.body.outcome === 'REJECTED' ? 'REJECTED' : req.body.outcome === 'DEFERRED' ? 'DEFERRED' : 'PENDING_REVIEW';
    await prisma.purchaseRequest.update({ where: { id: approval.purchaseRequest.id }, data: { status } });
  }
  await recordAudit({ organizationId: req.user.organizationId, actorId: req.user.id, action: req.body.outcome, entityType: 'Approval', entityId: approval.id, metadata: { reason: req.body.reason } });
  res.json({ data: updated });
}

export const createPurchaseRequestSchema = z.object({ itemId: z.string().uuid(), quantity: z.coerce.number().positive() });

export async function createPurchaseRequest(req, res) {
  const item = await prisma.item.findFirst({ where: { id: req.body.itemId, organizationId: req.user.organizationId, deletedAt: null } });
  if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });
  const request = await prisma.purchaseRequest.create({
    data: { organizationId: req.user.organizationId, requestedById: req.user.id, aiGenerated: true, lines: { create: { itemId: item.id, quantity: req.body.quantity } } },
    include: { lines: true },
  });
  const approval = await prisma.approval.create({ data: { purchaseRequestId: request.id, actorId: req.user.id, outcome: 'PENDING', reason: 'Awaiting authorised review' } });
  await recordAudit({ organizationId: req.user.organizationId, actorId: req.user.id, action: 'CREATE', entityType: 'PurchaseRequest', entityId: request.id, metadata: { approvalId: approval.id } });
  res.status(201).json({ data: { request, approval } });
}

export async function outcomes(req, res) {
  const forecasts = await prisma.forecast.findMany({
    where: { item: { organizationId: req.user.organizationId } },
    include: { item: { select: { name: true, sku: true, demandHistory: { orderBy: { periodStart: 'desc' }, take: 1 } } }, modelVersion: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const rows = forecasts.map((forecast) => {
    const actual = decimal(forecast.item.demandHistory[0]?.quantity);
    const prediction = decimal(forecast.pointForecast);
    const absoluteError = Math.abs(prediction - actual);
    return { id: forecast.id, item: forecast.item.name, sku: forecast.item.sku, prediction, actual, absoluteError, accuracy: actual ? Math.max(0, Math.round((1 - absoluteError / actual) * 100)) : null, confidence: forecast.confidence, status: forecast.status, createdAt: forecast.createdAt, modelVersion: forecast.modelVersion.version };
  });
  const comparable = rows.filter((row) => row.accuracy !== null);
  const meanAccuracy = comparable.length ? Math.round(comparable.reduce((sum, row) => sum + row.accuracy, 0) / comparable.length) : null;
  res.json({ data: { metrics: { meanAccuracy, evaluatedRuns: comparable.length, drift: 'Not detected', latency: 'Synchronous', adoption: 'Human review required' }, forecasts: rows } });
}

export async function exportInventoryCsv(req, res) {
  const items = await inventoryWithPlanning(req.user.organizationId);
  const rows = items.map(stockSummary);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [['SKU', 'Item', 'Category', 'Available', 'Safety stock', 'Forecast demand', 'Status', 'Recommended quantity'], ...rows.map((row) => [row.sku, row.name, row.category, row.available, row.safetyStock, row.forecastDemand, row.status, row.recommendedQty])]
    .map((row) => row.map(escape).join(',')).join('\n');
  await recordAudit({ organizationId: req.user.organizationId, actorId: req.user.id, action: 'EXPORT', entityType: 'InventoryReport' });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.csv"');
  res.send(csv);
}

export async function listMyRequests(req, res) {
  const requests = await prisma.purchaseRequest.findMany({
    where: { requestedById: req.user.id, organizationId: req.user.organizationId },
    include: {
      lines: { include: { item: { select: { name: true, sku: true } } } },
      approvals: {
        include: {
          actor: { select: { name: true, role: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ data: requests });
}