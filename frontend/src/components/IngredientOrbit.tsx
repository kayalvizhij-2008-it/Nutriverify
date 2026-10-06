import React, { useState } from 'react';

interface IngredientToken {
  id: string;
  name: string;
  category: 'Safe & Botanical' | 'Active Nutrient' | 'Additive Alert' | 'Sweetener';
  status: 'SAFE' | 'ALERT' | 'REVIEW';
  role: string;
  icon: string;
  angle: number; // in degrees
  distance: number; // in pixels
}

const INGREDIENTS: IngredientToken[] = [
  {
    id: 'oats',
    name: 'Organic Rolled Oats',
    category: 'Safe & Botanical',
    status: 'SAFE',
    role: 'Primary whole-grain source delivering 4.2g beta-glucan soluble fiber per 100g.',
    icon: '🌾',
    angle: 0,
    distance: 140,
  },
  {
    id: 'whey',
    name: 'Bioavailable Whey Protein',
    category: 'Active Nutrient',
    status: 'SAFE',
    role: '98% bio-absorbable complete amino acid profile supporting muscular recovery.',
    icon: '⚡',
    angle: 72,
    distance: 155,
  },
  {
    id: 'stevia',
    name: 'Natural Stevia Rebaudiana',
    category: 'Sweetener',
    status: 'SAFE',
    role: 'Zero-glycemic natural leaf extract replacing refined table sugars.',
    icon: '🌿',
    angle: 144,
    distance: 135,
  },
  {
    id: 'sugar',
    name: 'Reconstituted Fructose Syrup',
    category: 'Additive Alert',
    status: 'ALERT',
    role: 'Hidden free sugar delivering identical metabolic load to refined sucrose.',
    icon: '⚠️',
    angle: 216,
    distance: 150,
  },
  {
    id: 'sodium',
    name: 'Himalayan Mineral Salt',
    category: 'Active Nutrient',
    status: 'REVIEW',
    role: 'Natural electrolyte balance; sodium level compliant with daily allowance.',
    icon: '💧',
    angle: 288,
    distance: 140,
  },
];

export default function IngredientOrbit() {
  const [selected, setSelected] = useState<IngredientToken>(INGREDIENTS[0]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col items-center">
      {/* Background Aura */}
      <div className="absolute w-72 h-72 rounded-full bg-[#8BE28B]/10 blur-[90px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-xl mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102014] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30 mb-2">
          <span>🔬 Molecular Ingredient Orbit</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-white">
          Real-Time Formulation Deconstruction
        </h3>
        <p className="text-xs text-[#A9B4AA] mt-1">
          Hover or tap an orbiting ingredient token to inspect its biochemical class, status, and statutory safety profile.
        </p>
      </div>

      {/* Orbit Arena & Center Product Specimen */}
      <div className="relative w-full max-w-[500px] h-[360px] flex items-center justify-center my-4 select-none">
        {/* Orbit Path Circles */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-[#8BE28B]/25 animate-spin-slow pointer-events-none" />
        <div className="absolute w-[340px] h-[340px] rounded-full border border-white/5 pointer-events-none" />

        {/* Center Product Package */}
        <div className="relative z-20 w-32 h-44 rounded-2xl bg-gradient-to-b from-[#142618] to-[#0A120C] border-2 border-[#8BE28B]/50 flex flex-col items-center justify-center p-3 text-center shadow-[0_0_25px_rgba(139,226,139,0.3)] group cursor-pointer">
          <div className="w-12 h-3.5 rounded-t-md bg-[#8BE28B]/40 mb-2" />
          <div className="w-full flex-1 rounded-lg bg-[#071009] border border-white/10 flex flex-col items-center justify-center p-1.5">
            <span className="text-[9px] font-bold text-[#8BE28B] uppercase tracking-wider">NutriVerify</span>
            <span className="text-[11px] font-black text-white leading-tight mt-0.5">CLEAN<br />PROTEIN</span>
            <span className="text-[8px] text-[#A9B4AA] mt-1">Scan Complete</span>
          </div>
          <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#C8FF4D] text-black text-[9px] font-black tracking-wide shadow-md">
            98% GRADE A
          </span>
        </div>

        {/* Orbiting Ingredient Tokens */}
        {INGREDIENTS.map((item, idx) => {
          // Compute circular position (spread evenly around center)
          const rad = ((item.angle + 30) * Math.PI) / 180;
          const x = Math.cos(rad) * item.distance;
          const y = Math.sin(rad) * item.distance;

          const isSelected = selected.id === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              onMouseEnter={() => { setSelected(item); setHoveredId(item.id); }}
              onMouseLeave={() => setHoveredId(null)}
              className={`absolute z-30 transition-all duration-300 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg ${
                isSelected
                  ? 'bg-[#C8FF4D] text-black scale-110 shadow-[0_0_20px_rgba(200,255,77,0.6)] font-extrabold ring-2 ring-[#C8FF4D]'
                  : item.status === 'ALERT'
                  ? 'bg-[#331111]/90 text-[#FF6B6B] border border-[#FF6B6B]/40 hover:scale-105'
                  : 'bg-[#0D1811]/90 text-white border border-[#8BE28B]/30 hover:border-[#8BE28B] hover:scale-105'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="text-[11px] whitespace-nowrap">{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Selected Token Detail Card at Bottom */}
      <div className="w-full max-w-xl mt-4 p-4 rounded-2xl bg-[#0D1811] border border-[#8BE28B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#142318] text-2xl flex items-center justify-center shrink-0 border border-white/10">
            {selected.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{selected.name}</h4>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                selected.status === 'ALERT'
                  ? 'bg-error-container/40 text-error'
                  : 'bg-[#1A3320] text-[#8BE28B]'
              }`}>
                {selected.category}
              </span>
            </div>
            <p className="text-[11px] text-[#A9B4AA] mt-0.5 leading-snug">
              {selected.role}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center">
          <span className="text-[9px] font-mono text-[#A9B4AA] uppercase">Safety Status</span>
          <span className={`text-xs font-black ${
            selected.status === 'ALERT' ? 'text-[#FF6B6B]' : 'text-[#8BE28B]'
          }`}>
            {selected.status === 'ALERT' ? 'Caution Needed ⚠' : 'Verified Pure ✓'}
          </span>
        </div>
      </div>
    </div>
  );
}
