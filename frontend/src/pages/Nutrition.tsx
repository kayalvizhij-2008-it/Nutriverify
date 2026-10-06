import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnalysisResponse } from '../lib/api';

interface NutritionProfile {
  productName: string;
  brand: string;
  servingSize: string;
  servingsPerContainer: number;
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  addedSugar: number;
  fat: number;
  saturatedFat: number;
  transFat: number;
  sodium: number;
  fiber: number;
  cholesterol: number;
  potassium: number;
  calcium: number;
  iron: number;
  vitaminD?: number;
  zinc?: number;
  magnesium?: number;
}

const DEFAULT_PROFILES: NutritionProfile[] = [
  {
    productName: 'Nature Valley Crunchy Oats & Honey',
    brand: 'General Mills',
    servingSize: '42g (2 bars)',
    servingsPerContainer: 1,
    calories: 190,
    protein: 4.0,
    carbs: 29.0,
    sugar: 12.0,
    addedSugar: 11.0,
    fat: 7.0,
    saturatedFat: 1.0,
    transFat: 0.0,
    sodium: 160,
    fiber: 2.0,
    cholesterol: 0,
    potassium: 200,
    calcium: 40,
    iron: 1.8,
    vitaminD: 0.0,
    zinc: 1.2,
    magnesium: 45,
  },
  {
    productName: 'Artisanal Oat-Crust Granola',
    brand: 'NutriVerify Bio Specimen',
    servingSize: '45g (approx. 1 metric cup)',
    servingsPerContainer: 8,
    calories: 240,
    protein: 8.5,
    carbs: 34.0,
    sugar: 4.2,
    addedSugar: 0.0,
    fat: 7.0,
    saturatedFat: 1.1,
    transFat: 0.0,
    sodium: 95,
    fiber: 6.2,
    cholesterol: 0,
    potassium: 220,
    calcium: 45,
    iron: 2.8,
    vitaminD: 1.5,
    zinc: 2.1,
    magnesium: 62,
  },
  {
    productName: 'Instant Masala Noodles',
    brand: 'QuickBite Foods',
    servingSize: '70g (1 pack)',
    servingsPerContainer: 1,
    calories: 360,
    protein: 8.0,
    carbs: 52.0,
    sugar: 2.0,
    addedSugar: 1.5,
    fat: 14.0,
    saturatedFat: 6.5,
    transFat: 0.1,
    sodium: 980,
    fiber: 3.0,
    cholesterol: 0,
    potassium: 110,
    calcium: 15,
    iron: 1.2,
    vitaminD: 0.0,
    zinc: 0.8,
    magnesium: 25,
  },
  {
    productName: 'Pure Cold-Pressed Orange Juice',
    brand: 'Orchard Bio',
    servingSize: '240ml (1 cup)',
    servingsPerContainer: 4,
    calories: 110,
    protein: 2.0,
    carbs: 26.0,
    sugar: 22.0,
    addedSugar: 0.0,
    fat: 0.0,
    saturatedFat: 0.0,
    transFat: 0.0,
    sodium: 5,
    fiber: 0.5,
    cholesterol: 0,
    potassium: 450,
    calcium: 30,
    iron: 0.4,
    vitaminD: 2.5,
    zinc: 0.3,
    magnesium: 18,
  },
];

