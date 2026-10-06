import React, { useState } from 'react';

interface Stage {
  step: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  badge: string;
}

const STAGES: Stage[] = [
  {
    step: '01',
    title: 'Capture',
    subtitle: 'Optical Edge Scanning',
    desc: 'Optical image unwarping, specular glare removal, and boundary cropping of complex curved packaging.',
    icon: 'photo_camera',
    badge: 'Neural Pre-Filter',
  },
  {
    step: '02',
    title: 'Extract',
    subtitle: 'Macro & Micro Parsing',
    desc: 'Segmentation of 82+ additive classes, chemical E-numbers, macro-nutrients, and manufacturer claims.',
    icon: 'segment',
    badge: 'OCR & Tokenizer',
  },
  {
    step: '03',
    title: 'Verify',
    subtitle: 'Statutory Matching',
    desc: 'Cross-checks front-of-pack claims ("Immunity Boost", "Natural") against US FDA 21 CFR and FSSAI 2020 rules.',
    icon: 'fact_check',
    badge: 'Regulatory Engine',
  },
  {
    step: '04',
    title: 'Understand',
    subtitle: 'Allergen & Risk Scoring',
    desc: 'Aggregates hidden sweetening index, Big 9 allergen risks, and composite NutriVerify health score.',
    icon: 'psychology',
    badge: 'Bio-Safety Matrix',
  },
  {
    step: '05',
    title: 'Decide',
    subtitle: 'Actionable Intelligence',
    desc: 'Produces instant clean botanical swap recommendations and verified statutory audit dossiers.',
    icon: 'verified_user',
    badge: 'Certified Dossier',
  },
];

export default function AnalysisFlowchart() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div className="w-full rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 p-6 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute w-80 h-80 rounded-full bg-[#C8FF4D]/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-xl mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102014] text-[#8BE28B] text-xs font-bold border border-[#8BE28B]/30 mb-2">
          <span>⚡ Algorithmic Verification Pathway</span>
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-white">
          Food Label → Intelligence Flow
        </h3>
        <p className="text-xs text-[#A9B4AA] mt-1">
          Trace how packaging data transforms through our 5-stage deterministic regulatory pipeline in real time.
        </p>
      </div>

      {/* 5-Step Horizontal Flow Pathway */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 z-10 my-2">
        {STAGES.map((st, idx) => {
          const isActive = activeStage === idx;
          return (
            <div
              key={st.step}
              onClick={() => setActiveStage(idx)}
              className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between border relative group ${
                isActive
                  ? 'bg-[#102014] border-[#C8FF4D] shadow-[0_0_20px_rgba(200,255,77,0.25)] -translate-y-1'
                  : 'bg-[#0D1811] border-white/10 hover:border-[#8BE28B]/40 hover:bg-[#122216]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isActive ? 'bg-[#C8FF4D] text-black shadow-md' : 'bg-[#142618] text-[#8BE28B]'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{st.icon}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${
                    isActive ? 'text-[#C8FF4D]' : 'text-[#6F7A70]'
                  }`}>
                    STEP {st.step}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-white mb-0.5">{st.title}</h4>
                <div className="text-[10px] text-[#8BE28B] font-semibold mb-2">{st.subtitle}</div>
                <p className="text-[11px] text-[#A9B4AA] leading-snug">
                  {st.desc}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-[#6F7A70] uppercase">{st.badge}</span>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#C8FF4D] animate-ping' : 'bg-white/10'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
