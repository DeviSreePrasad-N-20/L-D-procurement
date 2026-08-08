/**
 * Demand forecasting service.
 *
 * Design: a small, swappable "provider" interface so the AI layer can run
 * two ways:
 *   1. STATISTICAL (default, works offline) - weighted moving average +
 *      simple trend/seasonality adjustment. Always available, zero cost,
 *      good enough to demo the full workflow end-to-end.
 *   2. GEMINI (optional) - calls Google's Gemini API server-side to produce
 *      a natural-language explanation and a sanity-checked adjustment on
 *      top of the statistical baseline. Requires GEMINI_API_KEY to be set
 *      in the backend environment; the key is never sent to the frontend.
 *
 * Every forecast is persisted with its inputSnapshot, model version, and
 * confidence so it can be reviewed, approved, or overridden (see Approval
 * model) - this satisfies the "AI is decision-support, not autonomous
 * action" requirement.
 */

const USE_GEMINI = Boolean(process.env.GEMINI_API_KEY);

/**
 * @param {Array<{periodStart: Date, periodEnd: Date, quantity: number}>} history
 * @param {number} horizonPeriods number of future periods to forecast
 */
export function statisticalForecast(history, horizonPeriods = 1) {
  if (!history || history.length === 0) {
    return { pointForecast: null, lowerBound: null, upperBound: null, confidence: 0, status: 'INSUFFICIENT_DATA' };
  }

  const quantities = history.map((h) => Number(h.quantity));
  const n = quantities.length;

  // Weighted moving average - recent periods matter more (simple, explainable)
  const weights = quantities.map((_, i) => i + 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const weightedMean = quantities.reduce((sum, q, i) => sum + q * weights[i], 0) / weightSum;

  // Trend: naive linear slope over the series
  const meanIndex = (n - 1) / 2;
  const meanQty = quantities.reduce((a, b) => a + b, 0) / n;
  const slopeNum = quantities.reduce((sum, q, i) => sum + (i - meanIndex) * (q - meanQty), 0);
  const slopeDen = quantities.reduce((sum, _, i) => sum + (i - meanIndex) ** 2, 0) || 1;
  const slope = slopeNum / slopeDen;

  const pointForecast = Math.max(0, weightedMean + slope * horizonPeriods);

  // Confidence band from sample variance - wider when history is noisy/short
  const variance = quantities.reduce((sum, q) => sum + (q - meanQty) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const margin = n < 4 ? stdDev * 1.5 : stdDev * 1.0;

  const confidence = Math.max(0.3, Math.min(0.95, 1 - stdDev / (meanQty || 1) / 2));

  return {
    pointForecast: Math.round(pointForecast * 100) / 100,
    lowerBound: Math.round(Math.max(0, pointForecast - margin) * 100) / 100,
    upperBound: Math.round((pointForecast + margin) * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    status: n < 3 ? 'INSUFFICIENT_DATA' : 'PUBLISHED',
    method: 'weighted_moving_average_with_trend',
  };
}

/**
 * Optional: enrich a statistical forecast with a Gemini-generated
 * explanation. Falls back to a templated explanation if no API key is
 * configured, so the feature degrades gracefully rather than failing.
 */
export async function explainForecast({ itemName, history, result }) {
  if (!USE_GEMINI) {
    return templatedExplanation({ itemName, history, result });
  }

  try {
    const prompt = buildExplanationPrompt({ itemName, history, result });
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' +
      `${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || templatedExplanation({ itemName, history, result });
  } catch (err) {
    console.error('[forecast.service] Gemini call failed, falling back to template', err.message);
    return templatedExplanation({ itemName, history, result });
  }
}

function templatedExplanation({ itemName, history, result }) {
  const periods = history.length;
  const trendWord = result.pointForecast >= average(history) ? 'rising' : 'easing';
  return (
    `Forecast for ${itemName} is based on the last ${periods} periods of demand history. ` +
    `The trend is ${trendWord} relative to the recent average, giving a point forecast of ` +
    `${result.pointForecast} units (range ${result.lowerBound}-${result.upperBound}) at ` +
    `${Math.round(result.confidence * 100)}% confidence.`
  );
}

function buildExplanationPrompt({ itemName, history, result }) {
  return `You are a supply planning assistant. In 2-3 concise sentences, explain this demand ` +
    `forecast for "${itemName}" to a procurement manager using only the numbers given - do not ` +
    `invent data. Forecast: ${JSON.stringify(result)}. Recent history (oldest to newest): ` +
    `${JSON.stringify(history.map((h) => Number(h.quantity)))}.`;
}

function average(history) {
  const qs = history.map((h) => Number(h.quantity));
  return qs.reduce((a, b) => a + b, 0) / (qs.length || 1);
}
