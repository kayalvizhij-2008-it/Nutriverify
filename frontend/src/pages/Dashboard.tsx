import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { historyApi, type AnalysisResponse } from '../lib/api';
import { DEMO_ANALYSES_SEED } from '../lib/demo';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, CartesianGrid,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
const LIME   = '#C8FF4D';
const GREEN  = '#8BE28B';
const MUTED  = '#A9B4AA';
const RED    = '#FF6B6B';
const AMBER  = '#FFD166';
const BLUE   = '#7EB8F7';

const riskColors: Record<string, string> = {
  LOW: GREEN, MEDIUM: AMBER, HIGH: RED, CRITICAL: RED, UNKNOWN: MUTED,
  LOW_RISK: GREEN, MODERATE_RISK: AMBER, HIGH_RISK: RED,
  TRUSTED: GREEN, SUSPICIOUS: AMBER,
};

function scoreColor(score: number): string {
  if (score >= 75) return GREEN;
  if (score >= 50) return AMBER;
  return RED;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

function fmtChartDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface DerivedStats {
  total: number;
  avgHealth: number;
  avgAuth: number;
  allergenCount: number;
  verifiedClaims: number;
  totalClaims: number;
  concerns: number;
  lowRisk: number;
  medRisk: number;
  highRisk: number;
}

function deriveStats(analyses: AnalysisResponse[]): DerivedStats {
  const total = analyses.length;
  if (total === 0) return {
    total: 0, avgHealth: 0, avgAuth: 0, allergenCount: 0,
    verifiedClaims: 0, totalClaims: 0, concerns: 0,
    lowRisk: 0, medRisk: 0, highRisk: 0,
  };
  const avgHealth = Math.round(analyses.reduce((s, a) => s + (a.healthScore ?? 0), 0) / total);
  const avgAuth   = Math.round(analyses.reduce((s, a) => s + (a.authenticityScore ?? 0), 0) / total);
  const allergenCount = analyses.reduce((s, a) => s + (a.allergenFindings?.length ?? 0), 0);
  const verifiedClaims = analyses.reduce(
    (s, a) => s + (a.claimResults?.filter(c => c.verdict === 'VERIFIED' || c.verdict === 'TRUE').length ?? 0), 0
  );
  const totalClaims = analyses.reduce((s, a) => s + (a.claimResults?.length ?? 0), 0);
  const concerns = analyses.reduce(
    (s, a) => s + (a.insightCards?.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL' || c.severity === 'warning').length ?? 0), 0
  );
  const riskNorm = (a: AnalysisResponse) => {
    const r = (a.riskLevel ?? '').toUpperCase();
    if (r.includes('LOW') || r === 'TRUSTED') return 'LOW';
    if (r.includes('MED') || r.includes('MOD') || r === 'SUSPICIOUS') return 'MED';
    return 'HIGH';
  };
  const lowRisk  = analyses.filter(a => riskNorm(a) === 'LOW').length;
  const medRisk  = analyses.filter(a => riskNorm(a) === 'MED').length;
  const highRisk = analyses.filter(a => riskNorm(a) === 'HIGH').length;
  return { total, avgHealth, avgAuth, allergenCount, verifiedClaims, totalClaims, concerns, lowRisk, medRisk, highRisk };
}

// ─── Animated Count-up ───────────────────────────────────────────────────────
function CountUp({ target, suffix = '', duration = 1200 }: { target: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setDisplay(0); return; }
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{display}{suffix}</>;
}

// ─── Health Score SVG Ring ────────────────────────────────────────────────────
function HealthScoreRing({ score }: { score: number }) {
  const r = 52, cx = 72, cy = 72;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  return (
    <div className="relative flex items-center justify-center">
      <svg width={144} height={144} viewBox="0 0 144 144" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2b1f" strokeWidth={10} />
        <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          filter="url(#ring-glow)"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '0.2s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-bold leading-none" style={{ color, fontFamily: 'var(--font-display)' }}>
          <CountUp target={score} />
        </span>
        <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: MUTED }}>Health Score</span>
      </div>
    </div>
  );
}

