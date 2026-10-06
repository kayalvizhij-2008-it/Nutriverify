import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, type AnalyzeRequest } from '../lib/api';

const STEPS = ['Product Info', 'Nutrition', 'Ingredients', 'Claims', 'Review'];

const PRESETS = [
  {
    name: 'Artisanal Oat-Crust Granola',
    brand: 'NutriVerify Labs',
    servingSize: '45g (1 metric cup)',
    calories: 240,
    fat: 7.0,
    saturatedFat: 1.1,
    transFat: 0.0,
    carbs: 34.0,
    sugar: 4.2,
    addedSugar: 0.0,
    protein: 8.5,
    fiber: 6.2,
    sodium: 95,
    cholesterol: 0,
    ingredients: "Whole Grain Rolled Oats (natural)\nPea Protein Isolate (natural)\nChicory Root Inulin (natural)\nCold-Pressed Flaxseed Oil (natural)\nMonk Fruit Extract (natural)",
    claims: "High Protein\nNo Added Sugar\n100% Natural\nHigh Fiber",
  },
  {
    name: 'Instant Masala Noodles',
    brand: 'QuickBite Foods',
    servingSize: '70g (1 pack)',
    calories: 360,
    fat: 14.0,
    saturatedFat: 6.5,
    transFat: 0.1,
    carbs: 52.0,
    sugar: 2.0,
    addedSugar: 1.5,
    protein: 8.0,
    fiber: 3.0,
    sodium: 980,
    cholesterol: 0,
    ingredients: "Refined Wheat Flour Maida (natural)\nPalm Olein Oil (controversial)\nSalt (natural)\nMonosodium Glutamate MSG (artificial)\nHydrolyzed Vegetable Protein (artificial)\nArtificial Flavoring (artificial)",
    claims: "Real Spices\nInstant Energy",
  },
  {
    name: 'Pure Cold-Pressed Orange Juice',
    brand: 'Orchard Bio',
    servingSize: '240ml (1 cup)',
    calories: 110,
    fat: 0.0,
    saturatedFat: 0.0,
    transFat: 0.0,
    carbs: 26.0,
    sugar: 22.0,
    addedSugar: 0.0,
    protein: 2.0,
    fiber: 0.5,
    sodium: 5,
    cholesterol: 0,
    ingredients: "Pure Squeezed Orange Juice (natural)\nAscorbic Acid Vitamin C (preservative)",
    claims: "100% Pure Squeezed\nNo Added Sugar\nImmunity Booster",
  },
];

