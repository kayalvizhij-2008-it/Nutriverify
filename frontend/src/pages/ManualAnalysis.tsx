import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, type AnalyzeRequest } from '../lib/api';

const STEPS = ['Product Info', 'Nutrition', 'Ingredients', 'Claims', 'Review'];

export default function ManualAnalysis() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<AnalyzeRequest>({
    productName: '', brand: '', servingSize: '',
    calories: 0, fat: 0, sugar: 0, sodium: 0, protein: 0, carbs: 0, fiber: 0,
    ingredients: [], claims: [],
  });
  const [ingredientText, setIngredientText] = useState('');
  const [claimTexts, setClaimTexts] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const ANALYZE_STAGES = [
    'Reading label...', 'Analyzing ingredients...', 'Checking claims...',
    'Validating nutrition...', 'Calculating scores...', 'Generating report...'
  ];

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
      return { name: parts[0].trim(), category: 'MODERATE_CONCERN', note: parts[1]?.replace(')', '').trim() };
    });
    const claims = claimTexts.split('\n').filter(Boolean).map(c => ({ type: 'CUSTOM', displayText: c.trim() }));

    try {
      for (let i = 0; i < ANALYZE_STAGES.length - 1; i++) {
        setAnalyzeStep(i + 1);
        await new Promise(r => setTimeout(r, 350));
      }
      const result = await analysisApi.analyze({ ...form, ingredients, claims });
      sessionStorage.setItem('nv_last_result', JSON.stringify(result));
      navigate('/results');
    } catch (err: any) {
      setAnalyzing(false);
      setError(err?.message || 'Analysis failed. Please try again.');
    }
  };

  if (analyzing) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full bg-nv-surface-container rounded-2xl p-8 border border-nv-outline-variant/15">
          <h2 className="font-[family-name:var(--font-display)] text-[20px] font-semibold text-nv-text text-center mb-8">Analyzing Label</h2>
          <div className="space-y-4">
            {ANALYZE_STAGES.map((stage, i) => (
              <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i <= analyzeStep ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${i < analyzeStep ? 'bg-nv-tertiary/20' : i === analyzeStep ? 'bg-nv-primary/20' : 'bg-nv-surface-container-high'}`}>
                  {i < analyzeStep ? (
                    <span className="material-symbols-outlined text-[14px] text-nv-tertiary">check</span>
                  ) : i === analyzeStep ? (
                    <span className="w-2 h-2 rounded-full bg-nv-primary animate-pulse"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-nv-outline-variant/40"></span>
                  )}
                </div>
                <span className={`text-[14px] ${i <= analyzeStep ? 'text-nv-text' : 'text-nv-text-dim'}`}>{stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i < step ? 'bg-nv-tertiary/20 text-nv-tertiary' : i === step ? 'bg-nv-primary/20 text-nv-primary' : 'bg-nv-surface-container-high text-nv-text-dim'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className={`text-[12px] font-[family-name:var(--font-mono)] hidden sm:inline ${i === step ? 'text-nv-text' : 'text-nv-text-dim'}`}>{s}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-nv-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-nv-primary rounded-full transition-all duration-300" style={{ width: `${(step + 1) / STEPS.length * 100}%` }} />
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-nv-error/10 border border-nv-error/20 rounded-xl text-[13px] text-nv-error">{error}</div>}

      {/* Step 0: Product Info */}
      {step === 0 && (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
          <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Product Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] text-nv-text-dim mb-1.5">Product Name *</label>
              <input value={form.productName} onChange={e => update('productName', e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="e.g. Organic Almond Milk" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] text-nv-text-dim mb-1.5">Brand</label>
                <input value={form.brand || ''} onChange={e => update('brand', e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="e.g. PureNutri" />
              </div>
              <div>
                <label className="block text-[12px] text-nv-text-dim mb-1.5">Serving Size</label>
                <input value={form.servingSize || ''} onChange={e => update('servingSize', e.target.value)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="e.g. 240ml" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Nutrition */}
      {step === 1 && (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
          <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Nutrition (per serving)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { field: 'calories', label: 'Calories (kcal)' },
              { field: 'fat', label: 'Total Fat (g)' },
              { field: 'saturatedFat', label: 'Sat. Fat (g)' },
              { field: 'transFat', label: 'Trans Fat (g)' },
              { field: 'carbs', label: 'Carbs (g)' },
              { field: 'sugar', label: 'Sugar (g)' },
              { field: 'addedSugar', label: 'Added Sugar (g)' },
              { field: 'protein', label: 'Protein (g)' },
              { field: 'fiber', label: 'Fiber (g)' },
              { field: 'sodium', label: 'Sodium (mg)' },
              { field: 'cholesterol', label: 'Cholesterol (mg)' },
            ].map(n => (
              <div key={n.field}>
                <label className="block text-[11px] text-nv-text-dim mb-1">{n.label}</label>
                <input type="number" min="0" step="0.1" value={(form as any)[n.field] || 0} onChange={e => update(n.field, parseFloat(e.target.value) || 0)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-3 py-2 text-[14px] text-nv-text focus:outline-none focus:border-nv-primary/40 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Ingredients */}
      {step === 2 && (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
          <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Ingredients</h3>
          <textarea value={ingredientText} onChange={e => setIngredientText(e.target.value)} rows={8} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-3 text-[13px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors resize-none" placeholder={"One ingredient per line:\nAlmonds (natural)\nWater\nSea Salt\nSugar (sweetener)"} />
          <p className="text-[11px] text-nv-text-dim mt-2">Add category in parentheses if known (e.g. natural, artificial, allergen).</p>
        </div>
      )}

      {/* Step 3: Claims */}
      {step === 3 && (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
          <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Claims to Verify</h3>
          <textarea value={claimTexts} onChange={e => setClaimTexts(e.target.value)} rows={6} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-3 text-[13px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors resize-none" placeholder={"One claim per line:\nOrganic\nNo Added Sugar\nHigh Protein\nLow Sodium"} />
          <p className="text-[11px] text-nv-text-dim mt-2">Enter marketing claims printed on the product label.</p>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
          <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-4">Review & Submit</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-nv-outline-variant/10">
              <span className="text-[13px] text-nv-text-dim">Product</span>
              <span className="text-[13px] text-nv-text font-medium">{form.productName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-nv-outline-variant/10">
              <span className="text-[13px] text-nv-text-dim">Brand</span>
              <span className="text-[13px] text-nv-text">{form.brand || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-nv-outline-variant/10">
              <span className="text-[13px] text-nv-text-dim">Serving Size</span>
              <span className="text-[13px] text-nv-text">{form.servingSize || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-nv-outline-variant/10">
              <span className="text-[13px] text-nv-text-dim">Calories</span>
              <span className="text-[13px] text-nv-text">{form.calories} kcal</span>
            </div>
            <div className="flex justify-between py-2 border-b border-nv-outline-variant/10">
              <span className="text-[13px] text-nv-text-dim">Ingredients</span>
              <span className="text-[13px] text-nv-text">{ingredientText.split('\n').filter(Boolean).length} listed</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[13px] text-nv-text-dim">Claims</span>
              <span className="text-[13px] text-nv-text">{claimTexts.split('\n').filter(Boolean).length} to verify</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <button onClick={prev} className="px-5 py-2.5 bg-nv-surface-container hover:bg-nv-surface-container-high text-nv-text-muted text-[13px] rounded-xl border border-nv-outline-variant/15 transition-all">
            Back
          </button>
        ) : <div />}

        {step < 4 ? (
          <button onClick={next} className="px-6 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all">
            Continue
          </button>
        ) : (
          <button onClick={submit} className="px-6 py-2.5 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container text-[13px] font-semibold rounded-xl transition-all">
            Verify Label
          </button>
        )}
      </div>
    </div>
  );
}
