import { AnalyzeRequest, AnalysisResponse } from './api';

/**
 * Demo Mode - clearly labeled sample data for presentations.
 * All demo data is explicitly marked and never mixed with real user data.
 */

export const DEMO_PRODUCTS: AnalyzeRequest[] = [
  {
    productName: 'Nature Valley Crunchy Oats & Honey',
    brand: 'General Mills',
    servingSize: '42g (2 bars)',
    calories: 190,
    fat: 7,
    sugar: 12,
    sodium: 160,
    protein: 4,
    carbs: 29,
    fiber: 2,
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
    sugar: 22,
    sodium: 0,
    protein: 2,
    carbs: 26,
    fiber: 0,
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
    sugar: 2,
    sodium: 980,
    protein: 8,
    carbs: 52,
    fiber: 3,
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
];

/**
 * Returns a demo analysis result for the given product index.
 */
export function getDemoAnalysis(index: number): AnalysisResponse {
  const product = DEMO_PRODUCTS[index % DEMO_PRODUCTS.length];

  // Deterministic scoring based on product data
  let healthScore = 100;
  healthScore -= Math.max(0, (product.sugar - 10) * 2.5);
  healthScore -= Math.max(0, (product.sodium - 400) / 100 * 3);
  healthScore -= Math.max(0, (product.fat - 15) * 1.5);
  healthScore += Math.min(15, product.fiber * 3);
  healthScore += Math.min(20, product.protein * 2);
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let authenticityScore = 100;
  if (product.claims && product.claims.length > 0) {
    // Check claims against actual data
    const claimResults: AnalysisResponse['claimResults'] = product.claims.map(claim => {
      if (claim.type === 'NO_ADDED_SUGAR') {
        const hasSugar = product.ingredients?.some(i =>
          i.name.toLowerCase().includes('sugar') || i.category === 'SWEETENER'
        );
        return {
          claimText: claim.displayText,
          claimType: claim.type,
          verdict: hasSugar ? 'FALSE' : 'VERIFIED',
          reason: hasSugar
            ? `Contains sugar-related ingredient(s) in the ingredient list.`
            : 'No sugar-related ingredients detected.',
        };
      }
      if (claim.type === 'HIGH_PROTEIN') {
        return {
          claimText: claim.displayText,
          claimType: claim.type,
          verdict: product.protein >= 10 ? 'VERIFIED' : 'NOT_SUPPORTED',
          reason: `Protein content is ${product.protein}g (threshold: 10g).`,
        };
      }
      if (claim.type === 'LOW_FAT') {
        return {
          claimText: claim.displayText,
          claimType: claim.type,
          verdict: product.fat <= 3 ? 'VERIFIED' : 'NOT_SUPPORTED',
          reason: `Fat content is ${product.fat}g (threshold: 3g).`,
        };
      }
      if (claim.type === 'NATURAL') {
        const hasArtificial = product.ingredients?.some(i =>
          i.category === 'ARTIFICIAL' || i.category === 'PRESERVATIVE'
        );
        return {
          claimText: claim.displayText,
          claimType: claim.type,
          verdict: hasArtificial ? 'SUSPICIOUS' : 'VERIFIED',
          reason: hasArtificial
            ? 'Product contains artificial or processed ingredients.'
            : 'Ingredients appear to be primarily natural.',
        };
      }
      return {
        claimText: claim.displayText,
        claimType: claim.type,
        verdict: 'VERIFIED',
        reason: 'Claim appears to be supported by the available data.',
      };
    });

    authenticityScore = Math.round(
      claimResults.filter(c => c.verdict === 'VERIFIED').length / claimResults.length * 100
    );

    const ingredientRisks: AnalysisResponse['ingredientRisks'] = [];
    if (product.ingredients) {
      const catCounts: Record<string, number> = {};
      product.ingredients.forEach(i => {
        if (i.category !== 'NATURAL') {
          catCounts[i.category] = (catCounts[i.category] || 0) + 1;
        }
      });
      Object.entries(catCounts).forEach(([cat, count]) => {
        ingredientRisks.push({ category: cat, count });
      });
      authenticityScore -= ingredientRisks.length * 15;
    }

    const riskLevel = authenticityScore >= 85 ? 'TRUSTED' :
      authenticityScore >= 65 ? 'LOW_RISK' :
      authenticityScore >= 40 ? 'MODERATE_RISK' : 'HIGH_RISK';

    const nutritionFindings: AnalysisResponse['nutritionFindings'] = [];
    const expectedCal = product.fat * 9 + product.carbs * 4 + product.protein * 4;
    const delta = Math.abs(expectedCal - product.calories) / Math.max(product.calories, 1);
    if (delta > 0.15) {
      nutritionFindings.push({
        message: `Calories may be inconsistent (expected ~${Math.round(expectedCal)} kcal).`,
        problematic: true,
      });
    } else {
      nutritionFindings.push({
        message: 'Calories are broadly aligned with the macronutrients.',
        problematic: false,
      });
    }
    if (product.sodium > 400) {
      nutritionFindings.push({
        message: `Sodium is high (${product.sodium}mg) for a single serving.`,
        problematic: true,
      });
    } else {
      nutritionFindings.push({
        message: 'Sodium appears within a reasonable range.',
        problematic: false,
      });
    }
    if (product.sugar > product.carbs) {
      nutritionFindings.push({
        message: 'Sugar exceeds total carbohydrates, which is internally inconsistent.',
        problematic: true,
      });
    }

    const recommendations: string[] = [];
    if (product.sugar > 10) recommendations.push(`This product contains ${product.sugar}g of sugar per serving, which is relatively high.`);
    if (product.sodium > 400) recommendations.push(`Sodium content (${product.sodium}mg) is high. Consider lower-sodium alternatives.`);
    if (product.protein >= 10) recommendations.push(`Good source of protein with ${product.protein}g per serving.`);
    if (healthScore >= 80) recommendations.push('Nutritional Summary: Good nutrient density product.');
    else if (healthScore >= 50) recommendations.push('Nutritional Summary: Moderate health profile. Consume in moderation.');
    else recommendations.push('Nutritional Summary: Consider healthier alternatives due to low nutritional profile.');

    const insightCards: AnalysisResponse['insightCards'] = [];
    if (healthScore >= 80) insightCards.push({ type: 'STRENGTH', title: 'Good Health Score', description: `Scores ${healthScore}/100 for nutritional quality.`, severity: 'positive' });
    else if (healthScore >= 50) insightCards.push({ type: 'WATCH_OUT', title: 'Moderate Health Score', description: `Moderate score of ${healthScore}/100.`, severity: 'neutral' });
    else insightCards.push({ type: 'WATCH_OUT', title: 'Low Health Score', description: `Low score of ${healthScore}/100. Consider healthier alternatives.`, severity: 'warning' });
    if (product.sodium > 400) insightCards.push({ type: 'WATCH_OUT', title: 'High Sodium', description: `Contains ${product.sodium}mg of sodium per serving.`, severity: 'warning' });
    if (product.sugar > 10) insightCards.push({ type: 'WATCH_OUT', title: 'High Sugar Content', description: `Contains ${product.sugar}g of sugar per serving.`, severity: 'warning' });

    const suggestedQuestions = ['Explain this product', 'Why is the health score moderate?', 'What ingredients should I watch?', 'Are there allergens?'];    return {
      productName: product.productName,
      brand: product.brand || '',
      servingSize: product.servingSize || '',
      calories: product.calories,
      fat: product.fat,
      sugar: product.sugar,
      sodium: product.sodium,
      protein: product.protein,
      carbs: product.carbs,
      fiber: product.fiber,
      authenticityScore: Math.max(0, authenticityScore),
      healthScore,
      riskLevel,
      claimResults: claimResults || [],
      ingredientRisks: ingredientRisks || [],
      nutritionFindings,
      recommendations,
      insightCards,
      confidenceScores: {},
      suggestedQuestions,
      allergenFindings: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  return {
    productName: product.productName,
    brand: product.brand || '',
    servingSize: product.servingSize || '',
    calories: product.calories,
    fat: product.fat,
    sugar: product.sugar,
    sodium: product.sodium,
    protein: product.protein,
    carbs: product.carbs,
    fiber: product.fiber,
    authenticityScore,
    healthScore,
    riskLevel: healthScore >= 80 ? 'TRUSTED' : 'LOW_RISK',
    claimResults: [],
    ingredientRisks: [],
    nutritionFindings: [],
    recommendations: [],
    insightCards: [],
    confidenceScores: {},
    suggestedQuestions: [],
    allergenFindings: [],
    analyzedAt: new Date().toISOString(),
  };
}
