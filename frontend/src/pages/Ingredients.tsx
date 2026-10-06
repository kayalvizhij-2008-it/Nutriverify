import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisResponse } from '../lib/api';

interface IngredientItem {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  description: string;
  status: 'Safe' | 'Review' | 'Caution' | 'High Risk';
  statusColor: string;
}

const INGREDIENTS_LIST: IngredientItem[] = [
  {
    id: 'ing-1',
    name: 'BHT (Butylated Hydroxytoluene)',
    category: 'Preservative',
    categoryColor: 'bg-[#451A03] text-[#FDBA74] border-[#FDBA74]/30',
    description: 'Used to prevent oxidation and extend shelf life. Generally safe in small amounts, but may cause concern for sensitive individuals.',
    status: 'Safe',
    statusColor: 'bg-[#142A1A] text-[#8BE28B] border-[#8BE28B]/40',
  },
  {
    id: 'ing-2',
    name: 'Sugar',
    category: 'Sweetener',
    categoryColor: 'bg-[#1E3A8A] text-[#93C5FD] border-[#93C5FD]/30',
    description: 'Provides sweetness and improves taste. High consumption may contribute to weight gain and other health issues.',
    status: 'Review',
    statusColor: 'bg-[#2B1D0E] text-[#FFB86B] border-[#FFB86B]/40',
  },
  {
    id: 'ing-3',
    name: 'Annatto Extract (E160b)',
    category: 'Artificial Colour',
    categoryColor: 'bg-[#581C87] text-[#D8B4FE] border-[#D8B4FE]/30',
    description: 'Natural colour derived from annatto seeds. Considered safe for most people, but may cause allergic reactions in rare cases.',
    status: 'Safe',
    statusColor: 'bg-[#142A1A] text-[#8BE28B] border-[#8BE28B]/40',
  },
  {
    id: 'ing-4',
    name: 'Soy Lecithin',
    category: 'Emulsifier',
    categoryColor: 'bg-[#312E81] text-[#A5B4FC] border-[#A5B4FC]/30',
    description: 'Helps blend ingredients and improve texture. Generally safe, but derived from soy (allergen risk).',
    status: 'Caution',
    statusColor: 'bg-[#3A2207] text-[#F59E0B] border-[#F59E0B]/40',
  },
  {
    id: 'ing-5',
    name: 'Guar Gum',
    category: 'Stabilizer',
    categoryColor: 'bg-[#134E4A] text-[#5EEAD4] border-[#5EEAD4]/30',
    description: 'Used for texture and thickness. Generally recognized as safe for consumption.',
    status: 'Safe',
    statusColor: 'bg-[#142A1A] text-[#8BE28B] border-[#8BE28B]/40',
  },
];

