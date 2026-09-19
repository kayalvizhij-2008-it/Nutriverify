import { useState } from 'react';
import { historyApi, compareApi, type AnalysisResponse } from '../lib/api';

export default function Compare() {
  const [history, setHistory] = useState<AnalysisResponse[]>([]);
  const [first, setFirst] = useState<number | null>(null);
  const [second, setSecond] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const loadHistory = async () => {
    try { const data = await historyApi.getAll(); setHistory(Array.isArray(data) ? data : []); setLoaded(true); } catch {} finally { setLoading(false); }
  };

  const doCompare = async () => {
    if (!first || !second) { setError('Select two products to compare'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await compareApi.compare(first, second);
      setResult(res);
    } catch (err: any) { setError(err?.message || 'Comparison failed'); }
    finally { setLoading(false); }
  };

  if (!loaded) { loadHistory(); }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Product Comparison</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Compare two analyzed products side by side.</p>
      </div>

      {error && <div className="mb-4 p-3 bg-nv-error/10 border border-nv-error/20 rounded-xl text-[13px] text-nv-error">{error}</div>}

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map(n => (
          <div key={n} className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15">
            <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Product {n}</h3>
            <select value={n === 1 ? first || '' : second || ''} onChange={e => n === 1 ? setFirst(Number(e.target.value)) : setSecond(Number(e.target.value))}
              className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text focus:outline-none focus:border-nv-primary/40 transition-colors">
              <option value="">Select a product...</option>
              {history.map(h => <option key={h.historyId} value={h.historyId}>{h.productName} {h.brand ? `(${h.brand})` : ''}</option>)}
            </select>
          </div>
        ))}
      </div>

      <button onClick={doCompare} disabled={loading || !first || !second} className="w-full py-3 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container font-[family-name:var(--font-display)] text-[15px] font-semibold rounded-xl transition-all disabled:opacity-50 mb-8">
        {loading ? 'Comparing...' : 'Compare Products'}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15">
            <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text mb-2">{result.productA} vs {result.productB}</h3>
            <p className="text-[13px] text-nv-text-muted">{result.summary}</p>
          </div>

          <div className="bg-nv-surface-container rounded-2xl overflow-hidden border border-nv-outline-variant/15">
            <div className="grid grid-cols-3 bg-nv-surface-container-high/50 p-4 text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider">
              <div>Metric</div>
              <div>{result.productA}</div>
              <div>{result.productB}</div>
            </div>
            {result.metrics?.map((m: any, i: number) => (
              <div key={i} className={`grid grid-cols-3 p-4 text-[13px] ${i % 2 === 0 ? 'bg-nv-surface-container-low/30' : 'bg-nv-surface-container/30'}`}>
                <div className="text-nv-text font-medium">{m.name}</div>
                <div className={`text-nv-text-muted ${m.betterFor === result.productA ? 'text-nv-tertiary font-medium' : ''}`}>{m.productAValue}</div>
                <div className={`text-nv-text-muted ${m.betterFor === result.productB ? 'text-nv-tertiary font-medium' : ''}`}>{m.productBValue}</div>
              </div>
            ))}
          </div>

          {result.recommended && (
            <div className="p-4 bg-nv-tertiary/5 border border-nv-tertiary/15 rounded-xl">
              <span className="text-[13px] text-nv-tertiary font-medium">Recommended: {result.recommended}</span>
            </div>
          )}
        </div>
      )}

      {!result && history.length === 0 && !loading && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">compare_arrows</span>
          <p className="text-[14px] text-nv-text-dim">Analyze at least two products to compare them.</p>
        </div>
      )}
    </div>
  );
}
