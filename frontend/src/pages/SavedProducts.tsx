import { useState, useEffect } from 'react';
import { savedApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function SavedProducts() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savedApi.getAll()
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try { await savedApi.delete(id); setItems(prev => prev.filter(i => i.id !== id)); } catch {}
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Saved Products</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Your saved product analyses and ingredient intel.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[14px] text-nv-text-dim">Loading saved products...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">science</span>
          <p className="text-[14px] text-nv-text-dim mb-4">No saved products yet.</p>
          <button onClick={() => navigate('/analyze')} className="px-5 py-2.5 bg-nv-primary-container/15 hover:bg-nv-primary-container/25 text-nv-primary text-[13px] font-medium rounded-xl border border-nv-primary/20 transition-all">Analyze a Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15 hover:border-nv-outline-variant/25 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-nv-text truncate">{item.productName}</h3>
                  <p className="text-[12px] text-nv-text-dim">{item.brand || 'Unknown brand'}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-1 text-nv-text-dim hover:text-nv-error rounded transition-colors">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-nv-surface/50 rounded-lg p-2 text-center">
                  <div className={`font-[family-name:var(--font-display)] text-[18px] font-bold ${item.authenticityScore >= 80 ? 'text-nv-tertiary' : item.authenticityScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{item.authenticityScore}</div>
                  <div className="text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">Authenticity</div>
                </div>
                <div className="bg-nv-surface/50 rounded-lg p-2 text-center">
                  <div className={`font-[family-name:var(--font-display)] text-[18px] font-bold ${item.healthScore >= 80 ? 'text-nv-tertiary' : item.healthScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{item.healthScore}</div>
                  <div className="text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">Health</div>
                </div>
              </div>
              {item.riskLevel && (
                <div className="mt-3 text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">
                  Risk: <span className={item.riskLevel === 'LOW' ? 'text-nv-tertiary' : item.riskLevel === 'HIGH' ? 'text-nv-error' : 'text-nv-primary'}>{item.riskLevel}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
