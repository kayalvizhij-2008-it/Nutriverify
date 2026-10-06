import { Link } from 'react-router-dom';
import AmbientBackground from '../components/AmbientBackground';

export default function About() {
  return (
    <div className="relative min-h-screen bg-[#071009] text-[#dde5d9] font-sans antialiased overflow-x-hidden flex flex-col">
      <AmbientBackground variant="home" intensity="medium" />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-gutter py-space-xl flex flex-col gap-12 animate-fade-in-up">
        {/* Header Hero */}
        <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101A13]/90 border border-white/10 w-fit mx-auto">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-label-code text-xs text-primary-container font-semibold uppercase tracking-wider">
              METHODOLOGY &amp; ARCHITECTURE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Nutri<span className="text-primary-container">Verify</span> Food Science &amp; AI Intelligence System
          </h1>

          <p className="text-base sm:text-lg text-[#A9B4AA] leading-relaxed">
            NutriVerify bridges consumer transparency and regulatory food safety by combining edge optical character recognition (OCR), bio-nutritional spectral algorithms, and statutory compliance cross-checks.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#142217] text-primary-container flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-[26px]">document_scanner</span>
            </div>
            <h3 className="text-lg font-bold text-white">01. Optical OCR Capture</h3>
            <p className="text-xs text-[#A9B4AA] leading-relaxed">
              Spatial curvature distortion correction and high-resolution text extraction from complex, reflective food packaging.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#142217] text-[#8BE28B] flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-[26px]">biotech</span>
            </div>
            <h3 className="text-lg font-bold text-white">02. Additive Cross-Index</h3>
            <p className="text-xs text-[#A9B4AA] leading-relaxed">
              Cross-referencing against 45,000+ chemical E-numbers, ultra-processed emulsifiers, and hidden artificial sweeteners.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#142217] text-[#FFB86B] flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-[26px]">gavel</span>
            </div>
            <h3 className="text-lg font-bold text-white">03. Statutory Verification</h3>
            <p className="text-xs text-[#A9B4AA] leading-relaxed">
              Real-time audit of front-of-pack marketing claims against US FDA 21 CFR, EU 1924/2006, and FSSAI 2020 regulatory bodies.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D1610] border border-white/10 shadow-xl flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#142217] text-tertiary-fixed-dim flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-[26px]">smart_toy</span>
            </div>
            <h3 className="text-lg font-bold text-white">04. NutriVerify AI</h3>
            <p className="text-xs text-[#A9B4AA] leading-relaxed">
              Context-grounded conversational assistant providing transparent score attribution, dietary goal matching, and cleaner alternatives.
            </p>
          </div>
        </div>

        {/* Regulatory Governance Section */}
        <div className="rounded-3xl bg-[#0D1610] border border-white/10 p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="font-label-code text-xs text-primary-container uppercase font-bold tracking-wider">
              REGULATORY COMPLIANCE
            </span>
            <h2 className="text-2xl font-bold text-white">
              Harmonized International Standards
            </h2>
            <p className="text-sm text-[#A9B4AA] leading-relaxed">
              NutriVerify does not invent arbitrary scores. Every ingredient risk level, allergen warning, and claim verdict is benchmarked against statutory regulations in India (FSSAI), the United States (FDA), and the European Union (EFSA).
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-[#142217] border border-white/5 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#8BE28B]" />
              <span className="text-sm font-semibold text-white">FSSAI Labelling Regulations 2020</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-[#142217] border border-white/5 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary-container" />
              <span className="text-sm font-semibold text-white">U.S. FDA FALCPA &amp; 21 CFR § 101.9</span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-[#142217] border border-white/5 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#FFB86B]" />
              <span className="text-sm font-semibold text-white">EU Regulation (EU) No 1169/2011</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/analyze"
            className="px-8 py-4 rounded-xl bg-primary-container text-black font-extrabold text-base shadow-[0_0_24px_rgba(200,255,77,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>Analyze a Food Label</span>
          </Link>

          <Link
            to="/nutrisaathi"
            className="px-8 py-4 rounded-xl bg-[#142217] text-white font-bold text-base border border-white/10 hover:bg-[#1c3021] active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px] text-primary-container">smart_toy</span>
            <span>Talk with NutriVerify AI</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