// ─── Mini Ring ────────────────────────────────────────────────────────────────
function MiniRing({ score, color }: { score: number; color: string }) {
  const r = 15.9155, c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
      <path d={`M18 2.0845 a ${r} ${r} 0 0 1 0 31.831 a ${r} ${r} 0 0 1 0 -31.831`} fill="none" stroke="#1a2b1f" strokeWidth="4" />
      <path
        d={`M18 2.0845 a ${r} ${r} 0 0 1 0 31.831 a ${r} ${r} 0 0 1 0 -31.831`}
        fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        style={{ strokeDasharray: c, strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

// ─── Bento Stat Card ──────────────────────────────────────────────────────────
function BentoStatCard({
  icon, label, value, suffix = '', sub, accentColor, noData
}: {
  icon: string; label: string; value: number; suffix?: string;
  sub?: string; accentColor: string; noData?: boolean;
}) {
  return (
    <div className="relative bg-[#0f1a12] rounded-2xl p-5 border border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300 hover:-translate-y-0.5">
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)`, transform: 'translate(40%, -40%)' }}
      />
      <span className="material-symbols-outlined text-[20px] mb-3 block" style={{ color: accentColor }}>{icon}</span>
      <div className="text-[30px] font-bold leading-none mb-1" style={{ color: accentColor, fontFamily: 'var(--font-display)' }}>
        {noData ? '—' : <CountUp target={value} suffix={suffix} />}
      </div>
      <div className="text-[11px] uppercase tracking-widest font-mono" style={{ color: MUTED }}>{label}</div>
      {sub && <div className="text-[11px] mt-1.5" style={{ color: MUTED }}>{sub}</div>}
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { to: '/camera-scan',   icon: 'photo_camera',   label: 'Camera Scan',  desc: 'Point & analyze live',   color: MUTED },
  { to: '/upload',        icon: 'cloud_upload',   label: 'Upload Label', desc: 'Photo or image file',    color: LIME, featured: true },
  { to: '/manual',        icon: 'edit_note',      label: 'Manual Entry', desc: 'Type values by hand',    color: AMBER },
  { to: '/nutrisaathi',   icon: 'smart_toy',      label: 'AI Chat',      desc: 'Ask NutriVerify AI',     color: GREEN },
  { to: '/compare',       icon: 'compare_arrows', label: 'Compare',      desc: 'Side-by-side products',  color: BLUE },
  { to: '/reports',       icon: 'description',    label: 'Reports',      desc: 'Export & insights',      color: '#C5A3FF' },
];

// ─── Scan Row ─────────────────────────────────────────────────────────────────
function ScanRow({ analysis, idx, isDemo }: { analysis: AnalysisResponse; idx: number; isDemo: boolean }) {
  const hColor = scoreColor(analysis.healthScore ?? 0);
  const rColor = riskColors[(analysis.riskLevel ?? 'UNKNOWN').toUpperCase()] ?? MUTED;
  const displayRisk = (analysis.riskLevel ?? 'N/A').replace(/_/g, ' ').replace('RISK', '').trim() || 'N/A';

  return (
    <Link
      to="/results"
      onClick={() => sessionStorage.setItem('nv_last_result', JSON.stringify(analysis))}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 bg-[#0c150e] hover:bg-[#0f1a12] transition-all"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      <div className="relative flex-shrink-0">
        <MiniRing score={analysis.healthScore ?? 0} color={hColor} />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold rotate-90" style={{ color: hColor }}>
          {analysis.healthScore}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-semibold text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>
            {analysis.productName}
          </div>
          {isDemo && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0"
              style={{ color: '#7EB8F7', borderColor: 'rgba(126,184,247,0.25)', background: 'rgba(126,184,247,0.08)' }}>
              SAMPLE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px]" style={{ color: MUTED }}>{analysis.brand || 'Unknown brand'}</span>
          <span style={{ color: '#2a3d2d' }}>·</span>
          <span className="text-[11px] font-mono" style={{ color: MUTED }}>{fmtDate(analysis.analyzedAt)}</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase" style={{ color: MUTED }}>Auth</div>
          <div className="text-[14px] font-bold" style={{ color: scoreColor(analysis.authenticityScore ?? 0) }}>
            {analysis.authenticityScore}
          </div>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase"
          style={{ color: rColor, borderColor: `${rColor}33`, background: `${rColor}0f` }}
        >
          {displayRisk}
        </span>
      </div>
      <span className="material-symbols-outlined text-[16px] flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: LIME }}>chevron_right</span>
    </Link>
  );
}

// ─── Tips ─────────────────────────────────────────────────────────────────────
const TIPS = [
  { icon: 'science', text: 'Trans fats raise LDL cholesterol and lower HDL. Always check for "partially hydrogenated oils" in the ingredients list.', tag: 'FATS' },
  { icon: 'water_drop', text: 'Sodium above 600 mg per serving exceeds 25% of the daily limit. Rinse canned beans and vegetables to cut up to 40% of their sodium.', tag: 'SODIUM' },
  { icon: 'local_fire_department', text: 'Added sugars account for up to 17 tsp/day in the average diet. The WHO recommends keeping it under 6 tsp (25 g).', tag: 'SUGAR' },
  { icon: 'grass', text: 'A product with >5 g fiber per serving is considered "high-fiber". Aim for 25–38 g daily for digestive and metabolic health.', tag: 'FIBER' },
  { icon: 'psychology', text: 'Color additives like Red 40 and Yellow 5 have been linked to hyperactivity in children in some studies.', tag: 'ADDITIVES' },
  { icon: 'verified', text: '"Natural flavors" is a catch-all term that can include hundreds of compounds — it does not guarantee absence of allergens or artificial processing.', tag: 'CLAIMS' },
  { icon: 'monitor_heart', text: 'Glycemic index (GI) matters more than sugar count alone. A food with 10 g sugar can spike blood glucose more than one with 20 g if it lacks fiber or fat.', tag: 'GLYCEMIC' },
  { icon: 'energy_savings_leaf', text: 'Organic certification does not mean pesticide-free. It means synthetic pesticides are restricted.', tag: 'ORGANIC' },
];

function TipOfTheDay() {
  const tip = TIPS[new Date().getDate() % TIPS.length];
  return (
    <div className="bg-[#0f1a12] rounded-2xl border border-white/5 p-5 flex gap-4 items-start">
      <div className="w-10 h-10 rounded-xl bg-[#C8FF4D]/10 flex-shrink-0 flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px]" style={{ color: LIME }}>{tip.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color: LIME, borderColor: `${LIME}33`, background: `${LIME}0d` }}>
            TIP · {tip.tag}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: MUTED }}>{tip.text}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-white/4 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

// ─── Demo Banner ──────────────────────────────────────────────────────────────
function DemoBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: 'rgba(126,184,247,0.06)', borderColor: 'rgba(126,184,247,0.2)' }}>
      <span className="material-symbols-outlined text-[18px]" style={{ color: BLUE }}>info</span>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-widest mr-2" style={{ color: BLUE }}>DEMO MODE</span>
        <span className="text-[12px]" style={{ color: MUTED }}>
          Showing sample analyses. Run your first scan to see your real data here.
        </span>
      </div>
      <Link to="/analyze"
        className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors"
        style={{ color: LIME, borderColor: `${LIME}30`, background: `${LIME}0a` }}>
        Start Scan
      </Link>
    </div>
  );
}

// ─── Empty state (real user, no data) ─────────────────────────────────────────
function EmptyReal() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-[#C8FF4D]/8 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px]" style={{ color: LIME }}>document_scanner</span>
      </div>
      <div className="text-[15px] font-semibold text-white mb-1">No analyses yet</div>
      <div className="text-[13px] mb-6" style={{ color: MUTED }}>
        Scan your first food label to populate your intelligence feed.
      </div>
      <Link
        to="/analyze"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] text-black bg-[#C8FF4D] hover:bg-[#d6ff6b] transition-colors">
        <span className="material-symbols-outlined text-[16px]">add</span>
        Analyze Now
      </Link>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [realAnalyses, setRealAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyApi
      .getAll()
      .then(data => setRealAnalyses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Use demo seed when user has no real data
  const isDemo = !loading && realAnalyses.length === 0;
  const analyses: AnalysisResponse[] = isDemo ? DEMO_ANALYSES_SEED : realAnalyses;
  const stats = deriveStats(analyses);
  const hasData = analyses.length > 0;

  // ── Chart data ──────────────────────────────────────────────────────────────
  // Activity over time chart (date × count)
  const activityMap: Record<string, number> = {};
  analyses.forEach(a => {
    const d = new Date(a.analyzedAt).toISOString().slice(0, 10);
    activityMap[d] = (activityMap[d] ?? 0) + 1;
  });
  const activityData = Object.entries(activityMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: fmtChartDate(date), count }));

  // Risk distribution for radial chart
  const chartData = [
    { name: 'Verified', value: stats.lowRisk,  fill: GREEN },
    { name: 'Review',   value: stats.medRisk,  fill: AMBER },
    { name: 'High Risk',value: stats.highRisk, fill: RED },
  ].filter(d => d.value > 0);

  // Health trend
  const trendData = [...analyses]
    .reverse()
    .slice(0, 8)
    .map((a, i) => ({
      name: `#${i + 1}`,
      value: a.healthScore ?? 0,
      fill: scoreColor(a.healthScore ?? 0),
    }));

  const displayName = user?.fullName || user?.username || 'there';

  return (
    <div className="min-h-screen bg-[#0B0D0C] px-4 sm:px-6 lg:px-10 py-8 max-w-7xl mx-auto">

      {/* ── Welcome Banner ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] mb-2" style={{ color: LIME }}>{greeting()}</div>
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-white leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {displayName}<span style={{ color: LIME }}>.</span>
          </h1>
          <p className="text-[13px] mt-2" style={{ color: MUTED }}>
            {hasData
              ? `${stats.total} label${stats.total !== 1 ? 's' : ''} analyzed · food intelligence command center`
              : 'Your food intelligence command center — start your first scan.'}
          </p>
        </div>
        <Link
          to="/analyze"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] text-black bg-[#C8FF4D] hover:bg-[#d6ff6b] shadow-[0_0_24px_rgba(200,255,77,0.25)] hover:shadow-[0_0_36px_rgba(200,255,77,0.4)] transition-all">
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Scan
        </Link>
      </div>

      {/* ── Demo Mode Banner ── */}
      {isDemo && <DemoBanner />}

      {/* ── Bento Stats + Health Ring ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {/* Health Score Ring */}
        <div className="col-span-2 sm:col-span-1 bg-[#071009] rounded-2xl border border-white/5 p-5 flex flex-col items-center justify-center gap-2 min-h-[180px]">
          <HealthScoreRing score={stats.avgHealth} />
          {hasData && (
            <div className="text-[11px] font-mono uppercase tracking-wider text-center" style={{ color: MUTED }}>
              avg · {stats.total} scan{stats.total !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Total Scans */}
        <BentoStatCard
          icon="document_scanner" label="Total Scans"
          value={stats.total} accentColor={LIME}
          sub={hasData ? 'labels analyzed' : 'none yet'}
        />

        {/* Avg Authenticity */}
        <BentoStatCard
          icon="verified" label="Avg Authenticity"
          value={stats.avgAuth} suffix="/100"
          accentColor={hasData ? scoreColor(stats.avgAuth) : MUTED}
          sub={hasData ? (stats.avgAuth >= 80 ? 'High confidence' : stats.avgAuth >= 50 ? 'Moderate' : 'Low confidence') : undefined}
        />

        {/* Allergens Found */}
        <BentoStatCard
          icon="coronavirus" label="Allergens Found"
          value={stats.allergenCount}
          accentColor={stats.allergenCount > 0 ? RED : GREEN}
          sub={hasData ? (stats.allergenCount > 0 ? 'across all scans' : 'None detected') : undefined}
        />

        {/* Verified Claims */}
        <BentoStatCard
          icon="fact_check" label="Claims Verified"
          value={stats.verifiedClaims}
          accentColor={GREEN}
          sub={hasData && stats.totalClaims > 0 ? `of ${stats.totalClaims} total claims` : undefined}
        />

        {/* Risk Profile */}
        <div className="bg-[#0f1a12] rounded-2xl p-5 border border-white/5 flex flex-col gap-2">
          <span className="material-symbols-outlined text-[20px]" style={{ color: AMBER }}>shield</span>
          <div className="text-[11px] uppercase tracking-widest font-mono mb-1" style={{ color: MUTED }}>Risk Profile</div>
          {hasData ? (
            <div className="space-y-1.5">
              {[
                { label: 'Verified', count: stats.lowRisk, color: GREEN },
                { label: 'Review',   count: stats.medRisk,  color: AMBER },
                { label: 'High Risk',count: stats.highRisk, color: RED },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between text-[11px]">
                  <span style={{ color: MUTED }}>{r.label}</span>
                  <span className="font-bold font-mono" style={{ color: r.color }}>{r.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[24px] font-bold" style={{ color: MUTED }}>—</div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: LIME }}>Quick Actions</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(200,255,77,0.1)' }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(a => (
            <Link
              key={a.to} to={a.to}
              className={`group relative flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                a.featured
                  ? 'bg-[#C8FF4D]/8 border-[#C8FF4D]/20 hover:border-[#C8FF4D]/40 shadow-[0_0_24px_rgba(200,255,77,0.07)]'
                  : 'bg-[#0f1a12] border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${a.featured ? 'bg-[#C8FF4D]/10 group-hover:bg-[#C8FF4D]/20' : 'bg-white/5 group-hover:bg-white/8'}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: (a as any).color }}>{a.icon}</span>
              </div>
              <div className="text-[13px] font-semibold text-white">{a.label}</div>
              <div className="text-[11px]" style={{ color: MUTED }}>{a.desc}</div>
              <span className="material-symbols-outlined text-[14px] mt-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: (a as any).color }}>arrow_forward</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Content Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-[#071009] rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: LIME }}>
                {isDemo ? 'Sample Analyses' : 'Recent Scans'}
              </span>
              {hasData && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: MUTED, borderColor: 'rgba(169,180,170,0.2)', background: 'rgba(169,180,170,0.06)' }}>
                  {stats.total}
                </span>
              )}
            </div>
            {hasData && !isDemo && (
              <Link to="/history" className="text-[12px] flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: LIME }}>
                View all <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </Link>
            )}
          </div>

          {loading ? (
            <Skeleton rows={5} />
          ) : !hasData ? (
            <EmptyReal />
          ) : (
            <div className="space-y-2">
              {analyses.slice(0, 6).map((a, idx) => (
                <ScanRow key={a.historyId ?? idx} analysis={a} idx={idx} isDemo={isDemo} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Activity Chart */}
          <div className="bg-[#071009] rounded-2xl border border-white/5 p-5">
            <span className="text-[11px] font-mono uppercase tracking-widest block mb-4" style={{ color: hasData ? LIME : MUTED }}>
              Analysis Activity
            </span>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="material-symbols-outlined text-[28px] mb-2" style={{ color: MUTED }}>bar_chart</span>
                <span className="text-[12px]" style={{ color: MUTED }}>No data yet</span>
              </div>
            ) : activityData.length > 1 ? (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={LIME} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={LIME} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: MUTED }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f1a12', border: '1px solid rgba(200,255,77,0.15)', borderRadius: 8, fontSize: 11, color: '#fff' }}
                    itemStyle={{ color: LIME }}
                  />
                  <Area type="monotone" dataKey="count" stroke={LIME} fill="url(#areaGrad)" strokeWidth={2} dot={{ r: 3, fill: LIME }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              // Radial chart when only 1 date
              <ResponsiveContainer width="100%" height={150}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%"
                  data={trendData.length > 1 ? trendData : chartData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={5} />
                  <Tooltip contentStyle={{ background: '#0f1a12', border: '1px solid rgba(200,255,77,0.15)', borderRadius: 10, fontSize: 12, color: '#fff' }}
                    itemStyle={{ color: LIME }} labelStyle={{ color: MUTED }} />
                </RadialBarChart>
              </ResponsiveContainer>
            )}

            {/* Risk legend */}
            {hasData && (
              <div className="space-y-1.5 mt-3">
                {chartData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                      <span className="font-mono" style={{ color: MUTED }}>{d.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: d.fill }}>{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explore Links */}
          <div className="bg-[#071009] rounded-2xl border border-white/5 p-4">
            <span className="text-[11px] font-mono uppercase tracking-widest block mb-3" style={{ color: MUTED }}>Explore</span>
            <div className="space-y-0.5">
              {[
                { to: '/history',    icon: 'query_stats',     label: 'Full History' },
                { to: '/compare',    icon: 'compare_arrows',  label: 'Compare Products' },
                { to: '/saved',      icon: 'bookmark',        label: 'Saved Products' },
                { to: '/nutrisaathi',icon: 'smart_toy',       label: 'AI Assistant' },
                { to: '/reports',    icon: 'description',     label: 'Reports' },
                { to: '/profile',    icon: 'manage_accounts', label: 'My Profile' },
              ].map(item => (
                <Link
                  key={item.to} to={item.to}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all group hover:bg-white/4"
                  style={{ color: MUTED }}>
                  <span className="material-symbols-outlined text-[17px] transition-colors group-hover:text-[#C8FF4D]">{item.icon}</span>
                  <span className="group-hover:text-white transition-colors">{item.label}</span>
                  <span className="material-symbols-outlined text-[13px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: LIME }}>chevron_right</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Intelligence Tip ── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: LIME }}>Intelligence Feed</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(200,255,77,0.1)' }} />
        </div>
        <TipOfTheDay />
      </div>

    </div>
  );
}
