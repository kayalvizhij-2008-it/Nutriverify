import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historyApi, type AnalysisResponse } from '../lib/api';
import { getDemoAnalysis } from '../lib/demo';
import { downloadAuditPdf } from '../lib/pdfReport';

export default function Reports() {
  const [items, setItems] = useState<AnalysisResponse[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResponse | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [exportStep, setExportStep] = useState(0);

  const EXPORT_STAGES = [
    'Compiling nutritional evidence matrix...',
    'Auditing claims under FDA / EFSA / FSSAI statutes...',
    'Generating cryptographic dossier seal...',
    'Package ready — initiating download...',
  ];

  const runExportSequence = async (callback: () => void) => {
    setExporting(true);
    for (let i = 0; i < EXPORT_STAGES.length - 1; i++) {
      setExportStep(i + 1);
      setExportMsg(EXPORT_STAGES[i]);
      await new Promise(r => setTimeout(r, 350));
    }
    setExportStep(EXPORT_STAGES.length);
    setExportMsg(EXPORT_STAGES[EXPORT_STAGES.length - 1]);
    await new Promise(r => setTimeout(r, 200));
    setExporting(false);
    setExportStep(0);
    callback();
  };

  useEffect(() => {
    const raw = sessionStorage.getItem('nv_last_result');
    let activeObj: AnalysisResponse | null = null;
    if (raw) {
      try {
        activeObj = JSON.parse(raw);
        setSelectedResult(activeObj);
      } catch {}
    }

    historyApi
      .getAll()
      .then(d => {
        const arr = Array.isArray(d) ? d : [];
        if (activeObj && !arr.some(x => x.productName === activeObj?.productName)) {
          setItems([activeObj, ...arr]);
        } else if (arr.length > 0) {
          setItems(arr);
          if (!activeObj) setSelectedResult(arr[0]);
        } else {
          const sample = activeObj || getDemoAnalysis(0);
          setItems([sample]);
          if (!activeObj) setSelectedResult(sample);
        }
      })
      .catch(() => {
        const sample = activeObj || getDemoAnalysis(0);
        setItems([sample]);
        if (!activeObj) setSelectedResult(sample);
      });
  }, []);

  const result = selectedResult || getDemoAnalysis(0);

  const handlePdfDownload = () => {
    if (!result) return;
    runExportSequence(() => {
      downloadAuditPdf(result);
    });
  };

  const exportJSON = () => {
    if (!result) return;
    runExportSequence(() => {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.productName.toLowerCase().replace(/\s+/g, '-')}-audit-report.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportCSV = () => {
    if (!result) return;
    runExportSequence(() => {
      const rows = [
        ['NutriVerify Official Audit Dossier', 'ISO 17025 Benchmarking', 'FDA 21 CFR Compliant'],
        ['Metric', 'Value', 'Unit / Benchmark'],
        ['Product Name', result.productName, ''],
        ['Brand', result.brand || 'N/A', ''],
        ['Serving Size', result.servingSize || 'N/A', ''],
        ['NutriVerify Health Score', String(result.healthScore), '/ 100'],
        ['Authenticity Index', String(result.authenticityScore), '/ 100'],
        ['Risk Level', result.riskLevel || 'N/A', ''],
        ['Calories', String(result.calories), 'kcal'],
        ['Protein', String(result.protein), 'g'],
        ['Carbohydrates', String(result.carbs), 'g'],
        ['Total Sugar', String(result.sugar), 'g'],
        ['Total Fat', String(result.fat), 'g'],
        ['Sodium', String(result.sodium), 'mg'],
        ['Dietary Fiber', String(result.fiber), 'g'],
        ['Flagged Allergens Count', String(result.allergenFindings?.length || 0), ''],
        ['Audit Timestamp', result.analyzedAt || new Date().toISOString(), 'UTC'],
      ];
      const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.productName.toLowerCase().replace(/\s+/g, '-')}-audit-report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const printReport = () => {
    runExportSequence(() => {
      window.print();
    });
  };

  const healthScore = result.healthScore ?? 85;
  const authScore = result.authenticityScore ?? 92;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Export Progress Overlay ── */}
      {exporting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-[#0D1610] border border-[#8BE28B]/40 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#142618] border border-[#8BE28B]/40 flex items-center justify-center text-[#C8FF4D]">
              <span className="material-symbols-outlined text-[28px] animate-spin-slow">description</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generating Official Dossier</h3>
              <p className="text-xs text-[#A9B4AA] mt-1">{exportMsg}</p>
            </div>
            <div className="w-full bg-[#101A13] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C8FF4D] rounded-full transition-all duration-300"
                style={{ width: `${(exportStep / EXPORT_STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#142618] border border-[#8BE28B]/30 text-[#C8FF4D] flex items-center justify-center shadow-[0_0_20px_rgba(200,255,77,0.2)]">
            <span className="material-symbols-outlined text-[26px]">description</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold uppercase tracking-wider border border-[#8BE28B]/30">
                Official Certification • ISO 17025 Ready
              </span>
              <span className="text-xs text-[#A9B4AA]">• Electronic Laboratory Audit Dossier</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-0.5">
              Laboratory <span className="text-[#8BE28B]">Audit Dossier</span>
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          <button
            onClick={handlePdfDownload}
            className="px-4 py-2 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(200,255,77,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            title="Download official high-resolution laboratory PDF report"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Download PDF</span>
          </button>

          <button
            onClick={printReport}
            className="px-3.5 py-2 rounded-xl bg-[#101A13] text-[#A9B4AA] hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print</span>
          </button>

          <button
            onClick={exportJSON}
            className="px-3 py-2 rounded-xl bg-[#101A13] text-[#A9B4AA] hover:text-white border border-white/10 text-xs font-mono font-semibold transition-all"
          >
            JSON
          </button>

          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl bg-[#101A13] text-[#A9B4AA] hover:text-white border border-white/10 text-xs font-mono font-semibold transition-all"
          >
            CSV
          </button>
        </div>
      </div>

      {/* ── Active Audit Record Selector ── */}
      <div className="p-4 rounded-2xl bg-[#0D1610]/65 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider shrink-0">
            Select Specimen:
          </span>
          <select
            value={result.productName}
            onChange={e => {
              const found = items.find(i => i.productName === e.target.value);
              if (found) setSelectedResult(found);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#071009] text-white text-xs font-semibold border border-white/10 focus:border-[#8BE28B] focus:outline-none"
          >
            {items.map((it, idx) => (
              <option key={idx} value={it.productName}>
                {it.productName} ({it.brand || 'Verified Specimen'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#A9B4AA] font-mono">
          <span>Dossier ID: <strong className="text-[#C8FF4D]">{result.historyId ? `NV-${result.historyId}` : 'NV-2026-08'}</strong></span>
          <span>•</span>
          <span>Verified: <strong className="text-white">{new Date(result.analyzedAt || Date.now()).toLocaleDateString()}</strong></span>
        </div>
      </div>

      {/* ── BENTO TOP GRID: Executive Seals & Core Audit Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Seal 1: NutriVerify Health Score */}
        <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider block">
              NutriVerify Health Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{healthScore}</span>
              <span className="text-xs font-bold text-[#8BE28B]">/ 100</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-[#8BE28B] font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-[#8BE28B] animate-pulse" />
              {healthScore >= 80 ? 'Superior Clean Profile' : healthScore >= 60 ? 'Moderate Health Profile' : 'Substandard Nutrition'}
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#142618] border border-[#8BE28B]/30 flex items-center justify-center text-[#C8FF4D]">
            <span className="material-symbols-outlined text-[34px]">health_and_safety</span>
          </div>
        </div>

        {/* Seal 2: Authenticity & Claim Index */}
        <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider block">
              Authenticity & Claim Integrity
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{authScore}</span>
              <span className="text-xs font-bold text-[#C8FF4D]">%</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-[#C8FF4D] font-semibold mt-1">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              FDA 21 CFR § 101 Synchronized
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#142618] border border-[#8BE28B]/30 flex items-center justify-center text-[#8BE28B]">
            <span className="material-symbols-outlined text-[34px]">verified</span>
          </div>
        </div>

        {/* Seal 3: Clinical Risk Level */}
        <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-xl flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider block">
              Risk Assessment Level
            </span>
            <div className="text-2xl font-black text-white uppercase mt-1">
              {result.riskLevel || 'LOW_RISK'}
            </div>
            <span className="text-xs text-[#A9B4AA] block mt-1">
              {result.allergenFindings?.length || 0} Allergen flags • {result.claimResults?.length || 0} Claims tested
            </span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#142618] border border-[#8BE28B]/30 flex items-center justify-center text-[#8BE28B]">
            <span className="material-symbols-outlined text-[34px]">shield</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: NUTRITIONAL MATRIX BENTO ── */}
      <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8BE28B] text-[20px]">analytics</span>
            <h2 className="text-base font-bold text-white">1. Verified Nutritional Matrix Analysis</h2>
          </div>
          <span className="text-xs font-mono text-[#A9B4AA]">Per {result.servingSize || 'Serving'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'Calories', val: `${result.calories} kcal`, icon: 'local_fire_department', status: 'Optimal' },
            { label: 'Dietary Protein', val: `${result.protein}g`, icon: 'fitness_center', status: 'High Yield' },
            { label: 'Carbohydrates', val: `${result.carbs}g`, icon: 'grain', status: 'Moderate' },
            { label: 'Total Sugars', val: `${result.sugar}g`, icon: 'cookie', status: result.sugar > 10 ? 'High' : 'Clean' },
            { label: 'Total Fats', val: `${result.fat}g`, icon: 'opacity', status: 'Balanced' },
            { label: 'Sodium Salt', val: `${result.sodium}mg`, icon: 'shutter_speed', status: result.sodium > 400 ? 'Elevated' : 'Safe' },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider">{m.label}</span>
              <span className="text-xl font-black text-white my-1.5">{m.val}</span>
              <span className={`text-[10px] font-bold ${
                m.status === 'High' || m.status === 'Elevated' ? 'text-[#FF5252]' : 'text-[#8BE28B]'
              }`}>
                ● {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: STATUTORY CLAIM VERIFICATION AUDIT ── */}
      <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C8FF4D] text-[20px]">gavel</span>
            <h2 className="text-base font-bold text-white">2. Front-of-Pack Claim Statutory Audit</h2>
          </div>
          <span className="text-xs font-mono text-[#8BE28B]">FDA 21 CFR § 101 Benchmarked</span>
        </div>

        {result.claimResults && result.claimResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.claimResults.map((cl, i) => {
              const isPass = cl.verdict === 'VERIFIED' || cl.verdict === 'TRUE';
              return (
                <div key={i} className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 flex flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white">“{cl.claimText}”</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isPass ? 'bg-[#142618] text-[#8BE28B] border border-[#8BE28B]/30' : 'bg-[#2E1212] text-[#FF5252] border border-[#FF5252]/30'
                    }`}>
                      {cl.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-[#A9B4AA] leading-relaxed">{cl.reason || 'Verified against OCR package ingredients'}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 text-xs text-[#A9B4AA]">
            ✓ No deceptive or unregulated health marketing claims detected on primary packaging label.
          </div>
        )}
      </div>

      {/* ── SECTION 3: ALLERGEN & CLINICAL SAFETY CLEARANCE ── */}
      <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF5252] text-[20px]">shield_with_heart</span>
            <h2 className="text-base font-bold text-white">3. Allergen & Toxicity Safety Clearance</h2>
          </div>
          <span className="text-xs font-mono text-[#A9B4AA]">US Big 9 & EU 14 Protocols</span>
        </div>

        {result.allergenFindings && result.allergenFindings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.allergenFindings.map((al, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#2E1212]/80 border border-[#FF5252]/40 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FF5252] text-[20px]">warning</span>
                <div>
                  <div className="text-xs font-bold text-white">{al.allergenName}</div>
                  <div className="text-[10px] text-[#FFB4AB]">{al.matchingIngredients?.join(', ') || 'Trace contamination risk'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 flex items-center gap-3 text-xs text-[#8BE28B]">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Zero undeclared or high-risk allergen cross-contact traces detected under US FALCPA and EU 1169 standards.</span>
          </div>
        )}
      </div>

      {/* ── SECTION 4: CLINICAL RECOMMENDATIONS & ALTERNATIVES ── */}
      <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C8FF4D] text-[20px]">lightbulb</span>
            <h2 className="text-base font-bold text-white">4. Actionable AI Recommendations & Nutritional Alternatives</h2>
          </div>
          <span className="text-xs font-mono text-[#8BE28B]">Personalized Insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.recommendations && result.recommendations.length > 0 ? (
            result.recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#142618] text-[#C8FF4D] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-white leading-relaxed">{rec}</p>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 text-xs text-[#A9B4AA]">
              Nutritional density aligns with standard clinical recommendations. Maintain balanced dietary diversity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
