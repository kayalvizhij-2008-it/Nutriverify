import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi, type AnalysisResponse } from '../lib/api';

export default function Reports() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AnalysisResponse[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  if (!loaded) {
    historyApi.getAll().then(d => { setItems(Array.isArray(d) ? d : []); setLoaded(true); }).catch(() => setLoaded(true));
  }

  const result = items.find(i => i.historyId === selected);

  const exportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${result.productName}-report.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!result) return;
    const rows = [
      ['Product', result.productName],
      ['Brand', result.brand],
      ['Authenticity Score', String(result.authenticityScore)],
      ['Health Score', String(result.healthScore)],
      ['Calories', String(result.calories)],
      ['Fat', String(result.fat)],
      ['Sugar', String(result.sugar)],
      ['Sodium', String(result.sodium)],
      ['Protein', String(result.protein)],
      ['Carbs', String(result.carbs)],
      ['Fiber', String(result.fiber)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${result.productName}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportTXT = () => {
    if (!result) return;
    const lines = [
      `NutriVerify Analysis Report`,
      `${'='.repeat(40)}`,
      `Product: ${result.productName}`,
      `Brand: ${result.brand || 'N/A'}`,
      `Serving: ${result.servingSize || 'N/A'}`,
      ``,
      `Scores:`,
      `  Authenticity: ${result.authenticityScore}/100`,
      `  Health Quality: ${result.healthScore}/100`,
      ``,
      `Nutrition:`,
      `  Calories: ${result.calories} kcal`,
      `  Fat: ${result.fat}g`,
      `  Sugar: ${result.sugar}g`,
      `  Sodium: ${result.sodium}mg`,
      `  Protein: ${result.protein}g`,
      `  Carbs: ${result.carbs}g`,
      `  Fiber: ${result.fiber}g`,
      ``,
      `Recommendations:`,
      ...(result.recommendations || []).map((r: string) => `  • ${r}`),
      ``,
      `Generated: ${new Date().toISOString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${result.productName}-report.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">Reports</h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Export analysis reports in multiple formats.</p>
      </div>

      {/* Product selector */}
      <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15 mb-6">
        <h3 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Select Product</h3>
        <select value={selected || ''} onChange={e => setSelected(Number(e.target.value) || null)} className="w-full bg-nv-surface border border-nv-outline-variant/20 rounded-xl px-4 py-2.5 text-[14px] text-nv-text focus:outline-none focus:border-nv-primary/40 transition-colors">
          <option value="">Choose an analyzed product...</option>
          {items.map(i => <option key={i.historyId} value={i.historyId}>{i.productName} {i.brand ? `(${i.brand})` : ''}</option>)}
        </select>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { format: 'JSON', icon: 'data_object', desc: 'Structured data export', action: exportJSON, color: 'text-nv-primary' },
            { format: 'CSV', icon: 'table_chart', desc: 'Spreadsheet-compatible', action: exportCSV, color: 'text-nv-tertiary' },
            { format: 'TXT', icon: 'description', desc: 'Plain text report', action: exportTXT, color: 'text-nv-secondary' },
          ].map(f => (
            <button key={f.format} onClick={f.action} className="bg-nv-surface-container rounded-2xl p-6 border border-nv-outline-variant/15 hover:border-nv-outline-variant/30 hover:bg-nv-surface-container-high/50 transition-all text-left group">
              <span className={`material-symbols-outlined text-[28px] ${f.color} block mb-3`}>{f.icon}</span>
              <div className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text">{f.format}</div>
              <p className="text-[12px] text-nv-text-dim mt-1">{f.desc}</p>
            </button>
          ))}
        </div>
      )}

      {!result && loaded && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[40px] text-nv-text-dim block mb-3">description</span>
          <p className="text-[14px] text-nv-text-dim">Select a product to generate a report.</p>
        </div>
      )}
    </div>
  );
}
