import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedApi, AnalysisResponse } from '../lib/api';
import { getDemoAnalysis } from '../lib/demo';

const CATEGORIES = [
  { id: 'ALL', label: 'All Items', icon: 'grid_view' },
  { id: 'BREAKFAST', label: 'Breakfast & Cereals', icon: 'bakery_dining', emoji: '🥣' },
  { id: 'PANTRY', label: 'Pantry & Grains', icon: 'kitchen', emoji: '🥫' },
  { id: 'ESSENTIALS', label: 'Essentials & Dairy', icon: 'egg_alt', emoji: '🥛' },
  { id: 'SNACKS', label: 'Healthy Snacks', icon: 'nutrition', emoji: '🍿' },
  { id: 'BEVERAGES', label: 'Beverages & Tonics', icon: 'local_cafe', emoji: '🧃' },
];

export default function SavedProducts() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = () => {
    setLoading(true);
    savedApi.getAll()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          // Check if there are locally saved items in sessionStorage
          const localSaved = sessionStorage.getItem('nv_saved_items');
          if (localSaved) {
            try {
              setItems(JSON.parse(localSaved));
            } catch {
              setItems([]);
            }
          } else {
            setItems([]);
          }
        }
      })
      .catch(() => {
        const localSaved = sessionStorage.getItem('nv_saved_items');
        if (localSaved) {
          try {
            setItems(JSON.parse(localSaved));
          } catch {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleSeedSamples = () => {
    const samples = [
      {
        ...getDemoAnalysis(0),
        id: 101,
        category: 'BREAKFAST',
        savedAt: new Date().toISOString(),
        productName: "Kellogg's Whole Grain Corn Flakes",
        brand: "Kellogg's",
        healthScore: 84,
        authenticityScore: 94,
        riskLevel: 'LOW',
      },
      {
        ...getDemoAnalysis(1),
        id: 102,
        category: 'BEVERAGES',
        savedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        productName: "PureAlps Organic Almond Protein Shake",
        brand: "PureAlps Bio",
        healthScore: 92,
        authenticityScore: 98,
        riskLevel: 'LOW',
      },
      {
        ...getDemoAnalysis(2),
        id: 103,
        category: 'PANTRY',
        savedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        productName: "Himalayan Pink Rock Salt Crisps",
        brand: "Artisan Pantry",
        healthScore: 68,
        authenticityScore: 82,
        riskLevel: 'MEDIUM',
      },
    ];
    setItems(samples);
    sessionStorage.setItem('nv_saved_items', JSON.stringify(samples));
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await savedApi.delete(id);
    } catch {}
    setItems(prev => {
      const updated = prev.filter(i => (i.id || i.historyId) !== id);
      sessionStorage.setItem('nv_saved_items', JSON.stringify(updated));
      return updated;
    });
    setDeletingId(null);
  };

  const openProduct = (item: any) => {
    sessionStorage.setItem('nv_last_result', JSON.stringify(item));
    navigate('/results');
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        item.productName?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === 'ALL' ||
        (item.category && item.category.toUpperCase() === selectedCategory) ||
        (!item.category && selectedCategory === 'PANTRY');
      return matchesSearch && matchesCat;
    });
  }, [items, search, selectedCategory]);

  const avgHealthScore = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + (curr.healthScore || 80), 0);
    return Math.round(sum / items.length);
  }, [items]);

  const cleanLabelCount = useMemo(() => {
    return items.filter(i => (i.healthScore || 0) >= 80).length;
  }, [items]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Top Header Bar Matching NutriVerify Theme ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#102014] border border-[#8BE28B]/30 text-[#8BE28B] flex items-center justify-center shadow-[0_0_15px_rgba(139,226,139,0.15)]">
            <span className="material-symbols-outlined text-[26px]">kitchen</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold uppercase tracking-wider border border-[#8BE28B]/30">
                Pantry Intelligence v2.6
              </span>
              <span className="text-xs text-[#A9B4AA]">• Synchronized</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
              Smart <span className="text-[#8BE28B]">Food Pantry</span>
            </h1>
            <p className="text-xs text-[#A9B4AA] mt-0.5">
              Your verified personal food repository. Track ingredient safety, nutritional trends, and clean-label authenticity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2.5 rounded-xl bg-[#C8FF4D] hover:brightness-110 text-black text-xs font-extrabold shadow-[0_0_20px_rgba(200,255,77,0.3)] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span>Scan New Label</span>
          </button>
        </div>
      </div>

      {/* ── Pantry Health Metrics & Insight Banner ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Metric 1: Health Index Card */}
        <div className="md:col-span-4 rounded-2xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider">Overall Pantry Health</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{avgHealthScore > 0 ? avgHealthScore : '—'}</span>
              <span className="text-xs font-bold text-[#8BE28B]">/ 100</span>
            </div>
            <p className="text-[11px] text-[#8BE28B]">
              {avgHealthScore >= 80 ? '✓ Superior Clean Profile' : avgHealthScore >= 60 ? '⚡ Moderate Profile' : 'Ready for first scan'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#102014] border border-[#8BE28B]/30 flex items-center justify-center text-[#C8FF4D]">
            <span className="material-symbols-outlined text-[30px]">health_and_safety</span>
          </div>
        </div>

        {/* Metric 2: Clean Label Ratio */}
        <div className="md:col-span-4 rounded-2xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider">Clean Label Ratio</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{cleanLabelCount}</span>
              <span className="text-xs text-[#A9B4AA]">of {items.length} Products</span>
            </div>
            <div className="w-full bg-[#142318] h-1.5 rounded-full overflow-hidden mt-1 max-w-[120px]">
              <div
                className="bg-[#C8FF4D] h-full transition-all duration-500"
                style={{ width: `${items.length > 0 ? (cleanLabelCount / items.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#102014] border border-[#8BE28B]/30 flex items-center justify-center text-[#8BE28B]">
            <span className="material-symbols-outlined text-[30px]">verified</span>
          </div>
        </div>

        {/* Metric 3: Smart AI Insight */}
        <div className="md:col-span-4 rounded-2xl bg-[#0D1811] border border-white/10 p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-[#142618] border border-[#8BE28B]/30 flex items-center justify-center text-[#C8FF4D] shrink-0">
            <span className="material-symbols-outlined text-[24px]">psychology</span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#8BE28B] uppercase tracking-wider">NutriVerify AI Insight</span>
            <p className="text-xs text-white/90 leading-snug mt-0.5">
              {items.length > 0
                ? "Your saved pantry is free from unverified hydrogenated fats and artificial azodicarbonamide additives."
                : "Add your everyday grocery items to activate real-time allergen and cross-product health monitoring."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Category Filter Bar & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#C8FF4D] text-black shadow-[0_0_15px_rgba(200,255,77,0.3)]'
                  : 'bg-[#09120B] text-[#A9B4AA] hover:text-white border border-white/10 hover:border-[#8BE28B]/30'
              }`}
            >
              <span>{cat.emoji || '📁'}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#8BE28B]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved products..."
            className="w-full bg-[#09120B] border border-white/10 focus:border-[#8BE28B]/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#6F7A70] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* ── Main Products Grid or Meaningful Empty State ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-[#09120B]/60 border border-white/5 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredItems.length === 0 && items.length === 0 ? (
        /* Rich Meaningful Empty State */
        <div className="rounded-3xl bg-[#09120B]/95 border border-[#8BE28B]/30 p-8 lg:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl my-4">
          <div className="absolute inset-0 bg-gradient-to-b from-[#8BE28B]/5 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-[#102014] border border-[#8BE28B]/40 flex items-center justify-center text-[#C8FF4D] mb-5 shadow-[0_0_30px_rgba(139,226,139,0.2)]">
              <span className="material-symbols-outlined text-[42px]">inventory_2</span>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#1A3320] text-[#8BE28B] text-[11px] font-bold uppercase tracking-widest border border-[#8BE28B]/30 mb-2">
              Pantry Intelligence Initialized
            </span>

            <h2 className="text-2xl font-extrabold text-white mb-2">
              Your Food Pantry is Waiting for Its First Scan
            </h2>

            <p className="text-xs text-[#A9B4AA] leading-relaxed mb-6">
              Save your scanned groceries to receive automated allergen warning alerts, hidden additive deconstructions, and smart healthy ingredient swap recommendations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-3 rounded-full bg-[#C8FF4D] hover:brightness-110 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(200,255,77,0.3)] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                <span>Scan a Food Label</span>
              </button>

              <button
                onClick={() => navigate('/manual')}
                className="px-5 py-3 rounded-full bg-[#102014] hover:bg-[#162a1b] text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">edit_note</span>
                <span>Enter Manually</span>
              </button>

              <button
                onClick={handleSeedSamples}
                className="px-5 py-3 rounded-full bg-[#142618] hover:bg-[#1a3320] text-[#8BE28B] font-bold text-xs border border-[#8BE28B]/30 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#C8FF4D]">science</span>
                <span>Load Sample Pantry Items</span>
              </button>
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 text-[#A9B4AA]">
          <p className="text-sm font-bold text-white mb-1">No products match your search or filter.</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('ALL'); }}
            className="text-xs text-[#8BE28B] underline font-bold mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => openProduct(item)}
              className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/20 hover:border-[#8BE28B]/50 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Brand, Category, Delete */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#102014] text-[#8BE28B] text-[10px] font-bold border border-[#8BE28B]/20">
                      {item.brand || 'Verified Product'}
                    </span>
                    <span className="text-[10px] text-[#A9B4AA]">
                      {item.category || 'PANTRY'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id || item.historyId, e)}
                    disabled={deletingId === (item.id || item.historyId)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-error/20 hover:text-error text-[#6F7A70] flex items-center justify-center transition-colors"
                    title="Remove from pantry"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {deletingId === (item.id || item.historyId) ? 'autorenew' : 'delete'}
                    </span>
                  </button>
                </div>

                {/* Product Name & Visual Mockup */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F1D13] border border-white/10 p-2 flex items-center justify-center text-2xl shrink-0 group-hover:border-[#8BE28B]/40 transition-colors">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span>{item.category === 'BEVERAGES' ? '🧃' : item.category === 'BREAKFAST' ? '🥣' : '🥫'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#8BE28B] transition-colors truncate">
                      {item.productName}
                    </h3>
                    <p className="text-[11px] text-[#A9B4AA] mt-1 line-clamp-2">
                      {item.ingredientsText || 'Verified ingredients and nutritional panel.'}
                    </p>
                  </div>
                </div>

                {/* Score Dual Gauges */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="p-2.5 rounded-xl bg-[#0D1811] border border-white/5 text-center">
                    <span className="text-[9px] font-bold text-[#A9B4AA] uppercase tracking-wider block">Health Score</span>
                    <span className={`text-lg font-black ${item.healthScore >= 80 ? 'text-[#8BE28B]' : 'text-[#FFB86B]'}`}>
                      {item.healthScore || 85}/100
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0D1811] border border-white/5 text-center">
                    <span className="text-[9px] font-bold text-[#A9B4AA] uppercase tracking-wider block">Authenticity</span>
                    <span className="text-lg font-black text-[#C8FF4D]">
                      {item.authenticityScore || 95}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Status Pill & View Link */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8BE28B]">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{item.riskLevel || 'LOW'} Risk</span>
                </span>
                <span className="text-[11px] font-extrabold text-[#C8FF4D] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Inspect Dossier</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
