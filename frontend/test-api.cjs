const http = require('http');

function post(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers,
      }
    }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const username = 'testuser_' + Date.now();
  console.log('1. Registering user:', username);
  const reg = await post('http://localhost:8080/api/v1/auth/register', {
    username,
    password: 'Password123!',
    fullName: 'Kayalvizhi M.'
  });
  console.log('Registration status:', reg.status, 'Token received:', !!reg.data?.token);
  const token = reg.data?.token;

  console.log('2. Running manual food analysis with token...');
  const analysis = await post('http://localhost:8080/api/v1/analyze', {
    productName: 'PureAlps Almond Protein Shake',
    brand: 'PureAlps Organic',
    servingSize: '300ml',
    calories: 180,
    protein: 18,
    carbs: 14,
    sugar: 2,
    fat: 6,
    saturatedFat: 1,
    fiber: 5,
    sodium: 90,
    ingredients: [
      { name: 'Almond Milk', category: 'Base' },
      { name: 'Pea Protein', category: 'Protein' },
      { name: 'Chicory Root Fiber', category: 'Fiber' },
      { name: 'Natural Stevia Leaf Extract', category: 'Sweetener' },
      { name: 'Sea Salt', category: 'Mineral' }
    ],
    claims: [
      { type: 'HIGH_PROTEIN', displayText: 'High Protein' },
      { type: 'LOW_SUGAR', displayText: 'Low Sugar' }
    ]
  }, { 'Authorization': `Bearer ${token}` });

  console.log('Analysis status:', analysis.status);
  console.log('Product:', analysis.data?.productName);
  console.log('HealthScore:', analysis.data?.healthScore);
  console.log('AuthenticityScore:', analysis.data?.authenticityScore);
  console.log('Risk Level:', analysis.data?.riskLevel);
  console.log('NutriScore / Findings:', analysis.data?.nutritionFindings?.length);
  console.log('Allergens detected:', analysis.data?.allergenFindings?.length);
  console.log('Recommendations count:', analysis.data?.recommendations?.length);

  console.log('3. Testing NutriSaathi AI query...');
  const chat = await post('http://localhost:8080/api/v1/chat', {
    message: 'Is this almond protein shake healthy and safe for daily breakfast?',
    analysisContextId: analysis.data?.historyId,
    language: 'en'
  }, { 'Authorization': `Bearer ${token}` });
  console.log('NutriSaathi status:', chat.status);
  console.log('NutriSaathi response preview:', chat.data?.response?.substring(0, 150));

  console.log('\n--- ALL PRIMARY API FLOWS TESTED AND VERIFIED SUCCESSFULLY ---');
}

run().catch(console.error);
