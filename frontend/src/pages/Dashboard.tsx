import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { historyApi, type AnalysisResponse } from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyApi.getAll()
      .then(data => setAnalyses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAnalyses = analyses.length;
  const avgAuth = totalAnalyses > 0 ? Math.round(analyses.reduce((s, a) => s + a.authenticityScore, 0) / totalAnalyses) : 0;
  const avgHealth = totalAnalyses > 0 ? Math.round(analyses.reduce((s, a) => s + a.healthScore, 0) / totalAnalyses) : 0;
  const concerns = analyses.reduce((s, a) => s + (a.insightCards?.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL').length || 0), 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-nv-text tracking-tight">
          Welcome back, {user?.fullName || user?.username}
        </h1>
        <p className="text-[14px] text-nv-text-muted mt-1">Here's your verification overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Analyses', value: totalAnalyses, icon: 'document_scanner', color: 'text-nv-primary' },
          { label: 'Avg Authenticity', value: totalAnalyses > 0 ? `${avgAuth}/100` : '—', icon: 'verified', color: 'text-nv-tertiary' },
          { label: 'Avg Health Score', value: totalAnalyses > 0 ? `${avgHealth}/100` : '—', icon: 'monitor_heart', color: 'text-nv-tertiary' },
          { label: 'Concerns Found', value: concerns, icon: 'warning', color: concerns > 0 ? 'text-nv-primary' : 'text-nv-tertiary' },
        ].map(stat => (
          <div key={stat.label} className="bg-nv-surface-container rounded-xl p-5 border border-nv-outline-variant/15">
            <span className={`material-symbols-outlined text-[20px] ${stat.color} block mb-3`}>{stat.icon}</span>
            <div className="font-[family-name:var(--font-display)] text-[24px] font-bold text-nv-text">{stat.value}</div>
            <div className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link to="/analyze" className="flex items-center gap-4 bg-nv-surface-container rounded-xl p-5 border border-nv-outline-variant/15 hover:border-nv-primary/20 hover:bg-nv-surface-container-high/50 transition-all group">
          <div className="w-11 h-11 rounded-xl bg-nv-primary-container/10 flex items-center justify-center group-hover:bg-nv-primary-container/20 transition-colors">
            <span className="material-symbols-outlined text-[22px] text-nv-primary">document_scanner</span>
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-nv-text">Analyze Food Label</div>
            <div className="text-[12px] text-nv-text-dim">Scan, upload, or enter a label</div>
          </div>
        </Link>
        <Link to="/compare" className="flex items-center gap-4 bg-nv-surface-container rounded-xl p-5 border border-nv-outline-variant/15 hover:border-nv-outline-variant/30 hover:bg-nv-surface-container-high/50 transition-all group">
          <div className="w-11 h-11 rounded-xl bg-nv-surface-container-high flex items-center justify-center group-hover:bg-nv-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[22px] text-nv-text-muted group-hover:text-nv-text">compare_arrows</span>
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-nv-text">Compare Products</div>
            <div className="text-[12px] text-nv-text-dim">Side-by-side verification</div>
          </div>
        </Link>
        <Link to="/chat" className="flex items-center gap-4 bg-nv-surface-container rounded-xl p-5 border border-nv-outline-variant/15 hover:border-nv-outline-variant/30 hover:bg-nv-surface-container-high/50 transition-all group">
          <div className="w-11 h-11 rounded-xl bg-nv-surface-container-high flex items-center justify-center group-hover:bg-nv-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-[22px] text-nv-text-muted group-hover:text-nv-text">smart_toy</span>
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-nv-text">AI Assistant</div>
            <div className="text-[12px] text-nv-text-dim">Ask NutriSaathi anything</div>
          </div>
        </Link>
      </div>

      {/* Recent analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text">Recent Analyses</h2>
          {analyses.length > 0 && (
            <Link to="/history" className="text-[13px] text-nv-primary hover:underline">View All</Link>
          )}
        </div>

        {loading ? (
          <div className="bg-nv-surface-container rounded-xl p-10 border border-nv-outline-variant/15 text-center">
            <span className="text-[14px] text-nv-text-dim">Loading analyses...</span>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-nv-surface-container rounded-xl p-10 border border-nv-outline-variant/15 text-center">
            <span className="material-symbols-outlined text-[32px] text-nv-text-dim block mb-3">document_scanner</span>
            <p className="text-[14px] text-nv-text-dim mb-4">No analyses yet. Start by analyzing a food label.</p>
            <Link to="/analyze" className="inline-flex items-center gap-2 px-5 py-2.5 bg-nv-primary-container/15 hover:bg-nv-primary-container/25 text-nv-primary text-[13px] font-medium rounded-xl border border-nv-primary/20 transition-all">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Analyze Now
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.slice(0, 5).map(a => (
              <Link key={a.historyId || a.productName} to="/results" className="flex items-center justify-between bg-nv-surface-container rounded-xl p-4 border border-nv-outline-variant/15 hover:border-nv-outline-variant/25 hover:bg-nv-surface-container-high/30 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-nv-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-nv-primary">verified</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-nv-text truncate">{a.productName}</div>
                    <div className="text-[12px] text-nv-text-dim">{a.brand || 'Unknown brand'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">Authenticity</div>
                    <div className={`font-[family-name:var(--font-display)] text-[16px] font-bold ${a.authenticityScore >= 80 ? 'text-nv-tertiary' : a.authenticityScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{a.authenticityScore}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase">Health</div>
                    <div className={`font-[family-name:var(--font-display)] text-[16px] font-bold ${a.healthScore >= 80 ? 'text-nv-tertiary' : a.healthScore >= 50 ? 'text-nv-primary' : 'text-nv-error'}`}>{a.healthScore}</div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-nv-text-dim">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
