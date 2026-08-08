import { prisma } from '../config/db.js';
import { statisticalForecast, explainForecast } from '../services/forecast.service.js';
import { recordAudit } from '../utils/audit.js';

/**
 * Generates (but does not auto-apply) a forecast for one item. This is the
 * "AI Run" - it is persisted with its input snapshot and surfaced to
 * planners on the Demand Forecasting page for review/approval, never
 * auto-executed against stock or purchasing.
 */
export async function generateForecast(req, res) {
  const item = await prisma.item.findFirst({
    where: { id: req.params.itemId, organizationId: req.user.organizationId },
  });
  if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });

  const history = await prisma.demandHistory.findMany({
    where: { itemId: item.id },
    orderBy: { periodStart: 'asc' },
    take: 12,
  });

  const result = statisticalForecast(history, 1);
  const explanation = await explainForecast({ itemName: item.name, history, result });

  const modelVersion = await prisma.modelVersion.upsert({
    where: { name_version: { name: 'demand-forecast', version: '1.0.0' } },
    update: {},
    create: { name: 'demand-forecast', version: '1.0.0', description: 'Weighted moving average + trend, optional Gemini explanation' },
  });

  const now = new Date();
  const horizonEnd = new Date(now);
  horizonEnd.setDate(horizonEnd.getDate() + 30);

  const forecast = await prisma.forecast.create({
    data: {
      itemId: item.id,
      modelVersionId: modelVersion.id,
      horizonStart: now,
      horizonEnd,
      pointForecast: result.pointForecast ?? 0,
      lowerBound: result.lowerBound,
      upperBound: result.upperBound,
      confidence: result.confidence,
      assumptions: { method: result.method, explanation },
      status: result.status,
      inputSnapshot: { history: history.map((h) => ({ periodStart: h.periodStart, quantity: Number(h.quantity) })) },
    },
    include: { modelVersion: true },
  });

  const aiRun = await prisma.aIRun.create({
    data: {
      kind: 'DEMAND_FORECAST',
      modelVersionId: modelVersion.id,
      inputSnapshot: { itemId: item.id, history: history.map((h) => Number(h.quantity)) },
      output: result,
      confidence: result.confidence,
      explanation,
    },
  });

  await recordAudit({
    organizationId: req.user.organizationId,
    actorId: req.user.id,
    action: 'AI_RUN',
    entityType: 'Forecast',
    entityId: forecast.id,
    metadata: { aiRunId: aiRun.id },
  });

  res.status(201).json({ data: { forecast, explanation, aiRunId: aiRun.id } });
}

export async function listForecasts(req, res) {
  const item = await prisma.item.findFirst({
    where: { id: req.params.itemId, organizationId: req.user.organizationId },
  });
  if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found' } });

  const forecasts = await prisma.forecast.findMany({
    where: { itemId: item.id },
    orderBy: { createdAt: 'desc' },
    include: { modelVersion: true },
  });
  res.json({ data: forecasts });
}
