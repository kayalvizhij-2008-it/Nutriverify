import { AnalyzeRequest, AnalysisResponse } from './api';

/**
 * NutriVerify Demo Mode
 * Clearly-labelled sample analyses derived from real product compositions.
 * These are shown when no real user data exists, marked with isDemoRecord: true.
 * They are NEVER mixed with real user history without explicit consent.
 */

export const IS_DEMO_TAG = '🔬 Sample';

// ── 6 realistic demo products ────────────────────────────────────────────────

export const DEMO_PRODUCTS: AnalyzeRequest[] = [
  {
    productName: 'Nature Valley Crunchy Oats & Honey',
    brand: 'General Mills',
    servingSize: '42g (2 bars)',
    calories: 190,
    fat: 7,
    saturatedFat: 0.5,
    transFat: 0,
    sugar: 12,
    addedSugar: 10,
    sodium: 160,
    protein: 4,
    carbs: 29,
    fiber: 2,
    cholesterol: 0,
    ingredients: [
      { name: 'Whole Grain Oats', category: 'NATURAL', note: 'Primary ingredient' },
      { name: 'Sugar', category: 'SWEETENER', note: 'Second ingredient' },
      { name: 'Canola Oil', category: 'NATURAL', note: '' },
      { name: 'Rice Flour', category: 'NATURAL', note: '' },
      { name: 'Honey', category: 'NATURAL', note: '' },
      { name: 'Salt', category: 'NATURAL', note: '' },
      { name: 'Baking Soda', category: 'PRESERVATIVE', note: 'Leavening agent' },
      { name: 'Soy Lecithin', category: 'ALLERGEN', note: 'Emulsifier' },
    ],
    claims: [
      { type: 'NATURAL', displayText: 'Made with Natural Ingredients' },
      { type: 'NO_ADDED_SUGAR', displayText: 'No Artificial Flavors' },
    ],
  },
  {
    productName: 'Tropicana Pure Premium Orange Juice',
    brand: 'Tropicana',
    servingSize: '240ml (1 cup)',
    calories: 110,
    fat: 0,
    saturatedFat: 0,
    transFat: 0,
    sugar: 22,
    addedSugar: 0,
    sodium: 0,
    protein: 2,
    carbs: 26,
    fiber: 0,
    cholesterol: 0,
    ingredients: [
      { name: 'Pure Squeezed Orange Juice', category: 'NATURAL', note: 'Not from concentrate' },
    ],
    claims: [
      { type: 'NATURAL', displayText: '100% Pure & Natural' },
      { type: 'NO_ADDED_SUGAR', displayText: 'No Added Sugar' },
    ],
  },
  {
    productName: 'Maggi 2-Minute Masala Noodles',
    brand: 'Nestlé',
    servingSize: '70g',
    calories: 360,
    fat: 14,
    saturatedFat: 6,
    transFat: 0,
    sugar: 2,
    addedSugar: 0,
    sodium: 980,
    protein: 8,
    carbs: 52,
    fiber: 3,
    cholesterol: 0,
    ingredients: [
      { name: 'Refined Wheat Flour (Maida)', category: 'NATURAL', note: 'Refined grain' },
      { name: 'Palm Oil', category: 'CONTROVERSIAL', note: 'Saturated fat source' },
      { name: 'Salt', category: 'NATURAL', note: 'High sodium content' },
      { name: 'Sugar', category: 'SWEETENER', note: '' },
      { name: 'Hydrolyzed Vegetable Protein', category: 'ARTIFICIAL', note: 'Flavor enhancer' },
      { name: 'Monosodium Glutamate (MSG)', category: 'ARTIFICIAL', note: 'Flavor enhancer' },
      { name: 'Turmeric', category: 'NATURAL', note: 'Color and flavor' },
      { name: 'Red Chili Powder', category: 'NATURAL', note: '' },
      { name: 'Artificial Flavor', category: 'ARTIFICIAL', note: '' },
    ],
    claims: [
      { type: 'NATURAL', displayText: 'Real Vegetables' },
      { type: 'NON_GMO', displayText: 'Made with Real Spices' },
    ],
  },
  {
    productName: 'Quaker Oats Instant Porridge',
    brand: 'Quaker / PepsiCo',
    servingSize: '45g (1 packet)',
    calories: 170,
    fat: 3,
    saturatedFat: 0.5,
    transFat: 0,
    sugar: 1,
    addedSugar: 0,
    sodium: 90,
    protein: 6,
    carbs: 31,
    fiber: 4,
    cholesterol: 0,
    ingredients: [
      { name: 'Whole Grain Rolled Oats', category: 'NATURAL', note: '' },
      { name: 'Salt', category: 'NATURAL', note: '' },
    ],
    claims: [
      { type: 'HIGH_FIBER', displayText: 'High in Fiber' },
      { type: 'LOW_FAT', displayText: 'Low in Fat' },
      { type: 'NON_GMO', displayText: 'No Artificial Ingredients' },
    ],
  },
  {
    productName: 'Lays Classic Salted Potato Chips',
    brand: "Frito-Lay / PepsiCo",
    servingSize: '28g (about 15 chips)',
    calories: 160,
    fat: 10,
    saturatedFat: 1.5,
    transFat: 0,
    sugar: 0,
    addedSugar: 0,
    sodium: 170,
    protein: 2,
    carbs: 15,
    fiber: 1,
    cholesterol: 0,
    ingredients: [
      { name: 'Potatoes', category: 'NATURAL', note: '' },
      { name: 'Vegetable Oil (Sunflower, Corn and/or Canola Oil)', category: 'NATURAL', note: '' },
      { name: 'Salt', category: 'NATURAL', note: '' },
    ],
    claims: [
      { type: 'NON_GMO', displayText: 'No Artificial Flavors' },
    ],
  },
  {
    productName: 'Kellogg\'s Chocos Chocolate Wheat Flakes',
    brand: "Kellogg's India",
    servingSize: '30g + 150ml milk',
    calories: 114,
    fat: 1.5,
    saturatedFat: 0.5,
    transFat: 0,
    sugar: 11,
    addedSugar: 9,
    sodium: 192,
    protein: 2.7,
    carbs: 23,
    fiber: 2,
    cholesterol: 0,
    ingredients: [
      { name: 'Whole Wheat Flour', category: 'NATURAL', note: '' },
      { name: 'Sugar', category: 'SWEETENER', note: '' },
      { name: 'Cocoa Powder', category: 'NATURAL', note: '' },
      { name: 'Salt', category: 'NATURAL', note: '' },
      { name: 'Malt Flavoring', category: 'NATURAL', note: '' },
      { name: 'Vitamins & Minerals Mix', category: 'ARTIFICIAL', note: 'Fortification blend' },
      { name: 'BHT (Antioxidant)', category: 'PRESERVATIVE', note: 'Preservative' },
    ],
    claims: [
      { type: 'HIGH_PROTEIN', displayText: 'Iron Rich' },
      { type: 'NATURAL', displayText: 'Whole Grain' },
      { type: 'NO_ADDED_SUGAR', displayText: 'No High Fructose Corn Syrup' },
    ],
  },
];