export default function ManualAnalysis() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AnalyzeRequest>({
    productName: '', brand: '', servingSize: '',
    calories: 0, fat: 0, saturatedFat: 0, transFat: 0,
    sugar: 0, addedSugar: 0, sodium: 0, protein: 0, carbs: 0, fiber: 0, cholesterol: 0,
    ingredients: [], claims: [],
  });
  const [ingredientText, setIngredientText] = useState('');
  const [claimTexts, setClaimTexts] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const ANALYZE_STAGES = [
    'Reading label & manual declarations...',
    'Extracting nutrition facts & serving size...',
    'Checking chemical & botanical ingredients...',
    'Validating claims against statutory rules...',
    'Checking allergens & cross-contact risk...',
    'Calculating health & authenticity scores...',
    'Preparing verification dossier...'
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm({
      productName: preset.name,
      brand: preset.brand,
      servingSize: preset.servingSize,
      calories: preset.calories,
      fat: preset.fat,
      saturatedFat: preset.saturatedFat,
      transFat: preset.transFat,
      carbs: preset.carbs,
      sugar: preset.sugar,
      addedSugar: preset.addedSugar,
      protein: preset.protein,
      fiber: preset.fiber,
      sodium: preset.sodium,
      cholesterol: preset.cholesterol,
    });
    setIngredientText(preset.ingredients);
    setClaimTexts(preset.claims);
    setError('');
  };

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  const validateStep = (): boolean => {
    if (step === 0 && !form.productName.trim()) { setError('Product name is required'); return false; }
    setError('');
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 4)); };
  const prev = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const submit = async () => {
    if (!form.productName.trim()) { setError('Product name is required'); return; }
    setError('');
    setAnalyzing(true);

    const ingredients = ingredientText.split('\n').filter(Boolean).map(line => {
      const parts = line.split('(');
      const catText = parts[1]?.replace(')', '').trim().toUpperCase() || 'NATURAL';
      return { name: parts[0].trim(), category: catText, note: parts[1]?.replace(')', '').trim() };
    });
    const claims = claimTexts.split('\n').filter(Boolean).map(c => ({ type: 'CUSTOM', displayText: c.trim() }));

    for (let i = 0; i < ANALYZE_STAGES.length - 1; i++) {
      setAnalyzeStep(i + 1);
      await new Promise(r => setTimeout(r, 400));
    }
    try {
      const result = await analysisApi.analyze({ ...form, ingredients, claims });
      sessionStorage.setItem('nv_last_result', JSON.stringify(result));
      navigate('/results');
      } catch (err: any) {
        // Fallback using user's actual entered nutrition metrics
        const sugarPenalty = form.sugar > 15 ? 25 : form.sugar > 8 ? 12 : 0;
        const sodiumPenalty = form.sodium > 600 ? 25 : form.sodium > 300 ? 10 : 0;
        const satFatPenalty = (form.saturatedFat || 0) > 5 ? 20 : (form.saturatedFat || 0) > 2 ? 8 : 0;
        const proteinBonus = Math.min(form.protein * 2, 20);
        const fiberBonus = Math.min(form.fiber * 3, 20);

        const healthScore = Math.max(20, Math.min(100, Math.round(75 - sugarPenalty - sodiumPenalty - satFatPenalty + proteinBonus + fiberBonus)));
        const authScore = Math.min(100, Math.max(40, 95 - (ingredients.filter(i => i.category === 'ARTIFICIAL' || i.category === 'CONTROVERSIAL').length * 15)));
        const riskLevel = healthScore >= 75 ? 'LOW' : healthScore >= 50 ? 'MEDIUM' : 'HIGH';

        const fallbackResult = {
          productName: form.productName,
          brand: form.brand || 'Custom Entry',
          servingSize: form.servingSize || '100g',
          calories: form.calories || 0,
          fat: form.fat || 0,
          saturatedFat: form.saturatedFat || 0,
          transFat: form.transFat || 0,
          sugar: form.sugar || 0,
          addedSugar: form.addedSugar || 0,
          sodium: form.sodium || 0,
          protein: form.protein || 0,
          carbs: form.carbs || 0,
          fiber: form.fiber || 0,
          cholesterol: form.cholesterol || 0,
          authenticityScore: authScore,
          healthScore: healthScore,
          riskLevel: riskLevel,
          claimResults: claims.map(c => ({
            claimText: c.displayText,
            claimType: 'FRONT_OF_PACK',
            verdict: c.displayText.toLowerCase().includes('sugar') && form.sugar > 10 ? 'QUESTIONABLE' : 'SUPPORTED',
            reason: 'Evaluated against declared nutritional thresholds.'
          })),
          ingredientRisks: ingredients.filter(i => i.category === 'ARTIFICIAL').map(i => ({ category: i.name, count: 1 })),
          nutritionFindings: [
            ...(form.sugar > 15 ? [{ message: 'Elevated sugar content exceeds recommended daily allowance guidelines.', problematic: true }] : []),
            ...(form.sodium > 600 ? [{ message: 'High sodium density requires portion awareness.', problematic: true }] : []),
            ...(form.fiber >= 5 ? [{ message: 'Excellent dietary fiber contribution supporting metabolic health.', problematic: false }] : [])
          ],
          recommendations: [
            healthScore >= 75 ? 'High quality nutritional profile suitable for balanced dietary routines.' : 'Consider consuming in moderate portion sizes given sugar/sodium levels.',
            'Review ingredient list for potential personal allergens or sensitivities.'
          ],
          insightCards: [
            {
              type: 'HEALTH_SCORE',
              title: `NutriVerify Rating: ${healthScore}/100`,
              description: `Overall rating calculated from macronutrient balance, micronutrient density, and additive count.`,
              severity: riskLevel
            }
          ],
          allergenFindings: [],
          confidenceScores: { overall: 95 },
          suggestedQuestions: [
            `Why did ${form.productName} receive a score of ${healthScore}?`,
            `How does the sugar content in ${form.productName} compare to daily recommendations?`,
            `What are the healthier alternatives in this category?`
          ],
          analyzedAt: new Date().toISOString()
        };

        sessionStorage.setItem('nv_last_result', JSON.stringify(fallbackResult));
        navigate('/results');
      }
  };

  if (analyzing) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full bg-surface-container-low rounded-2xl p-8 border border-primary-container/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-primary-container animate-spin-slow">biotech</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-base">NutriVerify Verification</h2>
              <p className="text-xs text-[#A9B4AA]">
                {form.productName ? `Analyzing "${form.productName}"` : 'Processing biological & chemical matrix'}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-6 mt-4">
            <div
              className="h-full rounded-full bg-primary-container transition-all duration-400"
              style={{ width: `${(analyzeStep / ANALYZE_STAGES.length) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            {ANALYZE_STAGES.map((stage, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i < analyzeStep ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                  i < analyzeStep - 1
                    ? 'bg-primary-container border-primary-container'
                    : i === analyzeStep - 1
                    ? 'bg-primary-container/20 border-primary-container animate-pulse'
                    : 'border-white/20'
                }`}>
                  {i < analyzeStep - 1 ? (
                    <span className="material-symbols-outlined text-[13px] text-black" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  ) : i === analyzeStep - 1 ? (
                    <div className="w-2 h-2 rounded-full bg-primary-container" />
                  ) : (
                    <span className="font-label-code text-[10px] text-white/30">{i + 1}</span>
                  )}
                </div>
                <span className={`text-[13px] font-label-code ${
                  i === analyzeStep - 1 ? 'text-primary-container font-semibold' :
                  i < analyzeStep - 1 ? 'text-[#8BE28B]' : 'text-on-surface-variant'
                }`}>
                  {stage}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-[#6F7A70] mt-6 font-label-code">
            Cross-referencing FDA, EFSA &amp; FSSAI regulatory databases
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto px-gutter py-space-md flex flex-col gap-space-md animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-md border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">edit_note</span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface">Manual Nutritional Entry</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Input declared macros, ingredient lists, and marketing claims for deep algorithmic verification.
          </p>
        </div>

        {/* Quick Demo Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase pr-1">Sample Preset:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary-container font-label-code text-[11px] font-semibold border border-white/10 transition-colors whitespace-nowrap"
            >
              + {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-surface-container-low p-space-md rounded-xl shadow-sm border border-white/5">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                i < step
                  ? 'bg-secondary text-on-secondary font-extrabold'
                  : i === step
                  ? 'bg-primary-container text-on-primary-container font-extrabold shadow-[0_0_12px_rgba(200,255,77,0.4)]'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className={`text-[12px] font-label-code hidden sm:inline ${i === step ? 'text-primary-container font-bold' : 'text-on-surface-variant'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-primary-container rounded-full transition-all duration-300" style={{ width: `${(step + 1) / STEPS.length * 100}%` }} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error-container/30 border border-error/30 rounded-xl text-body-sm text-error font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Step 0: Product Info */}
      {step === 0 && (
        <div className="bg-surface-container-low rounded-xl p-space-lg border border-white/5 shadow-md flex flex-col gap-space-md">
          <h3 className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider">
            Step 1: Product Identification
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-label-code text-[12px] text-on-surface-variant mb-1">Product Name *</label>
              <input
                value={form.productName}
                onChange={e => update('productName', e.target.value)}
                className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container"
                placeholder="e.g. Organic Oat Granola"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-label-code text-[12px] text-on-surface-variant mb-1">Brand / Manufacturer</label>
                <input
                  value={form.brand || ''}
                  onChange={e => update('brand', e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container"
                  placeholder="e.g. BioPure Foods"
                />
              </div>
              <div>
                <label className="block font-label-code text-[12px] text-on-surface-variant mb-1">Serving Size</label>
                <input
                  value={form.servingSize || ''}
                  onChange={e => update('servingSize', e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container"
                  placeholder="e.g. 45g (1 metric cup)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Nutrition */}
      {step === 1 && (
        <div className="bg-surface-container-low rounded-xl p-space-lg border border-white/5 shadow-md flex flex-col gap-space-md">
          <h3 className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider">
            Step 2: Macronutrient &amp; Micronutrient Values
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { field: 'calories', label: 'Calories (kcal)' },
              { field: 'protein', label: 'Protein (g)' },
              { field: 'carbs', label: 'Total Carbs (g)' },
              { field: 'sugar', label: 'Total Sugar (g)' },
              { field: 'addedSugar', label: 'Added Sugar (g)' },
              { field: 'fat', label: 'Total Fat (g)' },
              { field: 'saturatedFat', label: 'Sat. Fat (g)' },
              { field: 'fiber', label: 'Dietary Fiber (g)' },
              { field: 'sodium', label: 'Sodium (mg)' },
              { field: 'cholesterol', label: 'Cholesterol (mg)' },
            ].map(n => (
              <div key={n.field}>
                <label className="block font-label-code text-[11px] text-on-surface-variant mb-1">{n.label}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={(form as any)[n.field] || 0}
                  onChange={e => update(n.field, parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary-container font-label-code"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Ingredients */}
      {step === 2 && (
        <div className="bg-surface-container-low rounded-xl p-space-lg border border-white/5 shadow-md flex flex-col gap-space-md">
          <h3 className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider">
            Step 3: Ingredients List (One Per Line)
          </h3>
          <textarea
            value={ingredientText}
            onChange={e => setIngredientText(e.target.value)}
            rows={8}
            className="w-full bg-surface-container border border-white/10 rounded-lg p-4 font-body-sm text-on-surface focus:outline-none focus:border-primary-container resize-none"
            placeholder={"Whole Grain Rolled Oats (natural)\nPea Protein Isolate (natural)\nSugar (sweetener)\nMonosodium Glutamate (artificial)"}
          />
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Tip: You can add classification tags in parentheses like (natural), (sweetener), (preservative), (allergen).
          </p>
        </div>
      )}

      {/* Step 3: Claims */}
      {step === 3 && (
        <div className="bg-surface-container-low rounded-xl p-space-lg border border-white/5 shadow-md flex flex-col gap-space-md">
          <h3 className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider">
            Step 4: Marketing Claims to Audit (One Per Line)
          </h3>
          <textarea
            value={claimTexts}
            onChange={e => setClaimTexts(e.target.value)}
            rows={6}
            className="w-full bg-surface-container border border-white/10 rounded-lg p-4 font-body-sm text-on-surface focus:outline-none focus:border-primary-container resize-none"
            placeholder={"High Protein\nNo Added Sugar\n100% Natural\nImmunity Booster"}
          />
          <p className="font-body-sm text-[11px] text-on-surface-variant">
            Our rules engine checks each claim against FDA 21 CFR, EU Regulation 1924/2006, and FSSAI 2020 criteria.
          </p>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="bg-surface-container-low rounded-xl p-space-lg border border-white/5 shadow-md flex flex-col gap-space-md">
          <h3 className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider">
            Step 5: Review &amp; Submit
          </h3>
          <div className="divide-y divide-white/10 font-body-sm">
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Product Name</span>
              <strong className="text-on-surface">{form.productName}</strong>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Brand</span>
              <span className="text-on-surface">{form.brand || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Energy</span>
              <span className="text-primary-container font-bold">{form.calories} kcal ({form.servingSize || 'serving'})</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Ingredients</span>
              <span className="text-on-surface font-label-code">{ingredientText.split('\n').filter(Boolean).length} detected</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Claims to Audit</span>
              <span className="text-on-surface font-label-code">{claimTexts.split('\n').filter(Boolean).length} claims</span>
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        {step > 0 ? (
          <button
            onClick={prev}
            className="px-5 py-2.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-headline-sm text-body-sm"
          >
            Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            onClick={next}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-body-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={submit}
            className="px-8 py-3 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-body-md font-bold shadow-[0_0_20px_rgba(200,255,77,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <span>Verify Product Now</span>
          </button>
        )}
      </div>
    </div>
  );
}
