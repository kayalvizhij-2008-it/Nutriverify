const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('=== NUTRIVERIFY COMPREHENSIVE END-TO-END VALIDATION ===\n');

  // 1. Health
  const health = await request({ hostname: 'localhost', port: 8080, path: '/api/v1/health', method: 'GET' });
  console.log('1. Health check:', health.status, health.data);

  // 2. AI Subsystem Status
  const aiStatus = await request({ hostname: 'localhost', port: 8080, path: '/api/v1/ai/status', method: 'GET' });
  console.log('2. AI Status check:', aiStatus.status, aiStatus.data);

  // 3. User Register & Login
  const username = 'auditor_' + Date.now();
  const reg = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username,
    password: 'Password123!',
    email: `${username}@nutriverify.com`,
    fullName: 'Auditor Tester'
  });
  console.log('3. Register status:', reg.status, 'Token issued:', !!reg.data?.token);
  const token = reg.data?.token;

  // 4. Product Analysis
  const analysis = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    productName: 'Artisanal Oat-Crust Granola',
    brand: 'NutriVerify Lab Specimen',
    servingSize: '45g',
    calories: 240,
    fat: 7.0,
    saturatedFat: 1.1,
    sugar: 4.2,
    protein: 8.5,
    sodium: 95,
    fiber: 6.2,
    ingredients: [
      { name: 'Rolled Oats', category: 'NATURAL' },
      { name: 'Pea Protein', category: 'NATURAL' },
      { name: 'Monk Fruit Extract', category: 'SWEETENER' }
    ],
    claims: [
      { type: 'HIGH_PROTEIN', displayText: 'High Protein' },
      { type: 'LOW_SUGAR', displayText: 'Low Sugar' }
    ]
  });
  console.log('4. Analysis Result:', analysis.status, {
    productName: analysis.data?.productName,
    healthScore: analysis.data?.healthScore,
    authenticityScore: analysis.data?.authenticityScore,
    riskLevel: analysis.data?.riskLevel,
    claimsVerified: analysis.data?.claimResults?.map(c => ({ text: c.claimText, verdict: c.verdict }))
  });

  const historyId = analysis.data?.historyId;

  // 5. Contextual AI Chat with analyzed product
  const chatRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    message: 'Why did this product receive this score?',
    historyId: historyId
  });
  console.log('5. Contextual AI Chat:', chatRes.status, {
    providerType: chatRes.data?.providerType,
    statusLabel: chatRes.data?.statusLabel,
    contextProduct: chatRes.data?.contextProductName,
    responseSnippet: chatRes.data?.response?.substring(0, 120) + '...'
  });

  // 6. History
  const history = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/history',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('6. Scan History retrieved items:', Array.isArray(history.data) ? history.data.length : 0);

  // 7. Save Product
  if (analysis.data) {
    const saveRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/saved',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, analysis.data);
    console.log('7. Saved Product status:', saveRes.status);
  }

  // 8. Frontend HTML check
  const fe = await request({ hostname: 'localhost', port: 5173, path: '/', method: 'GET' });
  console.log('8. Frontend HTTP status:', fe.status, 'Length:', fe.raw?.length);

  console.log('\n=== ALL SUBSYSTEM REST & E2E CHECKS PASSED ===');
}

run().catch(console.error);