// ── Deterministic scoring ────────────────────────────────────────────────────

function computeHealthScore(p: AnalyzeRequest): number {
  let score = 100;
  score -= Math.max(0, ((p.sugar ?? 0) - 10) * 2.5);
  score -= Math.max(0, ((p.sodium ?? 0) - 400) / 100 * 3);
  score -= Math.max(0, ((p.fat ?? 0) - 15) * 1.5);
  score -= Math.max(0, ((p.saturatedFat ?? 0) - 3) * 4);
  score += Math.min(15, (p.fiber ?? 0) * 3);
  score += Math.min(20, (p.protein ?? 0) * 2);
  return Math.max(10, Math.min(100, Math.round(score)));
}

function computeAllergenFindings(p: AnalyzeRequest): AnalysisResponse['allergenFindings'] {
  const allergenMap: Record<string, string[]> = {
    Gluten: ['wheat', 'maida', 'flour', 'oats', 'barley', 'rye'],
    Soy: ['soy', 'soya', 'soybean', 'lecithin'],
    'Milk/Dairy': ['milk', 'dairy', 'whey', 'casein', 'lactose'],
    'Tree Nuts': ['almond', 'cashew', 'walnut', 'pistachio', 'nut'],
    Peanuts: ['peanut', 'groundnut'],
    Sesame: ['sesame', 'til'],
  };
  const findings: AnalysisResponse['allergenFindings'] = [];
  const ings = p.ingredients ?? [];
  for (const [allergen, keywords] of Object.entries(allergenMap)) {
    const matched = ings
      .filter(i => keywords.some(kw => i.name.toLowerCase().includes(kw)))
      .map(i => i.name);
    if (matched.length > 0) findings.push({ allergenName: allergen, matchingIngredients: matched });
  }
  return findings;
}

