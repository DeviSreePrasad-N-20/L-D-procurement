import { Router } from 'express';
import {
  explainForecastHandler,
  optimizeSafetyStockHandler,
  scoreSupplierRiskHandler,
  recommendSubstitutesHandler,
  detectPOAnomaliesHandler
} from '../controllers/ai.controller.js';
// Add authentication and RBAC middlewares here if needed

const router = Router();

router.post('/explain-forecast', explainForecastHandler);
router.post('/optimize-safety-stock', optimizeSafetyStockHandler);
router.post('/score-supplier-risk', scoreSupplierRiskHandler);
router.post('/recommend-substitutes', recommendSubstitutesHandler);
router.post('/detect-po-anomalies', detectPOAnomaliesHandler);

export default router;
