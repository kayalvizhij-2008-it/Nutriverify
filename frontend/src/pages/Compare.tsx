import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi, compareApi, type AnalysisResponse } from '../lib/api';

// ─── Demo specimens ────────────────────────────────────────────────────────────
const DEMO_SPECIMENS: AnalysisResponse[] = [
  {
    historyId: 101,
    productName: 'NutriPure Greek Yogurt',
    brand: 'NutriPure Bio',
    servingSize: '170g',
    authenticityScore: 94,
    healthScore: 92,
    riskLevel: 'LOW',
    calories: 120,
    protein: 16.0,
    carbs: 6.0,
    sugar: 4.0,
    fat: 0.5,
    saturatedFat: 0.2,
    sodium: 45,
    fiber: 0.0,
    analyzedAt: new Date().toISOString(),
    claimResults: [],
    ingredientRisks: [],
    nutritionFindings: [],
    recommendations: ['Excellent source of clean protein', 'Very low sugar and fat', 'Ideal post-workout recovery food'],
    insightCards: [],
    allergenFindings: [{ allergenName: 'Milk', matchingIngredients: ['Cultured Pasteurized Nonfat Milk'] }],
    confidenceScores: { overall: 98 },
    suggestedQuestions: [],
  },
  {
    historyId: 102,
    productName: 'MegaMax Energy Crunch Bar',
    brand: 'HyperNutra',
    servingSize: '65g',
    authenticityScore: 48,
    healthScore: 42,
    riskLevel: 'HIGH',
    calories: 340,
    protein: 8.0,
    carbs: 48.0,
    sugar: 28.0,
    fat: 14.0,
    saturatedFat: 7.5,
    sodium: 380,
    fiber: 1.5,
    analyzedAt: new Date().toISOString(),
    claimResults: [],
    ingredientRisks: [],
    nutritionFindings: [],
    recommendations: ['High in added sugars and saturated fats', 'Contains artificial additives', 'Consume sparingly'],
    insightCards: [],
    allergenFindings: [{ allergenName: 'Soy', matchingIngredients: ['Soy Protein Isolate'] }],
    confidenceScores: { overall: 92 },
    suggestedQuestions: [],
  },
  {
    historyId: 103,
    productName: 'NatureCraft Sprouted Oats',
    brand: 'NatureCraft Harvest',
    servingSize: '40g',
    authenticityScore: 89,
    healthScore: 88,
    riskLevel: 'LOW',
    calories: 180,
    protein: 7.0,
    carbs: 32.0,
    sugar: 1.0,
    fat: 3.0,
    saturatedFat: 0.5,
    sodium: 0,
    fiber: 5.0,
    analyzedAt: new Date().toISOString(),
    claimResults: [],
    ingredientRisks: [],
    nutritionFindings: [],
    recommendations: ['High fiber whole grain option', 'Zero sodium', 'Great for sustained energy'],
    insightCards: [],
    allergenFindings: [],
    confidenceScores: { overall: 96 },
    suggestedQuestions: [],
  },
  {
    historyId: 104,
    productName: 'VitaBlast Protein Shake',
    brand: 'VitaBlast Labs',
    servingSize: '350ml',
    authenticityScore: 72,
    healthScore: 65,
    riskLevel: 'MEDIUM',
    calories: 220,
    protein: 25.0,
    carbs: 18.0,
    sugar: 12.0,
    fat: 5.0,
    saturatedFat: 1.5,
    sodium: 210,
    fiber: 2.0,
    analyzedAt: new Date().toISOString(),
    claimResults: [],
    ingredientRisks: [],
    nutritionFindings: [],
    recommendations: ['Good protein source', 'Moderate sugar content', 'Watch sodium intake'],
    insightCards: [],
    allergenFindings: [{ allergenName: 'Milk', matchingIngredients: ['Whey Protein Concentrate'] }],
    confidenceScores: { overall: 88 },
    suggestedQuestions: [],
  },
];

// ─── Score Ring ────────────────────────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
}

