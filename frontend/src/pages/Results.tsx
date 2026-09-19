import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnalysisResponse, savedApi, chatApi } from '../lib/api';

const TABS = ['Overview', 'Claims', 'Ingredients', 'Nutrition', 'Recommendations', 'AI'] as const;

function ScoreRing({ score, color, size = 100 }: { score: number; color: string; size?: number }) {
  const r = 15.9155;
  const c = 2 * Math.PI * r;
  const o = c - (score / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d={`M18 2.0845 a ${r} ${r} 0 0 1 0 31.831 a ${r} ${r} 0 0 1 0 -31.831`} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-nv-surface-variant" />
        <path d={`M18 2.0845 a ${r} ${r} 0 0 1 0 31.831 a ${r} ${r} 0 0 1 0 -31.831`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray: c, strokeDashoffset: o }} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-display)] font-bold text-nv-text leading-none" style={{ fontSize: size * 0.32 }}>{score}</span>
        <span className="font-[family-name:var(--font-mono)] text-nv-text-dim" style={{ fontSize: size * 0.1 }}>/100</span>
      </div>
    </div>
  );
}

function scoreColor(s: number) { return s >= 80 ? '#5de88e' : s >= 50 ? '#f2ca50' : '#ffb4ab'; }
function scoreLabel(s: number) { return s >= 80 ? 'Trusted' : s >= 50 ? 'Moderate' : 'Concerning'; }

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [tab, setTab] = useState<string>('Overview');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) { try { setResult(JSON.parse(raw)); } catch {} }
  }, []);

  if (!result) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-[48px] text-nv-text-dim mb-4">document_scanner</span>
        <p className="text-[16px] text-nv-text-muted mb-6">No analysis results to display.</p>
        <Link to="/analyze" className="px-5 py-2.5 bg-nv-primary-container/15 hover:bg-nv-primary-container/25 text-nv-primary text-[13px] font-medium rounded-xl border border-nv-primary/20 transition-all">Analyze a Product</Link>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try { await savedApi.save(result); setSaved(true); } catch {} finally { setSaving(false); }
  };

  const handleChat = async () => {
    if (!chatMsg.trim()) return;
    setChatLoading(true);
    try {
      const res = await chatApi.send(chatMsg, result.historyId);
      setChatResponse(res.response);
    } catch { setChatResponse('AI assistant is currently unavailable.'); }
    finally { setChatLoading(false); }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-nv-text">{result.productName}</h1>
          <p className="text-[13px] text-nv-text-dim mt-0.5">{result.brand && `${result.brand} · `}{result.servingSize}</p>
        </div>
        <div className="flex items-center gap-2">
          {!saved ? (
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-nv-surface-container border border-nv-outline-variant/15 rounded-xl text-[13px] text-nv-text-muted hover:border-nv-primary/25 transition-all">
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>{saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-nv-tertiary/10 border border-nv-tertiary/20 rounded-xl text-[13px] text-nv-tertiary">
              <span className="material-symbols-outlined text-[16px]">check</span>Saved
            </span>
          )}
          <button onClick={() => { sessionStorage.setItem('nv_last_result', JSON.stringify(result)); navigate('/chat'); }} className="flex items-center gap-1.5 px-4 py-2 bg-nv-surface-container border border-nv-outline-variant/15 rounded-xl text-[13px] text-nv-text-muted hover:border-nv-outline-variant/30 transition-all">
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>Ask AI
          </button>
        </div>
      </div>

      {/* Allergen alert */}
      {result.allergenFindings?.length > 0 && (
        <div className="mb-6 p-4 bg-nv-error/10 border border-nv-error/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[18px] text-nv-error">warning</span>
            <span className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-nv-error">Allergen Alert</span>
          </div>
          {result.allergenFindings.map((a, i) => (
            <p key={i} className="text-[13px] text-nv-error/80"><strong>{a.allergenName}</strong> — {a.matchingIngredients.join(', ')}</p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${tab === t ? 'bg-nv-primary-container/15 text-nv-primary' : 'text-nv-text-dim hover:text-nv-text hover:bg-nv-surface-container-high/50'}`}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 flex flex-col items-center">
                <ScoreRing score={result.authenticityScore} color={scoreColor(result.authenticityScore)} size={110} />
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mt-2">Authenticity</span>
                <span className={`text-[12px] font-[family-name:var(--font-mono)] mt-0.5 ${result.authenticityScore >= 80 ? 'text-nv-tertiary' : result.authenticityScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{scoreLabel(result.authenticityScore)}</span>
              </div>
              <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 flex flex-col items-center">
                <ScoreRing score={result.healthScore} color={scoreColor(result.healthScore)} size={110} />
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mt-2">Health Quality</span>
                <span className={`text-[12px] font-[family-name:var(--font-mono)] mt-0.5 ${result.healthScore >= 80 ? 'text-nv-tertiary' : result.healthScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{result.healthScore >= 80 ? 'Grade A' : result.healthScore >= 50 ? 'Grade B' : 'Grade C'}</span>
              </div>
            </div>

            {/* Key metrics */}
            <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15">
              <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Nutrition Summary</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { label: 'Calories', value: `${result.calories}`, unit: 'kcal' },
                  { label: 'Protein', value: `${result.protein}`, unit: 'g' },
                  { label: 'Sugar', value: `${result.sugar}`, unit: 'g' },
                  { label: 'Fat', value: `${result.fat}`, unit: 'g' },
                  { label: 'Sodium', value: `${result.sodium}`, unit: 'mg' },
                  { label: 'Fiber', value: `${result.fiber}`, unit: 'g' },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <div className="font-[family-name:var(--font-display)] text-[18px] font-bold text-nv-text">{m.value}</div>
                    <div className="text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim">{m.unit}</div>
                    <div className="text-[11px] text-nv-text-dim mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight cards */}
            {result.insightCards?.length > 0 && (
              <div className="space-y-2">
                {result.insightCards.map((c, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${c.severity === 'HIGH' || c.severity === 'CRITICAL' ? 'border-nv-error/15 bg-nv-error/5' : c.severity === 'MEDIUM' ? 'border-nv-primary/15 bg-nv-primary/5' : 'border-nv-outline-variant/15 bg-nv-surface-container/50'}`}>
                    <span className={`text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-wider ${c.severity === 'HIGH' || c.severity === 'CRITICAL' ? 'text-nv-error' : c.severity === 'MEDIUM' ? 'text-nv-primary' : 'text-nv-text-dim'}`}>{c.title}</span>
                    <p className="text-[13px] text-nv-text-muted mt-1">{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CLAIMS */}
        {tab === 'Claims' && (
          <div className="bg-nv-surface-container rounded-2xl border border-nv-outline-variant/15 overflow-hidden">
            {result.claimResults?.length > 0 ? (
              <>
                <div className="grid grid-cols-12 bg-nv-surface-container-high/50 p-3 text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">
                  <div className="col-span-5">Claim</div>
                  <div className="col-span-3">Verdict</div>
                  <div className="col-span-4">Reason</div>
                </div>
                {result.claimResults.map((c, i) => (
                  <div key={i} className={`grid grid-cols-12 p-4 text-[13px] items-start ${i % 2 ? 'bg-nv-surface-container-low/30' : ''}`}>
                    <div className="col-span-5 text-nv-text font-medium">{c.claimText}</div>
                    <div className="col-span-3"><span className={`px-2 py-0.5 rounded text-[11px] font-[family-name:var(--font-mono)] ${c.verdict === 'SUPPORTED' ? 'text-nv-tertiary bg-nv-tertiary/10' : c.verdict === 'NOT_SUPPORTED' ? 'text-nv-error bg-nv-error/10' : 'text-nv-primary bg-nv-primary/10'}`}>{c.verdict}</span></div>
                    <div className="col-span-4 text-nv-text-dim">{c.reason}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-8 text-center text-[14px] text-nv-text-dim">No claims to verify.</div>
            )}
          </div>
        )}

        {/* INGREDIENTS */}
        {tab === 'Ingredients' && (
          <div className="space-y-4">
            {result.ingredientRisks?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {result.ingredientRisks.map((r, i) => (
                  <div key={i} className="bg-nv-surface-container rounded-xl p-4 border border-nv-outline-variant/15">
                    <div className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">{r.category?.toLowerCase().replace(/_/g, ' ')}</div>
                    <div className="font-[family-name:var(--font-display)] text-[22px] font-bold text-nv-text mt-1">{r.count}</div>
                    <div className="text-[11px] text-nv-text-dim">ingredients</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[14px] text-nv-text-dim">No ingredient risk data available.</div>
            )}

            {result.allergenFindings?.length > 0 && (
              <div className="bg-nv-surface-container rounded-xl p-5 border border-nv-outline-variant/15">
                <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Allergen Findings</h3>
                {result.allergenFindings.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="material-symbols-outlined text-[16px] text-nv-error mt-0.5">warning</span>
                    <div><span className="text-[13px] font-medium text-nv-text">{a.allergenName}</span><span className="text-[13px] text-nv-text-dim ml-2">— {a.matchingIngredients.join(', ')}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NUTRITION */}
        {tab === 'Nutrition' && (
          <div className="space-y-4">
            <div className="bg-nv-surface-container rounded-2xl border border-nv-outline-variant/15 overflow-hidden">
              <div className="grid grid-cols-12 bg-nv-surface-container-high/50 p-3 text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">
                <div className="col-span-6">Nutrient</div>
                <div className="col-span-3">Value</div>
                <div className="col-span-3">Status</div>
              </div>
              {[
                { name: 'Calories', value: `${result.calories} kcal`, high: result.calories > 500 },
                { name: 'Total Fat', value: `${result.fat}g`, high: result.fat > 20 },
                { name: 'Saturated Fat', value: `${result.saturatedFat ?? '—'}g`, high: (result.saturatedFat ?? 0) > 10 },
                { name: 'Trans Fat', value: `${result.transFat ?? '—'}g`, high: (result.transFat ?? 0) > 0 },
                { name: 'Sugar', value: `${result.sugar}g`, high: result.sugar > 15 },
                { name: 'Added Sugar', value: `${result.addedSugar ?? '—'}g`, high: (result.addedSugar ?? 0) > 10 },
                { name: 'Protein', value: `${result.protein}g`, high: false },
                { name: 'Fiber', value: `${result.fiber}g`, high: false },
                { name: 'Sodium', value: `${result.sodium}mg`, high: result.sodium > 600 },
                { name: 'Carbs', value: `${result.carbs}g`, high: false },
              ].map((n, i) => (
                <div key={n.name} className={`grid grid-cols-12 p-4 text-[13px] items-center ${i % 2 ? 'bg-nv-surface-container-low/30' : ''}`}>
                  <div className="col-span-6 text-nv-text">{n.name}</div>
                  <div className="col-span-3 font-[family-name:var(--font-mono)] text-nv-text">{n.value}</div>
                  <div className="col-span-3">
                    <span className={`text-[11px] font-[family-name:var(--font-mono)] ${n.high ? 'text-nv-primary' : 'text-nv-tertiary'}`}>{n.high ? 'HIGH' : 'OK'}</span>
                  </div>
                </div>
              ))}
            </div>

            {result.nutritionFindings?.length > 0 && (
              <div className="space-y-2">
                {result.nutritionFindings.map((f, i) => (
                  <div key={i} className={`flex items-start gap-2 p-3 rounded-xl ${f.problematic ? 'bg-nv-primary/5 border border-nv-primary/15' : 'bg-nv-tertiary/5 border border-nv-tertiary/15'}`}>
                    <span className={`material-symbols-outlined text-[16px] mt-0.5 ${f.problematic ? 'text-nv-primary' : 'text-nv-tertiary'}`}>{f.problematic ? 'warning' : 'check_circle'}</span>
                    <span className="text-[13px] text-nv-text">{f.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {tab === 'Recommendations' && (
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            {result.recommendations?.length > 0 ? (
              <div className="space-y-3">
                {result.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-nv-outline-variant/10 last:border-0">
                    <span className="material-symbols-outlined text-[18px] text-nv-tertiary mt-0.5">check_circle</span>
                    <span className="text-[14px] text-nv-text-muted leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-nv-text-dim text-center py-4">No recommendations available.</p>
            )}
          </div>
        )}

        {/* AI */}
        {tab === 'AI' && (
          <div className="space-y-4">
            {chatResponse && (
              <div className="p-4 bg-nv-primary/5 border border-nv-primary/15 rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[14px] text-nv-primary">smart_toy</span>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-wider">NutriSaathi</span>
                </div>
                <p className="text-[14px] text-nv-text leading-relaxed whitespace-pre-wrap">{chatResponse}</p>
              </div>
            )}
            <div className="flex gap-2">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-nv-surface-container border border-nv-outline-variant/20 rounded-xl px-4 py-3 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors"
                placeholder="Ask about this analysis..." disabled={chatLoading} />
              <button onClick={handleChat} disabled={chatLoading || !chatMsg.trim()} className="w-10 h-10 flex items-center justify-center bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container rounded-xl transition-all disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">{chatLoading ? 'hourglass_empty' : 'arrow_upward'}</span>
              </button>
            </div>
            {result.suggestedQuestions?.length > 0 && !chatResponse && (
              <div className="flex flex-wrap gap-2">
                {result.suggestedQuestions.slice(0, 4).map((q, i) => (
                  <button key={i} onClick={() => setChatMsg(q)} className="text-[12px] px-3 py-1.5 bg-nv-surface-container rounded-lg text-nv-text-dim hover:text-nv-text hover:bg-nv-surface-container-high border border-nv-outline-variant/15 transition-all">{q}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
