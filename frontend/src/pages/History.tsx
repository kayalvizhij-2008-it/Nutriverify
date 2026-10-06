import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi, savedApi, type AnalysisResponse } from '../lib/api';
import { getDemoAnalysis } from '../lib/demo';

// ── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number): { stroke: string; text: string; bg: string } {
  if (score >= 80) return { stroke: '#8BE28B', text: '#8BE28B', bg: '#102014' };
  if (score >= 60) return { stroke: '#C8FF4D', text: '#C8FF4D', bg: '#1A2000' };
  return { stroke: '#FF6B6B', text: '#FF6B6B', bg: '#2A1010' };
}

function riskMeta(level: string): { label: string; bg: string; text: string; dot: string } {
  switch (level) {
    case 'LOW':
      return { label: 'Verified', bg: 'bg-[#0D2016]', text: 'text-[#8BE28B]', dot: 'bg-[#8BE28B]' };
    case 'MEDIUM':
      return { label: 'Review', bg: 'bg-[#2A1E00]', text: 'text-[#FFB86B]', dot: 'bg-[#FFB86B]' };
    case 'HIGH':
      return { label: 'High Risk', bg: 'bg-[#2A1010]', text: 'text-[#FF6B6B]', dot: 'bg-[#FF6B6B]' };
    default:
      return { label: 'Unknown', bg: 'bg-[#151B16]', text: 'text-[#A9B4AA]', dot: 'bg-[#A9B4AA]' };
  }
}

function formatTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function productEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('cereal') || n.includes('granola') || n.includes('muesli')) return '🥣';
  if (n.includes('yogurt') || n.includes('curd')) return '🥛';
  if (n.includes('juice') || n.includes('drink')) return '🧃';
  if (n.includes('protein') || n.includes('bar')) return '💪';
  if (n.includes('biscuit') || n.includes('cookie')) return '🍪';
  if (n.includes('chip') || n.includes('snack')) return '🍿';
  if (n.includes('oil') || n.includes('butter')) return '🫙';
  return '🏷️';
}

// ── SVG Score Ring ────────────────────────────────────────────────────────────

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function ScoreRing({ score, size = 56, strokeWidth = 5 }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const { stroke, text, bg } = scoreColor(score);

  return (
    <div
      className="relative flex items-center justify-center shrink-0 rounded-full"
      style={{ width: size, height: size, background: bg }}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <span className="text-[11px] font-black leading-none relative z-10" style={{ color: text }}>
        {score}
      </span>
    </div>
  );
}

// ── Filter chip values ────────────────────────────────────────────────────────

type FilterChip = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';
const CHIPS: { key: FilterChip; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'LOW', label: 'Verified' },
  { key: 'MEDIUM', label: 'Review' },
  { key: 'HIGH', label: 'High Risk' },
];

// ── Date group labels ─────────────────────────────────────────────────────────

function getGroupLabel(iso?: string): 'TODAY' | 'YESTERDAY' | 'THIS WEEK' | 'EARLIER' {
  if (!iso) return 'EARLIER';
  const itemDate = new Date(iso);
  itemDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - itemDate.getTime();
  const oneDay = 86400000;
  if (diff < oneDay) return 'TODAY';
  if (diff < 2 * oneDay) return 'YESTERDAY';
  if (diff < 7 * oneDay) return 'THIS WEEK';
  return 'EARLIER';
}

const GROUP_ORDER: string[] = ['TODAY', 'YESTERDAY', 'THIS WEEK', 'EARLIER'];