function ScoreRing({ score, size = 96, strokeWidth = 8, color = '#C8FF4D', label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="flex flex-col items-center" style={{ marginTop: `-${size * 0.72}px` }}>
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-[#A9B4AA] uppercase tracking-wider font-mono">{label}</span>
      </div>
      <div style={{ height: `${size * 0.28}px` }} />
    </div>
  );
}

// ─── Macro Bar ─────────────────────────────────────────────────────────────────
interface MacroBarProps {
  label: string;
  valA: number;
  valB: number;
  unit: string;
  maxVal: number;
  lowerIsBetter?: boolean;
}

function MacroBar({ label, valA, valB, unit, maxVal, lowerIsBetter = false }: MacroBarProps) {
  const pctA = maxVal > 0 ? Math.min((valA / maxVal) * 100, 100) : 0;
  const pctB = maxVal > 0 ? Math.min((valB / maxVal) * 100, 100) : 0;

  const aWins = lowerIsBetter ? valA <= valB : valA >= valB;
  const bWins = lowerIsBetter ? valB <= valA : valB >= valA;
  const tied = valA === valB;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#A9B4AA]">{label}</span>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className={tied ? 'text-[#A9B4AA]' : aWins ? 'text-[#C8FF4D] font-bold' : 'text-[#A9B4AA]'}>
            {valA}{unit}
          </span>
          <span className="text-[#A9B4AA]/40">vs</span>
          <span className={tied ? 'text-[#A9B4AA]' : bWins && !tied ? 'text-[#8BE28B] font-bold' : 'text-[#A9B4AA]'}>
            {valB}{unit}
          </span>
        </div>
      </div>

      {/* Side-by-side bars */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Bar A */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pctA}%`,
                background: aWins && !tied ? '#C8FF4D' : 'rgba(200,255,77,0.35)',
              }}
            />
          </div>
          {aWins && !tied && (
            <span className="text-[#C8FF4D] text-[10px]">✓</span>
          )}
        </div>
        {/* Bar B */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pctB}%`,
                background: bWins && !tied ? '#8BE28B' : 'rgba(139,226,139,0.35)',
              }}
            />
          </div>
          {bWins && !tied && (
            <span className="text-[#8BE28B] text-[10px]">✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    LOW:    { bg: 'bg-[#C8FF4D]/10 border border-[#C8FF4D]/20', text: 'text-[#C8FF4D]', label: '✓ Low Risk' },
    MEDIUM: { bg: 'bg-yellow-400/10 border border-yellow-400/20', text: 'text-yellow-400', label: '⚠ Medium Risk' },
    HIGH:   { bg: 'bg-red-400/10 border border-red-400/20', text: 'text-red-400', label: '✗ High Risk' },
  };
  const cfg = map[level] ?? map.MEDIUM;
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Compare() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisResponse[]>([]);
  const [first, setFirst] = useState<number | null>(null);
  const [second, setSecond] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyApi.getAll()
      .then(data => {
        let list: AnalysisResponse[] = Array.isArray(data) ? data : [];

        const last = sessionStorage.getItem('nv_last_result');
        if (last) {
          try {
            const parsed = JSON.parse(last);
            if (parsed && !list.some(item => item.productName === parsed.productName)) {
              list = [{ ...parsed, historyId: parsed.historyId || 999 }, ...list];
            }
          } catch { /* ignore */ }
        }

        DEMO_SPECIMENS.forEach(demo => {
          if (!list.some(item => item.productName === demo.productName)) {
            list.push(demo);
          }
        });

        setHistory(list);
        if (list.length >= 2) {
          setFirst(list[0].historyId ?? null);
          setSecond(list[1].historyId ?? null);
        } else if (list.length === 1) {
          setFirst(list[0].historyId ?? null);
        }
      })
      .catch(() => {
        setHistory(DEMO_SPECIMENS);
        setFirst(101);
        setSecond(102);
      })
      .finally(() => setInitialLoading(false));
  }, []);

  // Auto-run comparison when selections change
  useEffect(() => {
    if (first && second && first !== second) {
      doCompare(first, second);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, second, history.length]);

  const doCompare = async (a?: number | null, b?: number | null) => {
    const idA = a ?? first;
    const idB = b ?? second;
    if (!idA || !idB || idA === idB) return;

    setError('');
    setLoading(true);
    try {
      const res = await compareApi.compare(idA, idB);
      setResult(res);
    } catch {
      const prodA = history.find(h => h.historyId === idA);
      const prodB = history.find(h => h.historyId === idB);
      if (prodA && prodB) {
        setResult(buildClientResult(prodA, prodB));
      } else {
        setError('Could not load comparison data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buildClientResult = (prodA: AnalysisResponse, prodB: AnalysisResponse) => ({
    productA: prodA.productName,
    productB: prodB.productName,
    summary: `${prodA.productName} has ${prodA.healthScore > prodB.healthScore ? 'a higher' : 'a lower'} health score compared to ${prodB.productName}.`,
    recommended: prodA.healthScore >= prodB.healthScore ? prodA.productName : prodB.productName,
    metrics: [
      { name: 'Health Score', productAValue: `${prodA.healthScore}/100`, productBValue: `${prodB.healthScore}/100`, betterFor: prodA.healthScore >= prodB.healthScore ? prodA.productName : prodB.productName },
      { name: 'Authenticity', productAValue: `${prodA.authenticityScore}/100`, productBValue: `${prodB.authenticityScore}/100`, betterFor: prodA.authenticityScore >= prodB.authenticityScore ? prodA.productName : prodB.productName },
      { name: 'Calories', productAValue: `${prodA.calories ?? 0} kcal`, productBValue: `${prodB.calories ?? 0} kcal`, betterFor: (prodA.calories ?? 0) <= (prodB.calories ?? 0) ? prodA.productName : prodB.productName },
      { name: 'Sugar', productAValue: `${prodA.sugar ?? 0}g`, productBValue: `${prodB.sugar ?? 0}g`, betterFor: (prodA.sugar ?? 0) <= (prodB.sugar ?? 0) ? prodA.productName : prodB.productName },
      { name: 'Protein', productAValue: `${prodA.protein ?? 0}g`, productBValue: `${prodB.protein ?? 0}g`, betterFor: (prodA.protein ?? 0) >= (prodB.protein ?? 0) ? prodA.productName : prodB.productName },
      { name: 'Sodium', productAValue: `${prodA.sodium ?? 0}mg`, productBValue: `${prodB.sodium ?? 0}mg`, betterFor: (prodA.sodium ?? 0) <= (prodB.sodium ?? 0) ? prodA.productName : prodB.productName },
      { name: 'Saturated Fat', productAValue: `${prodA.saturatedFat ?? 0}g`, productBValue: `${prodB.saturatedFat ?? 0}g`, betterFor: (prodA.saturatedFat ?? 0) <= (prodB.saturatedFat ?? 0) ? prodA.productName : prodB.productName },
      { name: 'Fiber', productAValue: `${prodA.fiber ?? 0}g`, productBValue: `${prodB.fiber ?? 0}g`, betterFor: (prodA.fiber ?? 0) >= (prodB.fiber ?? 0) ? prodA.productName : prodB.productName },
      { name: 'Risk Level', productAValue: prodA.riskLevel ?? 'LOW', productBValue: prodB.riskLevel ?? 'LOW', betterFor: prodA.riskLevel === 'LOW' ? prodA.productName : prodB.productName },
    ],
  });

  const prodA = history.find(h => h.historyId === first);
  const prodB = history.find(h => h.historyId === second);

  // Verdict bullets derived from prodA vs prodB
  const verdictBullets: string[] = [];
  if (prodA && prodB && result) {
    const winner = result.recommended;
    const wp = winner === prodA.productName ? prodA : prodB;
    const lp = winner === prodA.productName ? prodB : prodA;
    if ((wp.healthScore ?? 0) !== (lp.healthScore ?? 0))
      verdictBullets.push(`Health score ${wp.healthScore} vs ${lp.healthScore} — ${Math.abs((wp.healthScore ?? 0) - (lp.healthScore ?? 0))} points higher`);
    if ((wp.sugar ?? 0) < (lp.sugar ?? 0))
      verdictBullets.push(`${Math.round(((lp.sugar ?? 0) - (wp.sugar ?? 0)) * 10) / 10}g less sugar per serving`);
    if ((wp.protein ?? 0) > (lp.protein ?? 0))
      verdictBullets.push(`${Math.round(((wp.protein ?? 0) - (lp.protein ?? 0)) * 10) / 10}g more protein per serving`);
    if ((wp.saturatedFat ?? 0) < (lp.saturatedFat ?? 0))
      verdictBullets.push(`${Math.round(((lp.saturatedFat ?? 0) - (wp.saturatedFat ?? 0)) * 10) / 10}g less saturated fat`);
    if ((wp.sodium ?? 0) < (lp.sodium ?? 0))
      verdictBullets.push(`${Math.round((lp.sodium ?? 0) - (wp.sodium ?? 0))}mg less sodium`);
    if ((wp.fiber ?? 0) > (lp.fiber ?? 0))
      verdictBullets.push(`${Math.round(((wp.fiber ?? 0) - (lp.fiber ?? 0)) * 10) / 10}g more dietary fiber`);
    if (wp.riskLevel === 'LOW' && lp.riskLevel !== 'LOW')
      verdictBullets.push(`Lower overall ingredient risk profile`);
  }

  // Quick-select demo options (exclude product A's current selection)
  const quickSelectOptions = DEMO_SPECIMENS.filter(d => d.historyId !== first);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8FF4D]/10 border border-[#C8FF4D]/20 text-[#C8FF4D] text-[11px] font-mono mb-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Head-to-Head Analytics
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Product Comparison</h1>
          <p className="text-[#A9B4AA] mt-1.5 text-[14px]">Compare nutrition, ingredient authenticity, and health risk side by side.</p>
        </div>
        <button
          onClick={() => navigate('/analyze')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#C8FF4D]/30 text-white text-[13px] font-medium transition-all"
        >
          <svg className="w-4 h-4 text-[#C8FF4D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Scan New Product
        </button>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-[13px] text-red-400">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Product Selectors ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* Product A selector */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#C8FF4D]/15 text-[#C8FF4D] font-bold text-[12px] flex items-center justify-center font-mono">A</span>
            <span className="text-[11px] font-mono text-[#A9B4AA] uppercase tracking-wider">Product A</span>
          </div>
          <select
            value={first ?? ''}
            onChange={e => setFirst(Number(e.target.value) || null)}
            className="w-full bg-[#071009] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#C8FF4D]/40 transition-colors"
          >
            <option value="">Select product A...</option>
            {history.map(h => (
              <option key={h.historyId} value={h.historyId}>
                {h.productName}{h.brand ? ` • ${h.brand}` : ''} ({h.healthScore}/100)
              </option>
            ))}
          </select>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center py-4 md:pt-10">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-mono text-[#A9B4AA] font-bold">VS</span>
          </div>
        </div>

        {/* Product B selector + quick picks */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#8BE28B]/15 text-[#8BE28B] font-bold text-[12px] flex items-center justify-center font-mono">B</span>
            <span className="text-[11px] font-mono text-[#A9B4AA] uppercase tracking-wider">Product B</span>
          </div>
          <select
            value={second ?? ''}
            onChange={e => setSecond(Number(e.target.value) || null)}
            className="w-full bg-[#071009] border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#8BE28B]/40 transition-colors"
          >
            <option value="">Select product B...</option>
            {history.map(h => (
              <option key={h.historyId} value={h.historyId}>
                {h.productName}{h.brand ? ` • ${h.brand}` : ''} ({h.healthScore}/100)
              </option>
            ))}
          </select>

          {/* Quick-select demo buttons */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-mono text-[#A9B4AA]/60 self-center mr-1">Quick:</span>
            {quickSelectOptions.map(d => (
              <button
                key={d.historyId}
                onClick={() => setSecond(d.historyId ?? null)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                  second === d.historyId
                    ? 'bg-[#8BE28B]/15 border-[#8BE28B]/40 text-[#8BE28B]'
                    : 'bg-white/5 border-white/10 text-[#A9B4AA] hover:border-[#8BE28B]/30 hover:text-[#8BE28B]'
                }`}
              >
                {d.productName.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Comparison Area ───────────────────────────────────────── */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-[#C8FF4D]/30 border-t-[#C8FF4D] rounded-full animate-spin" />
        </div>
      ) : prodA && prodB ? (
        <div ref={resultsRef} className="space-y-6 animate-fade-in-up">

          {/* ── Side-by-side Product Panels ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_56px_1fr] gap-0 rounded-2xl overflow-hidden border border-white/8">

            {/* Panel A */}
            <div className="bg-[#0B0D0C] p-6 space-y-5">
              {/* Product header */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#C8FF4D]/60 uppercase tracking-wider">Product A</span>
                    <h2 className="text-lg font-bold text-white leading-snug mt-0.5">{prodA.productName}</h2>
                    {prodA.brand && <p className="text-[#A9B4AA] text-[12px]">{prodA.brand}</p>}
                  </div>
                  <RiskBadge level={prodA.riskLevel ?? 'LOW'} />
                </div>
                <p className="text-[11px] text-[#A9B4AA] font-mono">Serving: {prodA.servingSize}</p>
              </div>

              {/* Score rings */}
              <div className="flex justify-around">
                <ScoreRing score={prodA.healthScore ?? 0} label="Health" color="#C8FF4D" />
                <ScoreRing score={prodA.authenticityScore ?? 0} label="Authentic" color="#8BE28B" size={80} strokeWidth={7} />
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Calories', value: prodA.calories ?? 0, unit: 'kcal' },
                  { label: 'Protein', value: prodA.protein ?? 0, unit: 'g' },
                  { label: 'Sugar', value: prodA.sugar ?? 0, unit: 'g' },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <div className="text-[10px] font-mono text-[#A9B4AA] uppercase">{s.label}</div>
                    <div className="text-base font-bold text-[#C8FF4D] mt-0.5">{s.value}<span className="text-[10px] text-[#A9B4AA] ml-0.5">{s.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle winner column */}
            <div className="hidden md:flex flex-col items-center justify-center gap-3 bg-[#071009] border-x border-white/5 py-8 px-2">
              {result?.metrics?.map((m: any, i: number) => {
                const aWins = m.betterFor === prodA.productName;
                const bWins = m.betterFor === prodB.productName;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className={`text-[10px] ${aWins ? 'text-[#C8FF4D]' : 'text-transparent'}`}>◀</span>
                    <span className={`text-[10px] ${bWins ? 'text-[#8BE28B]' : 'text-transparent'}`}>▶</span>
                  </div>
                );
              })}
            </div>

            {/* Panel B */}
            <div className="bg-[#0B0D0C] p-6 space-y-5 border-t md:border-t-0 border-white/5">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#8BE28B]/60 uppercase tracking-wider">Product B</span>
                    <h2 className="text-lg font-bold text-white leading-snug mt-0.5">{prodB.productName}</h2>
                    {prodB.brand && <p className="text-[#A9B4AA] text-[12px]">{prodB.brand}</p>}
                  </div>
                  <RiskBadge level={prodB.riskLevel ?? 'LOW'} />
                </div>
                <p className="text-[11px] text-[#A9B4AA] font-mono">Serving: {prodB.servingSize}</p>
              </div>

              <div className="flex justify-around">
                <ScoreRing score={prodB.healthScore ?? 0} label="Health" color="#8BE28B" />
                <ScoreRing score={prodB.authenticityScore ?? 0} label="Authentic" color="#C8FF4D" size={80} strokeWidth={7} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Calories', value: prodB.calories ?? 0, unit: 'kcal' },
                  { label: 'Protein', value: prodB.protein ?? 0, unit: 'g' },
                  { label: 'Sugar', value: prodB.sugar ?? 0, unit: 'g' },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <div className="text-[10px] font-mono text-[#A9B4AA] uppercase">{s.label}</div>
                    <div className="text-base font-bold text-[#8BE28B] mt-0.5">{s.value}<span className="text-[10px] text-[#A9B4AA] ml-0.5">{s.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Nutrition Comparison Bars ──────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[13px] font-mono uppercase tracking-wider text-[#A9B4AA]">Nutrition Side-by-Side</h3>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#C8FF4D]/60 inline-block" /> {prodA.productName.split(' ')[0]}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#8BE28B]/60 inline-block" /> {prodB.productName.split(' ')[0]}</span>
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1fr] gap-1.5 text-[10px] font-mono text-[#A9B4AA] uppercase tracking-wider mb-1">
              <div>Product A</div>
              <div>Product B</div>
            </div>

            <div className="space-y-4">
              <MacroBar label="Calories" valA={prodA.calories ?? 0} valB={prodB.calories ?? 0} unit=" kcal" maxVal={Math.max(prodA.calories ?? 0, prodB.calories ?? 0, 400)} lowerIsBetter />
              <MacroBar label="Protein" valA={prodA.protein ?? 0} valB={prodB.protein ?? 0} unit="g" maxVal={Math.max(prodA.protein ?? 0, prodB.protein ?? 0, 30)} />
              <MacroBar label="Carbs" valA={prodA.carbs ?? 0} valB={prodB.carbs ?? 0} unit="g" maxVal={Math.max(prodA.carbs ?? 0, prodB.carbs ?? 0, 60)} lowerIsBetter />
              <MacroBar label="Sugar" valA={prodA.sugar ?? 0} valB={prodB.sugar ?? 0} unit="g" maxVal={Math.max(prodA.sugar ?? 0, prodB.sugar ?? 0, 30)} lowerIsBetter />
              <MacroBar label="Fat" valA={prodA.fat ?? 0} valB={prodB.fat ?? 0} unit="g" maxVal={Math.max(prodA.fat ?? 0, prodB.fat ?? 0, 20)} lowerIsBetter />
              <MacroBar label="Saturated Fat" valA={prodA.saturatedFat ?? 0} valB={prodB.saturatedFat ?? 0} unit="g" maxVal={Math.max(prodA.saturatedFat ?? 0, prodB.saturatedFat ?? 0, 10)} lowerIsBetter />
              <MacroBar label="Sodium" valA={prodA.sodium ?? 0} valB={prodB.sodium ?? 0} unit="mg" maxVal={Math.max(prodA.sodium ?? 0, prodB.sodium ?? 0, 500)} lowerIsBetter />
              <MacroBar label="Fiber" valA={prodA.fiber ?? 0} valB={prodB.fiber ?? 0} unit="g" maxVal={Math.max(prodA.fiber ?? 0, prodB.fiber ?? 0, 10)} />
            </div>
          </div>

          {/* ── Detailed Metrics Table ─────────────────────────────────── */}
          {result?.metrics && (
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 px-5 py-3 bg-white/[0.04] border-b border-white/8">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9B4AA]">Metric</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8FF4D]">{prodA.productName.split(' ').slice(0, 2).join(' ')}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8BE28B]">{prodB.productName.split(' ').slice(0, 2).join(' ')}</span>
              </div>
              <div className="divide-y divide-white/5">
                {result.metrics.map((m: any, i: number) => {
                  const aWins = m.betterFor === prodA.productName;
                  const bWins = m.betterFor === prodB.productName;
                  return (
                    <div key={i} className={`grid grid-cols-3 px-5 py-3 text-[13px] items-center ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                      <span className="text-[#A9B4AA] font-mono text-[11px] uppercase tracking-wide">{m.name}</span>
                      <span className={`font-semibold flex items-center gap-1.5 ${aWins ? 'text-[#C8FF4D]' : 'text-white/40'}`}>
                        {m.productAValue}
                        {aWins && <span className="text-[#C8FF4D] text-[11px]">✓</span>}
                      </span>
                      <span className={`font-semibold flex items-center gap-1.5 ${bWins ? 'text-[#8BE28B]' : 'text-white/40'}`}>
                        {m.productBValue}
                        {bWins && <span className="text-[#8BE28B] text-[11px]">✓</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Verdict Section ────────────────────────────────────────── */}
          {result?.recommended && (
            <div className="bg-gradient-to-br from-[#C8FF4D]/8 via-[#0B0D0C] to-[#8BE28B]/8 border border-[#C8FF4D]/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C8FF4D]/15 border border-[#C8FF4D]/25 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#C8FF4D]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#C8FF4D]/70">NutriVerify Verdict</p>
                  <h3 className="text-lg font-bold text-white">
                    <span className="text-[#C8FF4D]">{result.recommended}</span> is the healthier choice
                  </h3>
                </div>
              </div>

              {verdictBullets.length > 0 && (
                <ul className="space-y-2 ml-1">
                  {verdictBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#A9B4AA]">
                      <span className="text-[#C8FF4D] mt-0.5 shrink-0">→</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[12px] text-[#A9B4AA]/70 border-t border-white/5 pt-3 mt-1">
                {result.summary}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {(prodA.recommendations?.length || prodB.recommendations?.length) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { prod: prodA, color: '#C8FF4D', label: 'A' },
                { prod: prodB, color: '#8BE28B', label: 'B' },
              ].map(({ prod, color, label }) =>
                prod.recommendations?.length ? (
                  <div key={label} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-3">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider" style={{ color }}>
                      Product {label} · Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {prod.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-[#A9B4AA]">
                          <span style={{ color }} className="mt-0.5 shrink-0">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          ) : null}

        </div>
      ) : !initialLoading && (
        /* ── Empty State ────────────────────────────────────────────── */
        <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-white/8">
          <div className="w-16 h-16 rounded-2xl bg-[#C8FF4D]/10 border border-[#C8FF4D]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#C8FF4D]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Select Two Products to Compare</h3>
          <p className="text-[#A9B4AA] text-[14px] max-w-sm mx-auto mb-6">
            Choose from your scan history or use the quick-select demo options above to get an instant comparison.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="px-6 py-3 bg-[#C8FF4D] text-black font-bold text-[14px] rounded-xl hover:bg-[#b8ef3d] transition-all"
          >
            Scan a Product
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D0C]/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#C8FF4D]/30 border-t-[#C8FF4D] rounded-full animate-spin" />
            <p className="text-[#C8FF4D] text-[13px] font-mono animate-pulse">Running AI comparison engine…</p>
          </div>
        </div>
      )}

    </div>
  );
}