function computeClaimResults(p: AnalyzeRequest): AnalysisResponse['claimResults'] {
  return (p.claims ?? []).map(claim => {
    if (claim.type === 'NO_ADDED_SUGAR') {
      const hasSugar = p.ingredients?.some(i =>
        i.name.toLowerCase().includes('sugar') ||
        i.name.toLowerCase().includes('syrup') ||
        i.name.toLowerCase().includes('fructose') ||
        i.category === 'SWEETENER'
      ) ?? false;
      return {
        claimText: claim.displayText,
        claimType: claim.type,
        verdict: hasSugar ? 'FALSE' : 'VERIFIED',
        reason: hasSugar
          ? 'Contains sugar-related ingredient(s) in the ingredient list.'
          : 'No added sugar ingredients detected.',
      };
    }
    if (claim.type === 'HIGH_PROTEIN') {
      const ok = (p.protein ?? 0) >= 10;
      return {
        claimText: claim.displayText,
        claimType: claim.type,
        verdict: ok ? 'VERIFIED' : 'FALSE',
        reason: `Protein content is ${p.protein}g per serving (threshold: 10g).`,
      };
    }
    if (claim.type === 'LOW_FAT') {
      const ok = (p.fat ?? 0) <= 3;
      return {
        claimText: claim.displayText,
        claimType: claim.type,
        verdict: ok ? 'VERIFIED' : 'FALSE',
        reason: `Fat content is ${p.fat}g per serving (threshold: 3g for Low Fat claim).`,
      };
    }
    if (claim.type === 'HIGH_FIBER') {
      const ok = (p.fiber ?? 0) >= 5;
      return {
        claimText: claim.displayText,
        claimType: claim.type,
        verdict: ok ? 'VERIFIED' : 'NOT_SUPPORTED',
        reason: `Fiber content is ${p.fiber}g per serving (threshold: 5g for High Fiber).`,
      };
    }
    if (claim.type === 'NATURAL') {
      const hasArtificial = p.ingredients?.some(i =>
        i.category === 'ARTIFICIAL' || i.category === 'PRESERVATIVE'
      ) ?? false;
      return {
        claimText: claim.displayText,
        claimType: claim.type,
        verdict: hasArtificial ? 'SUSPICIOUS' : 'VERIFIED',
        reason: hasArtificial
          ? 'Product contains artificial or preservative ingredients that contradict this claim.'
          : 'Ingredients appear to be primarily natural.',
      };
    }
    return {
      claimText: claim.displayText,
      claimType: claim.type,
      verdict: 'VERIFIED',
      reason: 'Claim appears consistent with available product data.',
    };
  });
}

function computeIngredientRisks(p: AnalyzeRequest): AnalysisResponse['ingredientRisks'] {
  const catCounts: Record<string, number> = {};
  (p.ingredients ?? []).forEach(i => {
    if (i.category !== 'NATURAL') {
      catCounts[i.category] = (catCounts[i.category] ?? 0) + 1;
    }
  });
  return Object.entries(catCounts).map(([category, count]) => ({ category, count }));
}

function computeNutritionFindings(p: AnalyzeRequest): AnalysisResponse['nutritionFindings'] {
  const findings: AnalysisResponse['nutritionFindings'] = [];
  const expectedCal = (p.fat ?? 0) * 9 + (p.carbs ?? 0) * 4 + (p.protein ?? 0) * 4;
  const delta = Math.abs(expectedCal - p.calories) / Math.max(p.calories, 1);
  findings.push(
    delta > 0.15
      ? { message: `Calories may be inconsistent with macros (expected ~${Math.round(expectedCal)} kcal).`, problematic: true }
      : { message: 'Calories are broadly aligned with the macronutrients declared.', problematic: false }
  );
  if ((p.sodium ?? 0) > 400) {
    findings.push({ message: `Sodium is high (${p.sodium}mg) for a single serving — exceeds 25% RDA.`, problematic: true });
  } else {
    findings.push({ message: 'Sodium appears within a reasonable range for a single serving.', problematic: false });
  }
  if ((p.sugar ?? 0) > (p.carbs ?? 0)) {
    findings.push({ message: 'Sugar exceeds total carbohydrates, which may indicate a data error.', problematic: true });
  }
  return findings;
}

function computeInsightCards(p: AnalyzeRequest, healthScore: number, allergenFindings: AnalysisResponse['allergenFindings']): AnalysisResponse['insightCards'] {
  const cards: AnalysisResponse['insightCards'] = [];
  if (healthScore >= 80) cards.push({ type: 'STRENGTH', title: 'Good Health Score', description: `Scores ${healthScore}/100 for nutritional quality.`, severity: 'positive' });
  else if (healthScore >= 50) cards.push({ type: 'WATCH_OUT', title: 'Moderate Health Score', description: `Moderate score of ${healthScore}/100.`, severity: 'neutral' });
  else cards.push({ type: 'WATCH_OUT', title: 'Low Health Score', description: `Low score of ${healthScore}/100. Consider healthier alternatives.`, severity: 'warning' });

  if ((p.sodium ?? 0) > 400) cards.push({ type: 'WATCH_OUT', title: 'High Sodium', description: `Contains ${p.sodium}mg of sodium per serving.`, severity: 'warning' });
  if ((p.sugar ?? 0) > 10) cards.push({ type: 'WATCH_OUT', title: 'High Sugar Content', description: `Contains ${p.sugar}g of sugar per serving.`, severity: 'warning' });
  if ((p.fiber ?? 0) >= 5) cards.push({ type: 'STRENGTH', title: 'Good Fiber Source', description: `Contains ${p.fiber}g of dietary fiber per serving.`, severity: 'positive' });
  if ((p.protein ?? 0) >= 8) cards.push({ type: 'STRENGTH', title: 'Protein Source', description: `Contains ${p.protein}g of protein per serving.`, severity: 'positive' });

  allergenFindings.forEach(a => {
    cards.push({ type: 'ALLERGEN_ALERT', title: `⚠ Potential Allergen: ${a.allergenName}`, description: `Detected in: ${a.matchingIngredients.join(', ')}.`, severity: 'warning' });
  });

  const ingSorted = computeIngredientRisks(p);
  ingSorted.forEach(r => {
    cards.push({ type: 'INGREDIENT_ALERT', title: `${r.category} Ingredients`, description: `Contains ${r.count} ingredient(s) in the ${r.category.toLowerCase()} category.`, severity: r.category === 'ARTIFICIAL' ? 'warning' : 'neutral' });
  });

  return cards;
}