const GROUP_META: Record<string, { color: string; glow: string; sub: string }> = {
  TODAY:     { color: '#C8FF4D', glow: 'rgba(200,255,77,0.45)',  sub: 'Recent scans' },
  YESTERDAY: { color: '#8BE28B', glow: 'rgba(139,226,139,0.35)', sub: 'Previous day' },
  'THIS WEEK': { color: '#5FC9E8', glow: 'rgba(95,201,232,0.35)', sub: 'Past 7 days' },
  EARLIER:   { color: '#A9B4AA', glow: 'rgba(169,180,170,0.25)', sub: 'Historical archive' },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<FilterChip>('ALL');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setLoading(true);
    historyApi.getAll()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          const local = sessionStorage.getItem('nv_history_items');
          if (local) {
            try { setItems(JSON.parse(local)); } catch { setItems([]); }
          } else {
            setItems([]);
          }
        }
      })
      .catch(() => {
        const local = sessionStorage.getItem('nv_history_items');
        if (local) {
          try { setItems(JSON.parse(local)); } catch { setItems([]); }
        } else {
          setItems([]);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleSeedJourney = () => {
    const samples: AnalysisResponse[] = [
      {
        ...getDemoAnalysis(0),
        historyId: 201,
        productName: 'ChocoCrunch Multigrain Cereal',
        brand: 'GrainKraft',
        healthScore: 93,
        authenticityScore: 96,
        riskLevel: 'LOW',
        analyzedAt: new Date().toISOString(),
      },
      {
        ...getDemoAnalysis(1),
        historyId: 202,
        productName: 'Green Leafy Protein Granola',
        brand: 'PureAlps Bio',
        healthScore: 100,
        authenticityScore: 99,
        riskLevel: 'LOW',
        analyzedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      },
      {
        ...getDemoAnalysis(2),
        historyId: 203,
        productName: 'NutriCrunch Honey Roasted Muesli',
        brand: 'Artisan Grains',
        healthScore: 82,
        authenticityScore: 88,
        riskLevel: 'MEDIUM',
        analyzedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        ...getDemoAnalysis(0),
        historyId: 204,
        productName: 'Silk Smooth Coconut Yogurt',
        brand: 'CocoFlora',
        healthScore: 89,
        authenticityScore: 94,
        riskLevel: 'LOW',
        analyzedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
      {
        ...getDemoAnalysis(1),
        historyId: 205,
        productName: 'Masala Oat Crisps',
        brand: 'SpicyLeaf',
        healthScore: 54,
        authenticityScore: 61,
        riskLevel: 'HIGH',
        analyzedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      },
    ];
    setItems(samples);
    sessionStorage.setItem('nv_history_items', JSON.stringify(samples));
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    try { await historyApi.delete(id); } catch {}
    setItems(prev => {
      const updated = prev.filter(i => (i.historyId || (i as any).id) !== id);
      sessionStorage.setItem('nv_history_items', JSON.stringify(updated));
      return updated;
    });
    setDeleting(null);
  };

  const handleSaveToPantry = async (item: AnalysisResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemId = item.historyId || (item as any).id;
    setSaving(itemId);
    try { await savedApi.save(item); } catch {}
    const local = sessionStorage.getItem('nv_saved_items');
    const list = local ? JSON.parse(local) : [];
    if (!list.some((x: any) => x.productName === item.productName)) {
      list.push(item);
      sessionStorage.setItem('nv_saved_items', JSON.stringify(list));
    }
    setSavedIds(prev => new Set(prev).add(String(itemId)));
    setSaving(null);
  };

  const openResult = (a: AnalysisResponse) => {
    sessionStorage.setItem('nv_last_result', JSON.stringify(a));
    navigate('/results');
  };

  const handleCompare = (item: AnalysisResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('nv_compare_item', JSON.stringify(item));
    navigate('/compare');
  };

  const filtered = useMemo(() => {
    return items.filter(a => {
      const matchesSearch =
        a.productName.toLowerCase().includes(search.toLowerCase()) ||
        (a.brand && a.brand.toLowerCase().includes(search.toLowerCase()));
      const matchesRisk = riskFilter === 'ALL' || a.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [items, search, riskFilter]);

  const groupedTimeline = useMemo(() => {
    const map: Record<string, AnalysisResponse[]> = {};
    filtered.forEach(item => {
      const label = getGroupLabel(item.analyzedAt);
      if (!map[label]) map[label] = [];
      map[label].push(item);
    });
    return GROUP_ORDER.filter(g => map[g]).map(g => ({ label: g, items: map[g] }));
  }, [filtered]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0D2016 0%, #071009 100%)',
              boxShadow: '0 0 20px rgba(139,226,139,0.2)',
              border: '1px solid rgba(139,226,139,0.25)',
            }}
          >
            <span className="material-symbols-outlined text-[#8BE28B] text-[26px]">timeline</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background: 'rgba(200,255,77,0.08)',
                  color: '#C8FF4D',
                  border: '1px solid rgba(200,255,77,0.2)',
                }}
              >
                Audit Timeline
              </span>
              <span className="text-[11px] text-[#A9B4AA]">
                {items.length} scan{items.length !== 1 ? 's' : ''} logged
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              Your <span className="text-[#C8FF4D]">Scan History</span>
            </h1>
            <p className="text-[11px] text-[#A9B4AA] mt-0.5">
              Chronological log of verified food packages, OCR extractions, and claim audits.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#C8FF4D] hover:brightness-110 text-black text-xs font-extrabold flex items-center gap-2 transition-all shrink-0"
          style={{ boxShadow: '0 0 22px rgba(200,255,77,0.3)' }}
        >
          <span className="material-symbols-outlined text-[17px]">add_a_photo</span>
          New Scan
        </button>
      </div>

      {/* ── SEARCH & FILTER BAR ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {CHIPS.map(chip => {
            const active = riskFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setRiskFilter(chip.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-[#C8FF4D] text-black'
                    : 'text-[#A9B4AA] border border-white/10 hover:border-[#8BE28B]/30 hover:text-white'
                }`}
                style={active ? { boxShadow: '0 0 14px rgba(200,255,77,0.35)' } : {}}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#8BE28B] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name or brand…"
            className="w-full bg-[#09120B] border border-white/10 focus:border-[#8BE28B]/40 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-[#4F5A50] focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9B4AA] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── LOADING SKELETON ────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-8 py-4">
          {[0, 1].map(gi => (
            <div key={gi} className="space-y-4">
              <div className="h-4 w-24 rounded-full bg-white/5 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map(ci => (
                  <div key={ci} className="h-44 rounded-3xl bg-white/[0.03] border border-white/5 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY STATE ─────────────────────────────────────────────────── */}
      {!loading && items.length === 0 && (
        <div
          className="rounded-3xl p-10 lg:p-16 text-center my-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #071009 0%, #09120B 100%)',
            border: '1px solid rgba(139,226,139,0.2)',
            boxShadow: '0 0 60px rgba(139,226,139,0.05)',
          }}
        >
          {/* Decorative background blobs */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(200,255,77,0.06) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139,226,139,0.04) 0%, transparent 70%)',
            }}
          />

          <div className="max-w-md mx-auto relative z-10 flex flex-col items-center">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #102014 0%, #071009 100%)',
                border: '1px solid rgba(139,226,139,0.3)',
                boxShadow: '0 0 30px rgba(139,226,139,0.15)',
              }}
            >
              <span className="material-symbols-outlined text-[#C8FF4D] text-[40px]">history_edu</span>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-3">
              No Scans Yet
            </h2>
            <p className="text-xs text-[#A9B4AA] leading-relaxed mb-8 max-w-xs">
              Every food label you scan is chronicled here in a beautiful timeline. Audit nutritional history and track clean-label progress over time.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['Score Rings', 'Timeline Groups', 'Risk Badges', 'Smart Search'].map(f => (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full text-[10px] font-semibold text-[#8BE28B]"
                  style={{ background: 'rgba(139,226,139,0.08)', border: '1px solid rgba(139,226,139,0.15)' }}
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 rounded-full bg-[#C8FF4D] hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-2 transition-all"
                style={{ boxShadow: '0 0 24px rgba(200,255,77,0.35)' }}
              >
                <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                Start Your First Scan
              </button>

              <button
                onClick={handleSeedJourney}
                className="px-6 py-3 rounded-full text-[#8BE28B] font-bold text-xs flex items-center gap-2 transition-all hover:brightness-125"
                style={{
                  background: 'rgba(139,226,139,0.08)',
                  border: '1px solid rgba(139,226,139,0.25)',
                }}
              >
                <span className="material-symbols-outlined text-[18px] text-[#C8FF4D]">auto_awesome</span>
                Load Sample Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NO RESULTS (filtered) ───────────────────────────────────────── */}
      {!loading && items.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl p-8 text-center border border-white/5 bg-white/[0.02]">
          <span className="material-symbols-outlined text-[#A9B4AA] text-[36px] mb-3 block">search_off</span>
          <p className="text-sm font-semibold text-white mb-1">No results found</p>
          <p className="text-xs text-[#A9B4AA]">Try adjusting your search or filter.</p>
        </div>
      )}

      {/* ── TIMELINE ────────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="relative">
          {/* Vertical spine */}
          <div
            className="absolute left-3 top-4 bottom-4 w-px pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(200,255,77,0.6), rgba(139,226,139,0.2), transparent)',
            }}
          />

          <div className="space-y-10 pl-10">
            {groupedTimeline.map((group, gIdx) => {
              const meta = GROUP_META[group.label];
              return (
                <div key={group.label} className="relative">
                  {/* Group node */}
                  <div className="absolute -left-10 top-0 flex items-center">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style={{
                        background: '#0B0D0C',
                        border: `2px solid ${meta.color}`,
                        boxShadow: `0 0 12px ${meta.glow}`,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: meta.color }}
                      />
                    </div>
                  </div>

                  {/* Group label */}
                  <div className="flex items-baseline gap-2.5 mb-4">
                    <span
                      className="text-xs font-extrabold tracking-widest uppercase"
                      style={{ color: meta.color }}
                    >
                      {group.label}
                    </span>
                    <span className="text-[10px] text-[#A9B4AA]">
                      {meta.sub} · {group.items.length} scan{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((item, idx) => {
                      const risk = riskMeta(item.riskLevel || 'LOW');
                      const score = item.healthScore ?? 90;
                      const authScore = item.authenticityScore ?? 95;
                      const itemId = item.historyId || (item as any).id;
                      const isSaved = savedIds.has(String(itemId));

                      return (
                        <div
                          key={itemId || idx}
                          onClick={() => openResult(item)}
                          className="group cursor-pointer rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #0D1811 0%, #09120B 100%)',
                            border: '1px solid rgba(139,226,139,0.12)',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                            animationDelay: `${(gIdx * 4 + idx) * 80}ms`,
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(139,226,139,0.4)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(139,226,139,0.1)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(139,226,139,0.12)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                          }}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  background: 'rgba(139,226,139,0.07)',
                                  color: '#8BE28B',
                                  border: '1px solid rgba(139,226,139,0.15)',
                                }}
                              >
                                {item.brand || 'Unknown Brand'}
                              </span>
                              <span className="text-[10px] text-[#4F5A50]">
                                {formatTime(item.analyzedAt)}
                              </span>
                            </div>

                            {/* Risk badge */}
                            <div
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${risk.bg} ${risk.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                              {risk.label}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="px-4 py-3.5 flex items-start gap-4">
                            {/* Score Ring */}
                            <ScoreRing score={score} size={58} strokeWidth={5} />

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#8BE28B] transition-colors line-clamp-2">
                                {item.productName}
                              </h3>
                              <p className="text-[11px] text-[#A9B4AA] mt-1 line-clamp-2 leading-relaxed">
                                {item.ingredientsText
                                  ? item.ingredientsText.slice(0, 80) + (item.ingredientsText.length > 80 ? '…' : '')
                                  : 'Verified nutritional breakdown on file.'}
                              </p>
                            </div>

                            {/* Product Emoji */}
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              {item.imageUrl
                                ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                : <span>{productEmoji(item.productName)}</span>
                              }
                            </div>
                          </div>

                          {/* Score Row */}
                          <div className="grid grid-cols-2 gap-2.5 px-4 pb-3.5">
                            <div
                              className="flex items-center justify-between rounded-xl px-3 py-2"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                              <span className="text-[10px] text-[#A9B4AA]">Health</span>
                              <span
                                className="text-xs font-black"
                                style={{ color: scoreColor(score).text }}
                              >
                                {score}/100
                              </span>
                            </div>
                            <div
                              className="flex items-center justify-between rounded-xl px-3 py-2"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                              <span className="text-[10px] text-[#A9B4AA]">Authenticity</span>
                              <span className="text-xs font-black text-[#C8FF4D]">{authScore}%</span>
                            </div>
                          </div>

                          {/* Card Footer / Action Bar */}
                          <div
                            className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]"
                          >
                            <div className="flex items-center gap-1.5">
                              {/* Save */}
                              <button
                                onClick={e => handleSaveToPantry(item, e)}
                                disabled={saving === itemId || isSaved}
                                title={isSaved ? 'Saved to pantry' : 'Save to Smart Pantry'}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                style={{
                                  background: isSaved ? 'rgba(200,255,77,0.1)' : 'rgba(255,255,255,0.04)',
                                  border: isSaved ? '1px solid rgba(200,255,77,0.25)' : '1px solid rgba(255,255,255,0.07)',
                                }}
                              >
                                <span
                                  className="material-symbols-outlined text-[16px]"
                                  style={{ color: isSaved ? '#C8FF4D' : '#6F7A70' }}
                                >
                                  {isSaved ? 'bookmark' : 'bookmark_add'}
                                </span>
                              </button>

                              {/* Compare */}
                              <button
                                onClick={e => handleCompare(item, e)}
                                title="Compare"
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                style={{
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                }}
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#6F7A70] hover:text-[#8BE28B]">
                                  compare_arrows
                                </span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={e => handleDelete(itemId, e)}
                                disabled={deleting === itemId}
                                title="Remove from history"
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-900/20"
                                style={{
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                }}
                              >
                                {deleting === itemId ? (
                                  <span className="material-symbols-outlined text-[16px] text-[#6F7A70] animate-spin">
                                    progress_activity
                                  </span>
                                ) : (
                                  <span className="material-symbols-outlined text-[16px] text-[#6F7A70] hover:text-red-400">
                                    delete
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Open CTA */}
                            <button
                              onClick={e => { e.stopPropagation(); openResult(item); }}
                              className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#C8FF4D] group-hover:gap-2 transition-all"
                            >
                              <span>Open</span>
                              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
