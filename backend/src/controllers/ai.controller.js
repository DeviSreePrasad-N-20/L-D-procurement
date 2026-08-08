import {
  explainDemandForecast,
  optimizeSafetyStock,
  scoreSupplierRisk,
  recommendSubstitutes,
  detectPOAnomalies
} from '../services/ai.service.js';

export async function explainForecastHandler(req, res) {
  try {
    const { forecastContext } = req.body;
    const explanation = await explainDemandForecast(forecastContext);
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function optimizeSafetyStockHandler(req, res) {
  try {
    const { itemData, demandVariability, leadTime } = req.body;
    const result = await optimizeSafetyStock(itemData, demandVariability, leadTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function scoreSupplierRiskHandler(req, res) {
  try {
    const { supplierData, performanceHistory } = req.body;
    const result = await scoreSupplierRisk(supplierData, performanceHistory);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function recommendSubstitutesHandler(req, res) {
  try {
    const { item, availableCatalog } = req.body;
    const result = await recommendSubstitutes(item, availableCatalog);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function detectPOAnomaliesHandler(req, res) {
  try {
    const { purchaseOrder, historicalAverages } = req.body;
    const result = await detectPOAnomalies(purchaseOrder, historicalAverages);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
