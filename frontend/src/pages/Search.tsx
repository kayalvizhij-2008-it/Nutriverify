import { useState, useEffect } from 'react';
import { historyApi, type AnalysisResponse } from '../lib/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyApi.getAll()
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const results = query.trim() ? items.filter(a =>
    a.productName.toLowerCase().includes(query.toLowerCase()) ||
    (a.brand && a.brand.toLowerCase().includes(query.toLowerCase())) ||
    (a.recommendations && a.recommendations.some(r => r.toLowerCase().includes(query.toLowerCase())))
  ) : [];

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Search</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Search your analyzed products.</p>
      </div>

      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-nv-text-dim">search</span>
        <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
          className="w-full bg-nv-surface-container border border-nv-outline-variant/15 rounded-xl pl-10 pr-4 py-3 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors"
          placeholder="Search products, brands, or recommendations..." />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[14px] text-nv-text-dim">Loading...</div>
      ) : query.trim() && results.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">search_off</span>
          <p className="text-[14px] text-nv-text-dim">No results found for "{query}"</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map(a => (
            <div key={a.historyId} className="bg-nv-surface-container rounded-xl p-4 border border-nv-outline-variant/15 hover:border-nv-outline-variant/25 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-nv-text">{a.productName}</div>
                  <div className="text-[12px] text-nv-text-dim">{a.brand || 'Unknown brand'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[13px] font-[family-name:var(--font-mono)] font-bold ${a.authenticityScore >= 80 ? 'text-nv-tertiary' : a.authenticityScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{a.authenticityScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">search</span>
          <p className="text-[14px] text-nv-text-dim">Start typing to search your analyses.</p>
        </div>
      )}
    </div>
  );
}
