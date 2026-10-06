import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Dimension {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  link: string;
  status: string;
  metric: string;
  description: string;
}

const DIMENSIONS: Dimension[] = [
  {
    id: 'nutrition',
    title: 'Nutrition & Macros',
    category: 'Bio-energetics',
    icon: 'table_chart',
    color: '#8BE28B',
    link: '/nutrition',
    status: 'OPTIMAL',
    metric: '120 kcal • 24g Protein',
    description: 'Calculates true caloric density and macro-nutrient balance.',
  },
  {
    id: 'ingredients',
    title: 'Ingredients & Additives',
    category: 'Formulation Purity',
    icon: 'biotech',
    color: '#C8FF4D',
    link: '/ingredients',
    status: 'CLEAN',
    metric: 'Zero Palm Oil • 0 E-numbers',
    description: 'Segments botanical actives vs hidden emulsifiers & preservatives.',
  },
  {
    id: 'allergens',
    title: 'Allergen Risk Matrix',
    category: 'Safety Envelope',
    icon: 'shield',
    color: '#FFB86B',
    link: '/allergens',
    status: 'BIG 9 CLEAR',
    metric: '0 ppm Contamination',
    description: 'Cross-checks US Big 9 and EU 14 mandatory disclosure allergens.',
  },
  {
    id: 'claims',
    title: 'Front-of-Pack Claims',
    category: 'Regulatory Audit',
    icon: 'verified',
    color: '#8BE28B',
    link: '/claims',
    status: 'STATUTE VERIFIED',
    metric: '21 CFR § 101 Compliant',
    description: 'Deconstructs greenwashing slogans against clinical trial norms.',
  },
];

export default function FoodIntelligenceMap() {
  const [activeDim, setActiveDim] = useState<Dimension>(DIMENSIONS[0]);

  return (
    <div className="w-full rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#8BE28B]/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-xl mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102014] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30 mb-2">
          <span>🌐 360° Food Intelligence Map</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-white">
          Multi-Dimensional Verification Architecture
        </h3>
        <p className="text-xs text-[#A9B4AA] mt-1">
          Explore the four regulatory and bio-nutritional dimensions analyzed for every scanned food product.
        </p>
      </div>

      {/* Interactive Map Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
        {DIMENSIONS.map(dim => {
          const isSelected = activeDim.id === dim.id;
          return (
            <div
              key={dim.id}
              onClick={() => setActiveDim(dim)}
              className={`p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-[#102014] border-[#C8FF4D] shadow-[0_0_20px_rgba(200,255,77,0.2)]'
                  : 'bg-[#0D1811] border-white/10 hover:border-[#8BE28B]/40 hover:bg-[#122216]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#142618] border border-white/10 flex items-center justify-center text-[#8BE28B]">
                      <span className="material-symbols-outlined text-[20px]">{dim.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{dim.title}</h4>
                      <span className="text-[10px] text-[#A9B4AA] uppercase font-mono">{dim.category}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] text-[10px] font-mono font-bold border border-[#8BE28B]/30">
                    {dim.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#C8FF4D] mb-1">
                  {dim.metric}
                </div>
                <p className="text-[11px] text-[#A9B4AA] leading-snug">
                  {dim.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                <span className="text-[10px] text-[#6F7A70]">Dimension active</span>
                <Link
                  to={dim.link}
                  className="text-xs font-bold text-[#8BE28B] hover:text-[#C8FF4D] flex items-center gap-1 transition-colors"
                >
                  <span>Explore Module</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