export default function Ingredients() {
  const [productName, setProductName] = useState('Kellogg\'s Corn Flakes');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) {
      try {
        const item: AnalysisResponse = JSON.parse(raw);
        if (item.productName) setProductName(item.productName);
      } catch {}
    }
  }, []);

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return INGREDIENTS_LIST;
    return INGREDIENTS_LIST.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Breadcrumb & Top Header Matching Reference Image 5 ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-[#A9B4AA] font-label-code">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-[#8BE28B] font-semibold">Ingredients &amp; Allergens</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#102014] border border-[#8BE28B]/30 text-[#8BE28B] flex items-center justify-center shadow-[0_0_15px_rgba(139,226,139,0.15)]">
              <span className="material-symbols-outlined text-[26px]">eco</span>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                Ingredient &amp; <span className="text-[#8BE28B]">Allergen Analysis</span>
              </h1>
              <p className="text-xs text-[#A9B4AA] mt-0.5">
                Understand what's in your food and check for potential allergens.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 self-end md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142A1A] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Verified Scan • Product analyzed successfully</span>
            </span>
            <span className="font-['Caveat',cursive] text-xl text-[#8BE28B]">
              Real Food. Real Facts. Better Choices.
            </span>
          </div>
        </div>
      </div>

      {/* ── 3-Column Layout Matching Image 5 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Left Product Card (3 cols) */}
        <div className="lg:col-span-3 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-5 shadow-xl flex flex-col items-center text-center gap-4">
          {/* Glowing Product Specimen Frame */}
          <div className="w-full rounded-2xl bg-[#0F1D13] border border-[#8BE28B]/30 p-4 flex flex-col items-center justify-center shadow-inner relative group">
            <div className="w-full max-w-[140px] bg-[#FDFBF7] text-black rounded-lg p-3 shadow-md flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-[#C2410C]">Kellogg's</span>
              <span className="text-xs font-black text-black leading-tight">CORN<br />FLAKES</span>
              <div className="w-16 h-12 my-1.5 rounded bg-[#FEF3C7] flex items-center justify-center text-lg">
                🥣
              </div>
              <span className="text-[8px] font-bold text-gray-700">500 g</span>
            </div>
          </div>

          {/* Product Meta */}
          <div className="w-full text-left space-y-2">
            <h3 className="text-base font-extrabold text-white leading-snug">{productName}</h3>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#102014] text-[#8BE28B] text-[11px] font-bold border border-[#8BE28B]/20">
              Breakfast Cereal
            </span>

            <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs text-[#A9B4AA]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#8BE28B]">business</span>
                <span>Brand: <strong className="text-white">Kellogg's</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#8BE28B]">scale</span>
                <span>Net Weight: <strong className="text-white">500 g</strong></span>
              </div>
            </div>
          </div>

          <Link
            to="/results"
            className="w-full py-2.5 rounded-xl bg-[#102014] hover:bg-[#162a1b] text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px] text-[#8BE28B]">visibility</span>
            <span>View Product Details &gt;</span>
          </Link>
        </div>

        {/* Column 2: Middle Ingredient Analysis List (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#8BE28B] text-[20px]">biotech</span>
              <div>
                <h3 className="text-sm font-bold text-white">Ingredient Analysis</h3>
                <p className="text-[11px] text-[#A9B4AA]">Detailed breakdown of key ingredients and their safety status.</p>
              </div>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#A9B4AA] text-[16px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ingredient, preservative, sweetener..."
              className="w-full bg-[#101D13] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-[#6F7A70] focus:outline-none focus:border-[#C8FF4D]"
            />
          </div>

          {/* List of Ingredient Cards */}
          <div className="space-y-3">
            {filteredIngredients.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#0F1D13] border border-white/5 hover:border-[#8BE28B]/30 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="material-symbols-outlined text-[#8BE28B] text-[16px]">science</span>
                    <span className="text-xs font-bold text-white">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.categoryColor}`}>
                      {item.category}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${item.statusColor}`}>
                    <span>{item.status === 'Safe' ? 'Safe ✓' : item.status === 'Review' ? 'Review ⚠' : 'Caution ⚠'}</span>
                  </span>
                </div>

                <p className="text-[11px] text-[#A9B4AA] leading-relaxed pl-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Right Allergen Check & Risk Assessment (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Allergen Check */}
          <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-2.5">
              <span className="material-symbols-outlined text-[#8BE28B] text-[20px]">shield</span>
              <div>
                <h3 className="text-sm font-bold text-white">Allergen Check</h3>
                <p className="text-[10px] text-[#A9B4AA]">Check for common allergens in this product.</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-2 text-white">
                  <span>🥛</span> Milk
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[10px] font-bold border border-[#8BE28B]/30">
                  Not Detected ✓
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-2 text-white">
                  <span>🫘</span> Soy
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#2B1D0E] text-[#FFB86B] text-[10px] font-bold border border-[#FFB86B]/30">
                  Detected ⚠
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="flex items-center gap-2 text-white">
                  <span>🌾</span> Gluten
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[10px] font-bold border border-[#8BE28B]/30">
                  Not Detected ✓
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-white">
                  <span>🥜</span> Nuts
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[10px] font-bold border border-[#8BE28B]/30">
                  Not Detected ✓
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Overall Ingredient Risk */}
          <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-5 shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#142A1A] text-[#8BE28B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <div className="text-[10px] text-[#A9B4AA] uppercase font-bold">Overall Ingredient Risk</div>
                <div className="text-base font-extrabold text-[#8BE28B]">Low</div>
              </div>
            </div>
            <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
              No major concerns detected. Only minor items to review.
            </p>
          </div>

          {/* Card 3: Why This Matters */}
          <div className="rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-5 shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C8FF4D]">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              <span>Why this matters</span>
            </div>
            <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
              The product contains safe preservatives and stabilizers, but it includes sugar (which should be consumed in moderation) and soy lecithin, which may be a concern for people with soy allergies.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/results"
              className="flex-1 py-2.5 rounded-full bg-[#C8FF4D] hover:brightness-110 text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">visibility</span>
              <span>View Details</span>
            </Link>

            <Link
              to="/compare"
              className="px-3.5 py-2.5 rounded-full bg-[#102014] hover:bg-[#162a1b] text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
              <span>Compare</span>
            </Link>

            <Link
              to="/reports"
              className="px-3.5 py-2.5 rounded-full bg-[#102014] hover:bg-[#162a1b] text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom Status Bar Matching Reference Image 5 ── */}
      <div className="p-3.5 rounded-2xl bg-[#09120B] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#8BE28B] font-semibold">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Analysis completed successfully</span>
        </div>
        <div className="text-[11px] text-[#A9B4AA] font-label-code">
          Scanned on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
