import { useState, useEffect } from 'react';
import { historyApi, type AnalysisResponse } from '../lib/api';

export default function History() {
  const [items, setItems] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    historyApi.getAll()
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(a =>
    a.productName.toLowerCase().includes(search.toLowerCase()) ||
    (a.brand && a.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    try {
      await historyApi.delete(id);
      setItems(prev => prev.filter(i => i.historyId !== id));
    } catch {}
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Analysis History</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Review your past food label analyses.</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-nv-text-dim">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-nv-surface-container border border-nv-outline-variant/15 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-nv-text placeholder:text-nv-text-dim focus:outline-none focus:border-nv-primary/40 transition-colors" placeholder="Search by product name or brand..." />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[14px] text-nv-text-dim">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">query_stats</span>
          <p className="text-[14px] text-nv-text-dim">{search ? 'No results match your search.' : 'No analyses yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.historyId} className="flex items-center justify-between bg-nv-surface-container rounded-xl p-4 border border-nv-outline-variant/15 hover:border-nv-outline-variant/25 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-nv-primary-container/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-nv-primary">verified</span>
                </div>
                <div className="min-w-0">
                  <div className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-nv-text truncate">{a.productName}</div>
                  <div className="text-[12px] text-nv-text-dim">{a.brand || 'Unknown'} · {new Date(a.analyzedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">Auth</div>
                    <div className={`font-[family-name:var(--font-display)] text-[16px] font-bold ${a.authenticityScore >= 80 ? 'text-nv-tertiary' : a.authenticityScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{a.authenticityScore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">Health</div>
                    <div className={`font-[family-name:var(--font-display)] text-[16px] font-bold ${a.healthScore >= 80 ? 'text-nv-tertiary' : a.healthScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{a.healthScore}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.historyId!)} className="p-1.5 text-nv-text-dim hover:text-nv-error rounded-lg hover:bg-nv-error/5 transition-colors" title="Delete">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