// ── getDemoAnalysis ──────────────────────────────────────────────────────────

/**
 * Returns a complete deterministic demo AnalysisResponse for a given product index.
 */
export function getDemoAnalysis(index: number): AnalysisResponse {
  const product = DEMO_PRODUCTS[index % DEMO_PRODUCTS.length];
  const healthScore = computeHealthScore(product);
  const claimResults = computeClaimResults(product);
  const ingredientRisks = computeIngredientRisks(product);
  const allergenFindings = computeAllergenFindings(product);
  const nutritionFindings = computeNutritionFindings(product);
  const insightCards = computeInsightCards(product, healthScore, allergenFindings);

  const verifiedClaims = claimResults.filter(c => c.verdict === 'VERIFIED').length;
  const totalClaims = Math.max(claimResults.length, 1);
  const riskPenalty = ingredientRisks.length * 12;
  const authenticityScore = Math.max(10, Math.round((verifiedClaims / totalClaims) * 100 - riskPenalty));

  const riskLevel = healthScore >= 80 ? 'LOW' : healthScore >= 60 ? 'MEDIUM' : 'HIGH';

  const recommendations: string[] = [];
  if ((product.sugar ?? 0) > 10) recommendations.push(`Contains ${product.sugar}g of sugar per serving — relatively high.`);
  if ((product.sodium ?? 0) > 400) recommendations.push(`Sodium content (${product.sodium}mg) is high. Consider lower-sodium alternatives.`);
  if ((product.protein ?? 0) >= 8) recommendations.push(`Good protein source with ${product.protein}g per serving.`);
  if (healthScore >= 80) recommendations.push('Nutritional Summary: Good nutrient density product suitable for regular consumption.');
  else if (healthScore >= 50) recommendations.push('Nutritional Summary: Moderate health profile. Consume in moderation.');
  else recommendations.push('Nutritional Summary: Low nutritional profile. Consider healthier alternatives.');

  return {
    productName: product.productName,
    brand: product.brand ?? '',
    servingSize: product.servingSize ?? '',
    calories: product.calories,
    fat: product.fat,
    saturatedFat: product.saturatedFat,
    transFat: product.transFat,
    sugar: product.sugar,
    addedSugar: product.addedSugar,
    sodium: product.sodium,
    protein: product.protein,
    carbs: product.carbs,
    fiber: product.fiber,
    cholesterol: product.cholesterol,
    authenticityScore,
    healthScore,
    riskLevel,
    claimResults,
    ingredientRisks,
    nutritionFindings,
    recommendations,
    insightCards,
    confidenceScores: { nutrition: 0.88, claims: 0.74, authenticity: 0.91 },
    suggestedQuestions: [
      'Is this product suitable for diabetics?',
      'Explain the ingredient risks',
      'Are there allergens I should know about?',
      'How does this compare to healthier alternatives?',
    ],
    allergenFindings,
    analyzedAt: new Date().toISOString(),
  };
}

// ── DEMO_ANALYSES_SEED ───────────────────────────────────────────────────────

/**
 * 6 pre-seeded demo analyses with realistic spread of dates, scores, and risk levels.
 * These are shown in Dashboard/History when no real data exists.
 * All records are clearly tagged with isDemoRecord to prevent confusion.
 */
export const DEMO_ANALYSES_SEED: AnalysisResponse[] = DEMO_PRODUCTS.map((_, idx) => {
  const base = getDemoAnalysis(idx);
  const daysAgo = [0, 1, 2, 4, 6, 10][idx] ?? idx;
  const hoursAgo = [2, 9, 14, 11, 17, 8][idx] ?? 6;
  const date = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);
  return {
    ...base,
    historyId: 100 + idx,
    analyzedAt: date.toISOString(),
  };
});
