import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const getModel = () => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
};

export async function explainDemandForecast(forecastContext) {
  if (!genAI) return 'AI explanations are currently unavailable. Ensure GEMINI_API_KEY is set.';
  try {
    const model = getModel();
    const prompt = `You are an expert supply chain planner for an Enterprise Learning & Development (L&D) team. 
    Analyze the following demand forecast for the item "${forecastContext.itemName}". 
    History (last few periods): ${JSON.stringify(forecastContext.history)}
    Forecast Result: ${JSON.stringify(forecastContext.result)}
    Provide a concise, 2-3 sentence business explanation for the forecast trend and how confident we should be.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in explainDemandForecast:', error);
    return 'Failed to generate AI explanation.';
  }
}

export async function optimizeSafetyStock(itemData, demandVariability, leadTime) {
  if (!genAI) return { recommendedSafetyStock: null, explanation: 'AI unavailable' };
  try {
    const model = getModel();
    const prompt = `You are a supply chain optimization AI. Calculate a recommended safety stock and provide reasoning.
    Item: ${itemData.name} (Category: ${itemData.category})
    Demand Variability (Standard Deviation): ${demandVariability}
    Lead Time (Days): ${leadTime}
    Service Level Target: 95%
    Current On-Hand: ${itemData.currentStock}
    
    Output JSON strictly in this format:
    {
      "recommendedSafetyStock": <number>,
      "explanation": "<string explaining the calculation and business impact>"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in optimizeSafetyStock:', error);
    return { recommendedSafetyStock: null, explanation: 'Failed to compute safety stock' };
  }
}

export async function scoreSupplierRisk(supplierData, performanceHistory) {
  if (!genAI) return { riskScore: 'MEDIUM', explanation: 'AI unavailable' };
  try {
    const model = getModel();
    const prompt = `You are a procurement risk analyst AI. Assess this supplier's risk.
    Supplier Name: ${supplierData.name}
    Historical Performance metrics: ${JSON.stringify(performanceHistory)}
    
    Output JSON strictly in this format:
    {
      "riskScore": "LOW" | "MEDIUM" | "HIGH",
      "explanation": "<string justifying the score based on the metrics provided>"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in scoreSupplierRisk:', error);
    return { riskScore: 'MEDIUM', explanation: 'Failed to generate risk score' };
  }
}

export async function recommendSubstitutes(item, availableCatalog) {
  if (!genAI) return { substitutes: [], explanation: 'AI unavailable' };
  try {
    const model = getModel();
    const prompt = `You are an L&D inventory assistant. The requested item "${item.name}" (Category: ${item.category}) is out of stock.
    Here is the available catalog: ${JSON.stringify(availableCatalog.map(i => ({ id: i.id, name: i.name, category: i.category }))) }
    
    Recommend up to 3 substitutes.
    Output JSON strictly in this format:
    {
      "substitutes": ["<item_id_1>", "<item_id_2>"],
      "explanation": "<string explaining why these are good substitutes>"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in recommendSubstitutes:', error);
    return { substitutes: [], explanation: 'Failed to find substitutes' };
  }
}

export async function detectPOAnomalies(purchaseOrder, historicalAverages) {
  if (!genAI) return { isAnomaly: false, explanation: 'AI unavailable' };
  try {
    const model = getModel();
    const prompt = `You are an AI financial auditor. Detect if this Purchase Order is anomalous.
    PO Data: ${JSON.stringify(purchaseOrder)}
    Historical Averages: ${JSON.stringify(historicalAverages)}
    
    Check for unusually high quantities, unit costs, or unexpected suppliers.
    Output JSON strictly in this format:
    {
      "isAnomaly": <boolean>,
      "explanation": "<string detailing any concerns or confirming it looks normal>"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error in detectPOAnomalies:', error);
    return { isAnomaly: false, explanation: 'Failed to analyze PO' };
  }
}
