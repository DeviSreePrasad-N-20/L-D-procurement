import { explainDemandForecast } from './src/services/ai.service.js';

async function run() {
  console.log('Testing AI Service...');
  const result = await explainDemandForecast({
    itemName: 'PMP Certification Voucher',
    history: [{ periodStart: '2023-01', quantity: 10 }, { periodStart: '2023-02', quantity: 15 }],
    result: { pointForecast: 20, confidence: 0.85 }
  });
  console.log('\nAI Response:\n', result);
}

run();