export default function NutritionPage() {
  const [profiles, setProfiles] = useState<NutritionProfile[]>(DEFAULT_PROFILES);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [activeNutrientTab, setActiveNutrientTab] = useState<'all' | 'macros' | 'micros' | 'cardio'>('all');

  useEffect(() => {
    const raw = sessionStorage.getItem('nv_last_result');
    if (raw) {
      try {
        const item: AnalysisResponse = JSON.parse(raw);
        const customProfile: NutritionProfile = {
          productName: item.productName,
          brand: item.brand || 'Scanned Specimen',
          servingSize: item.servingSize || '1 serving',
          servingsPerContainer: 1,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          sugar: item.sugar || 0,
          addedSugar: item.addedSugar || 0,
          fat: item.fat || 0,
          saturatedFat: item.saturatedFat || 0,
          transFat: item.transFat || 0,
          sodium: item.sodium || 0,
          fiber: item.fiber || 0,
          cholesterol: item.cholesterol || 0,
          potassium: 200,
          calcium: 40,
          iron: 1.8,
          vitaminD: 1.0,
          zinc: 1.5,
          magnesium: 40,
        };

        if (!DEFAULT_PROFILES.some(p => p.productName === item.productName)) {
          setProfiles([customProfile, ...DEFAULT_PROFILES]);
          setSelectedIdx(0);
        }
      } catch {}
    }
  }, []);

  const profile = profiles[selectedIdx] || DEFAULT_PROFILES[0];

  // Calculated macros based on portion multiplier
  const cal = Math.round(profile.calories * portionMultiplier);
  const prot = +(profile.protein * portionMultiplier).toFixed(1);
  const carbs = +(profile.carbs * portionMultiplier).toFixed(1);
  const sugar = +(profile.sugar * portionMultiplier).toFixed(1);
  const addedSugar = +(profile.addedSugar * portionMultiplier).toFixed(1);
  const fat = +(profile.fat * portionMultiplier).toFixed(1);
  const satFat = +(profile.saturatedFat * portionMultiplier).toFixed(1);
  const sod = Math.round(profile.sodium * portionMultiplier);
  const fib = +(profile.fiber * portionMultiplier).toFixed(1);
  const pot = Math.round(profile.potassium * portionMultiplier);
  const calc = Math.round(profile.calcium * portionMultiplier);
  const ir = +(profile.iron * portionMultiplier).toFixed(1);
  const vitD = +((profile.vitaminD || 1.0) * portionMultiplier).toFixed(1);
  const zn = +((profile.zinc || 1.0) * portionMultiplier).toFixed(1);
  const mg = Math.round((profile.magnesium || 30) * portionMultiplier);

  // Daily Value Benchmarks (FDA 2,000 kcal reference)
  const dvCal = Math.round((cal / 2000) * 100);
  const dvProt = Math.round((prot / 50) * 100);
  const dvCarbs = Math.round((carbs / 275) * 100);
  const dvSugar = Math.round((sugar / 50) * 100);
  const dvAddedSugar = Math.round((addedSugar / 25) * 100);
  const dvFat = Math.round((fat / 78) * 100);
  const dvSatFat = Math.round((satFat / 20) * 100);
  const dvSod = Math.round((sod / 2300) * 100);
  const dvFib = Math.round((fib / 28) * 100);
  const dvPot = Math.round((pot / 4700) * 100);
  const dvCalc = Math.round((calc / 1300) * 100);
  const dvIr = Math.round((ir / 18) * 100);
  const dvVitD = Math.round((vitD / 20) * 100);

  // Energy distribution percentage
  const calFromFat = fat * 9;
  const calFromCarb = carbs * 4;
  const calFromProt = prot * 4;
  const totalCalEst = calFromFat + calFromCarb + calFromProt || 1;
  const pctFat = Math.round((calFromFat / totalCalEst) * 100);
  const pctCarb = Math.round((calFromCarb / totalCalEst) * 100);
  const pctProt = Math.max(0, 100 - pctFat - pctCarb);

  // Glycemic & Metabolic calculations
  const fiberToCarbRatio = +(fib / Math.max(1, carbs)).toFixed(2);
  const sodiumDensity = +(sod / Math.max(1, cal)).toFixed(2);
  const glycemicRisk =
    fiberToCarbRatio >= 0.15 && sugar < 8
      ? 'LOW'
      : fiberToCarbRatio >= 0.08
      ? 'MODERATE'
      : 'ELEVATED';

  // SVG Donut calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const carbOffset = circumference * (1 - pctCarb / 100);
  const protOffset = circumference * (1 - pctProt / 100);
  const fatOffset = circumference * (1 - pctFat / 100);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-fade-in-up font-sans">
      {/* ── Top Header Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#142618] border border-[#8BE28B]/30 text-[#C8FF4D] flex items-center justify-center shadow-[0_0_20px_rgba(200,255,77,0.2)]">
            <span className="material-symbols-outlined text-[26px]">pie_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-bold uppercase tracking-wider border border-[#8BE28B]/30">
                FDA 21 CFR • FSSAI 2022
              </span>
              <span className="text-xs text-[#A9B4AA]">• Dynamic Macro Deconstruction Studio</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-0.5">
              Nutrition & <span className="text-[#8BE28B]">Macro Intelligence</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          <Link
            to="/results"
            className="px-3.5 py-2 rounded-xl bg-[#101A13] text-[#A9B4AA] hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Results</span>
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(200,255,77,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">qr_code_scanner</span>
            <span>Scan Another</span>
          </Link>
        </div>
      </div>

      {/* ── Active Specimen & Serving Multiplier Bar ── */}
      <div className="p-4 rounded-2xl bg-[#0D1610]/65 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Specimen Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scroll-thin">
          <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider shrink-0 pr-1">
            Active Specimen:
          </span>
          {profiles.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedIdx(idx);
                setPortionMultiplier(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedIdx === idx
                  ? 'bg-[#C8FF4D] text-black font-extrabold shadow-[0_0_12px_rgba(200,255,77,0.3)]'
                  : 'bg-[#101A13] text-[#A9B4AA] hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {selectedIdx === idx && <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />}
              <span>{p.productName}</span>
            </button>
          ))}
        </div>

        {/* Portion Multiplier Pill */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider">
            Portion Multiplier:
          </span>
          <div className="flex items-center bg-[#071009] rounded-xl p-1 border border-white/10">
            {[0.5, 1, 1.5, 2, 3].map(m => (
              <button
                key={m}
                onClick={() => setPortionMultiplier(m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  portionMultiplier === m
                    ? 'bg-[#142618] text-[#8BE28B] border border-[#8BE28B]/40 shadow-sm'
                    : 'text-[#A9B4AA] hover:text-white'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BENTO TOP GRID: Macro Donut, Glycemic Index, Energy Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Caloric Core & Donut Ratio (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8BE28B] text-[20px]">donut_large</span>
              <h2 className="text-sm font-bold text-white">Caloric Core & Macro Split</h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#102014] text-[#C8FF4D] font-mono text-[11px] font-bold border border-[#C8FF4D]/30">
              {profile.servingSize}
            </span>
          </div>

          {/* Interactive Donut Visualization */}
          <div className="flex items-center justify-center gap-6 py-5">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#101A13"
                  strokeWidth="10"
                />
                {/* Carbs Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#8BE28B"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={carbOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                {/* Protein Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#C8FF4D"
                  strokeWidth="10"
                  strokeDasharray={`${(pctProt / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-((pctCarb / 100) * circumference)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                {/* Fat Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#FFB86B"
                  strokeWidth="10"
                  strokeDasharray={`${(pctFat / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-(((pctCarb + pctProt) / 100) * circumference)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>

              {/* Center Calorie Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white leading-none tracking-tight">{cal}</span>
                <span className="text-[10px] font-bold text-[#8BE28B] uppercase tracking-wider mt-0.5">kcal / srv</span>
              </div>
            </div>

            {/* Macro Legends */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8BE28B] shadow-[0_0_8px_rgba(139,226,139,0.5)]" />
                <div className="text-xs">
                  <span className="text-[#A9B4AA]">Carbs: </span>
                  <strong className="text-white font-bold">{pctCarb}%</strong>
                  <span className="text-[10px] text-[#A9B4AA]"> ({carbs}g)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C8FF4D] shadow-[0_0_8px_rgba(200,255,77,0.5)]" />
                <div className="text-xs">
                  <span className="text-[#A9B4AA]">Protein: </span>
                  <strong className="text-white font-bold">{pctProt}%</strong>
                  <span className="text-[10px] text-[#A9B4AA]"> ({prot}g)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFB86B] shadow-[0_0_8px_rgba(255,184,107,0.5)]" />
                <div className="text-xs">
                  <span className="text-[#A9B4AA]">Fats: </span>
                  <strong className="text-white font-bold">{pctFat}%</strong>
                  <span className="text-[10px] text-[#A9B4AA]"> ({fat}g)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#071009]/80 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-[#A9B4AA]">Daily Caloric Share (2,000 kcal baseline):</span>
            <strong className="text-[#C8FF4D] font-mono font-bold">{dvCal}% DV</strong>
          </div>
        </div>

        {/* Card 2: Metabolic & Glycemic Dynamics (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C8FF4D] text-[20px]">ecg_heart</span>
              <h2 className="text-sm font-bold text-white">Metabolic & Glycemic Dynamics</h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              glycemicRisk === 'LOW'
                ? 'bg-[#142A1A] text-[#8BE28B] border border-[#8BE28B]/30'
                : glycemicRisk === 'MODERATE'
                ? 'bg-[#2A2312] text-[#FFB86B] border border-[#FFB86B]/30'
                : 'bg-[#2E1212] text-[#FF5252] border border-[#FF5252]/30'
            }`}>
              {glycemicRisk} GLYCEMIC LOAD
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 my-4">
            {/* Metric 1: Fiber-to-Carb Ratio */}
            <div className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider">Fiber : Carb Ratio</span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-black text-white">{fiberToCarbRatio}</span>
                <span className="text-[10px] text-[#8BE28B] font-bold">ratio</span>
              </div>
              <span className="text-[10px] text-[#8BE28B] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">
                  {fiberToCarbRatio >= 0.1 ? 'check_circle' : 'warning'}
                </span>
                {fiberToCarbRatio >= 0.1 ? 'Optimal Sugar Release' : 'Elevated Glucose Spike'}
              </span>
            </div>

            {/* Metric 2: Sodium Density */}
            <div className="p-4 rounded-2xl bg-[#071009]/90 border border-white/5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#A9B4AA] uppercase tracking-wider">Sodium Density</span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-black text-white">{sodiumDensity}</span>
                <span className="text-[10px] text-[#A9B4AA]">mg/kcal</span>
              </div>
              <span className={`text-[10px] flex items-center gap-1 ${
                sodiumDensity <= 1.0 ? 'text-[#8BE28B]' : 'text-[#FF5252]'
              }`}>
                <span className="material-symbols-outlined text-[13px]">
                  {sodiumDensity <= 1.0 ? 'check_circle' : 'warning'}
                </span>
                {sodiumDensity <= 1.0 ? 'Safe Daily Threshold' : 'Excess Sodium Load'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#071009]/80 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-[#A9B4AA]">Added Sugars Ceiling:</span>
            <strong className={`font-mono font-bold ${dvAddedSugar > 20 ? 'text-[#FF5252]' : 'text-[#8BE28B]'}`}>
              {addedSugar}g ({dvAddedSugar}% Max DV)
            </strong>
          </div>
        </div>

        {/* Card 3: Energy Share Breakdown (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8BE28B] text-[20px]">bolt</span>
              <h2 className="text-sm font-bold text-white">Macronutrient Partitioning</h2>
            </div>
            <span className="text-[11px] font-mono text-[#A9B4AA]">Caloric Energy Split</span>
          </div>

          <div className="space-y-3.5 my-3">
            {/* Carbs Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A9B4AA] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8BE28B]" /> Carbohydrates
                </span>
                <strong className="text-white font-mono">{carbs}g • {calFromCarb} kcal ({pctCarb}%)</strong>
              </div>
              <div className="h-2 rounded-full bg-[#101A13] overflow-hidden">
                <div className="h-full rounded-full bg-[#8BE28B] transition-all duration-700" style={{ width: `${pctCarb}%` }} />
              </div>
            </div>

            {/* Protein Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A9B4AA] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C8FF4D]" /> Dietary Protein
                </span>
                <strong className="text-white font-mono">{prot}g • {calFromProt} kcal ({pctProt}%)</strong>
              </div>
              <div className="h-2 rounded-full bg-[#101A13] overflow-hidden">
                <div className="h-full rounded-full bg-[#C8FF4D] transition-all duration-700" style={{ width: `${pctProt}%` }} />
              </div>
            </div>

            {/* Fats Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#A9B4AA] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFB86B]" /> Total Lipid Fats
                </span>
                <strong className="text-white font-mono">{fat}g • {calFromFat} kcal ({pctFat}%)</strong>
              </div>
              <div className="h-2 rounded-full bg-[#101A13] overflow-hidden">
                <div className="h-full rounded-full bg-[#FFB86B] transition-all duration-700" style={{ width: `${pctFat}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#071009]/80 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-[#A9B4AA]">Dietary Fiber Yield:</span>
            <strong className="text-[#C8FF4D] font-mono font-bold">{fib}g ({dvFib}% DV)</strong>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE DIGITAL NUTRITION AUDIT MATRIX (BENTO FULL WIDTH) ── */}
      <div className="rounded-3xl bg-[#0D1610]/75 backdrop-blur-xl border border-[#8BE28B]/25 p-6 shadow-2xl flex flex-col gap-5">
        {/* Matrix Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C8FF4D] text-[22px]">format_list_bulleted</span>
              <h2 className="text-lg font-bold text-white">Full Nutritional Spectrum & Daily Value (%DV)</h2>
            </div>
            <p className="text-xs text-[#A9B4AA] mt-0.5">
              Tested against FDA 21 CFR § 101.9 standards and FSSAI 2022 front-of-pack benchmark ceilings.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#071009] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            {[
              { id: 'all', label: 'All Nutrients' },
              { id: 'macros', label: 'Macronutrients' },
              { id: 'micros', label: 'Vitamins & Minerals' },
              { id: 'cardio', label: 'Cardio & Sodium' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveNutrientTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeNutrientTab === tab.id
                    ? 'bg-[#C8FF4D] text-black font-extrabold shadow-sm'
                    : 'text-[#A9B4AA] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nutritional Spectrum Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Total Fat */}
          {(activeNutrientTab === 'all' || activeNutrientTab === 'macros' || activeNutrientTab === 'cardio') && (
            <div className="p-4 rounded-2xl bg-[#071009]/80 border border-white/10 hover:border-[#8BE28B]/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Total Fat</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  dvFat > 20 ? 'bg-[#2E1212] text-[#FF5252]' : 'bg-[#142618] text-[#8BE28B]'
                }`}>
                  {dvFat}% DV
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-black text-white">{fat}</span>
                <span className="text-xs text-[#A9B4AA]">grams</span>
              </div>
              <div className="text-[11px] text-[#A9B4AA] space-y-1">
                <div className="flex justify-between">
                  <span>Saturated Fat:</span>
                  <strong className={dvSatFat > 20 ? 'text-[#FF5252]' : 'text-white'}>{satFat}g ({dvSatFat}% DV)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Trans Fat:</span>
                  <strong className="text-white">{profile.transFat}g</strong>
                </div>
              </div>
            </div>
          )}

          {/* Tile 2: Total Carbohydrates */}
          {(activeNutrientTab === 'all' || activeNutrientTab === 'macros') && (
            <div className="p-4 rounded-2xl bg-[#071009]/80 border border-white/10 hover:border-[#8BE28B]/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Total Carbohydrates</span>
                <span className="px-2 py-0.5 rounded-md bg-[#142618] text-[#8BE28B] text-[10px] font-mono font-bold">
                  {dvCarbs}% DV
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-black text-white">{carbs}</span>
                <span className="text-xs text-[#A9B4AA]">grams</span>
              </div>
              <div className="text-[11px] text-[#A9B4AA] space-y-1">
                <div className="flex justify-between">
                  <span>Dietary Fiber:</span>
                  <strong className="text-[#C8FF4D]">{fib}g ({dvFib}% DV)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Sugars:</span>
                  <strong className="text-white">{sugar}g</strong>
                </div>
              </div>
            </div>
          )}

          {/* Tile 3: Dietary Protein */}
          {(activeNutrientTab === 'all' || activeNutrientTab === 'macros') && (
            <div className="p-4 rounded-2xl bg-[#071009]/80 border border-white/10 hover:border-[#8BE28B]/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Dietary Protein</span>
                <span className="px-2 py-0.5 rounded-md bg-[#142618] text-[#C8FF4D] text-[10px] font-mono font-bold">
                  {dvProt}% DV
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-black text-white">{prot}</span>
                <span className="text-xs text-[#A9B4AA]">grams</span>
              </div>
              <div className="text-[11px] text-[#A9B4AA] space-y-1">
                <div className="flex justify-between">
                  <span>Amino Acid Profile:</span>
                  <strong className="text-[#8BE28B]">Complete Plant & Grain</strong>
                </div>
                <div className="flex justify-between">
                  <span>Protein Density:</span>
                  <strong className="text-white">{(prot / Math.max(1, cal / 100)).toFixed(1)}g / 100kcal</strong>
                </div>
              </div>
            </div>
          )}

          {/* Tile 4: Sodium & Electrolytes */}
          {(activeNutrientTab === 'all' || activeNutrientTab === 'cardio') && (
            <div className="p-4 rounded-2xl bg-[#071009]/80 border border-white/10 hover:border-[#8BE28B]/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Sodium & Salt</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  dvSod > 20 ? 'bg-[#2E1212] text-[#FF5252]' : 'bg-[#142618] text-[#8BE28B]'
                }`}>
                  {dvSod}% DV
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-black text-white">{sod}</span>
                <span className="text-xs text-[#A9B4AA]">milligrams</span>
              </div>
              <div className="text-[11px] text-[#A9B4AA] space-y-1">
                <div className="flex justify-between">
                  <span>Cholesterol:</span>
                  <strong className="text-white">{profile.cholesterol}mg (0% DV)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Potassium Counter:</span>
                  <strong className="text-[#8BE28B]">{pot}mg ({dvPot}% DV)</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Micronutrient Rings Spectrum Bar */}
        <div className="p-5 rounded-2xl bg-[#071009]/90 border border-white/5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">biotech</span>
              <span>Essential Micronutrients & Minerals Spectrum</span>
            </span>
            <span className="text-[10px] font-mono text-[#A9B4AA]">Daily Reference Intake (DRI)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Potassium', val: `${pot}mg`, dv: dvPot, icon: 'bolt' },
              { name: 'Calcium', val: `${calc}mg`, dv: dvCalc, icon: 'egg_alt' },
              { name: 'Iron', val: `${ir}mg`, dv: dvIr, icon: 'fitness_center' },
              { name: 'Vitamin D', val: `${vitD}mcg`, dv: dvVitD, icon: 'wb_sunny' },
              { name: 'Zinc', val: `${zn}mg`, dv: Math.round((zn / 11) * 100), icon: 'shield' },
              { name: 'Magnesium', val: `${mg}mg`, dv: Math.round((mg / 420) * 100), icon: 'psychology' },
            ].map(m => (
              <div key={m.name} className="p-3 rounded-xl bg-[#0D1610] border border-white/5 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-white">{m.name}</span>
                <span className="text-sm font-black text-[#C8FF4D] my-0.5">{m.val}</span>
                <div className="w-full bg-[#101A13] h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-[#8BE28B] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, m.dv)}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-[#A9B4AA] mt-1">{m.dv}% DV</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Assistant Action Banner ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#102416]/90 via-[#0D1610]/90 to-[#102416]/90 backdrop-blur-xl border border-[#8BE28B]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C8FF4D]/20 border border-[#C8FF4D]/40 text-[#C8FF4D] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Ask NutriVerify AI About This Specimen's Macros</div>
            <div className="text-xs text-[#A9B4AA]">
              Get personalized glycemic index predictions, keto/diabetic suitability, and clean-label alternatives.
            </div>
          </div>
        </div>

        <Link
          to={`/chat?q=Analyze+the+macronutrient+profile+and+glycemic+load+for+${encodeURIComponent(profile.productName)}`}
          className="px-4 py-2 rounded-xl bg-[#C8FF4D] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(200,255,77,0.3)] hover:brightness-110 transition-all shrink-0 flex items-center gap-1.5"
        >
          <span>Ask AI Assistant</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
