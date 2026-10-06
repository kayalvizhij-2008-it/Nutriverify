import { Link } from 'react-router-dom';

const METHODS = [
  {
    num: '01',
    icon: 'photo_camera',
    title: 'Camera Scan',
    desc: 'Inspect a physical food label directly through your device camera with real-time edge detection and OCR capture.',
    cta: 'Launch Scanner',
    to: '/camera-scan',
    badge: 'Real-Time Edge OCR',
    accentColor: '#C8FF4D',
    capabilities: ['WebRTC Camera Stream', 'Automatic Label Framing', 'Instant Fallback Demo'],
    featured: true,
  },
  {
    num: '02',
    icon: 'cloud_upload',
    title: 'Upload Label',
    desc: 'Upload high-resolution packaging photos or digital label scans for deep OCR and ingredient breakdown.',
    cta: 'Upload Label',
    to: '/upload',
    badge: 'Packaging OCR',
    accentColor: '#8BE28B',
    capabilities: ['JPG, PNG, WEBP up to 10MB', 'Curvature Correction', 'Drag & Drop Interface'],
    featured: false,
  },
  {
    num: '03',
    icon: 'edit_note',
    title: 'Manual Entry',
    desc: 'Manually input nutritional values, serving sizes, and ingredient lists for controlled regulatory testing.',
    cta: 'Enter Manually',
    to: '/manual',
    badge: 'Precision Testing',
    accentColor: '#FFB86B',
    capabilities: ['5-Step Guided Flow', 'Custom Ingredient Input', 'Instant Allergen Scan'],
    featured: false,
  },
];

const PIPELINE = [
  { num: '01', icon: 'photo_camera', label: 'Capture', desc: 'Optical feed acquisition' },
  { num: '02', icon: 'text_fields', label: 'Extract OCR', desc: 'Bilingual text deconstruction' },
  { num: '03', icon: 'biotech', label: 'Deconstruct', desc: 'Additives & ingredient lookup' },
  { num: '04', icon: 'fact_check', label: 'Verify Statutes', desc: 'FDA, EFSA & FSSAI cross-check' },
  { num: '05', icon: 'speed', label: 'Compute NutriScore', desc: 'Composite health integrity score' },
];

const BENCHMARKS = [
  {
    icon: 'verified_user',
    title: 'FDA 21 CFR Compliance',
    desc: 'Part 101 food labeling mandates & claim verification standards active.',
    status: 'Verified Ready',
  },
  {
    icon: 'policy',
    title: 'EFSA EU No 1169/2011',
    desc: 'Mandatory EU-14 allergen cross-contact & additive safety ceilings.',
    status: 'Active Matrix',
  },
  {
    icon: 'shield_with_heart',
    title: 'FSSAI 2022 Guidelines',
    desc: 'Indian nutritional safety thresholds & front-of-pack warning triggers.',
    status: 'Synchronized',
  },
];

export default function AnalyzeHub() {
  return (
    <div className="w-full max-w-[1240px] mx-auto px-6 py-8 flex flex-col gap-8 animate-fade-in-up">
      {/* ── Command Center Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#101A13]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container font-label-code text-[11px] font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span>Biometric Food Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Food Analysis Command Center
          </h1>
          <p className="text-sm md:text-base text-[#A9B4AA] max-w-2xl leading-relaxed">
            Choose how you want to analyze your food label. NutriVerify extracts packaging text, cross-references additives, and audits claims against global food safety standards.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <div className="px-4 py-2 rounded-xl bg-[#141F17] border border-white/10 flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <div className="flex flex-col text-right">
              <span className="font-label-code text-[11px] font-bold text-white tracking-wide">3 ENGINES ONLINE</span>
              <span className="font-label-code text-[10px] text-[#8BE28B]">45,000+ Compounds</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Analysis Methods Grid (Clean 3-Column Layout) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold font-label-code text-[#A9B4AA] uppercase tracking-wider">
            Choose Your Analysis Method
          </h2>
          <span className="text-xs font-label-code text-[#6F7A70]">Select an intake method to begin</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {METHODS.map((m) => (
            <Link
              key={m.title}
              to={m.to}
              className={`group relative flex flex-col justify-between bg-[#101A13]/90 hover:bg-[#141F17] rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${
                m.featured
                  ? 'border-primary-container/40 shadow-[0_0_30px_rgba(200,255,77,0.08)] ring-1 ring-primary-container/20'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Featured Subtle Glow Line */}
              {m.featured && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent rounded-t-2xl" />
              )}

              <div>
                {/* Card Top: Number, Icon, Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="font-label-code text-sm font-bold text-[#6F7A70] group-hover:text-primary-container transition-colors">
                      {m.num}
                    </span>
                    <div
                      className="w-13 h-13 w-12 h-12 rounded-xl bg-[#141F17] group-hover:bg-[#1a281e] flex items-center justify-center transition-all duration-200 border border-white/5 group-hover:border-white/20 shadow-inner"
                      style={{ color: m.accentColor }}
                    >
                      <span className="material-symbols-outlined text-[26px]">{m.icon}</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-label-code px-2.5 py-1 rounded-full border uppercase tracking-wider font-semibold"
                    style={{
                      backgroundColor: `${m.accentColor}15`,
                      color: m.accentColor,
                      borderColor: `${m.accentColor}35`,
                    }}
                  >
                    {m.badge}
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-container transition-colors">
                  {m.title}
                </h3>
                <p className="text-sm text-[#A9B4AA] leading-relaxed mb-5">
                  {m.desc}
                </p>

                {/* Capability Pills */}
                <div className="space-y-1.5 mb-6 pt-2 border-t border-white/5">
                  {m.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-xs text-[#6F7A70] group-hover:text-[#A9B4AA] transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.accentColor }} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button CTA */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-primary-container transition-colors">
                  {m.cta}
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#141F17] group-hover:bg-primary-container group-hover:text-black flex items-center justify-center text-[#A9B4AA] transition-all">
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Algorithmic Verification Pipeline ── */}
      <div className="bg-[#101A13]/90 rounded-2xl p-6 md:p-8 border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold font-label-code text-primary-container uppercase tracking-wider">
              Autonomous Verification Stack
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              NutriVerify Algorithmic Pipeline
            </h3>
          </div>
          <span className="text-xs font-label-code text-[#6F7A70]">
            Average latency: ~1.2s on edge neural model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {PIPELINE.map((step, idx) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center text-center p-4 rounded-xl bg-[#141F17]/80 border border-white/5 hover:border-primary-container/30 hover:bg-[#1a281e] transition-all group"
            >
              <div className="w-12 h-12 mb-3 rounded-xl bg-[#101A13] border border-white/10 flex items-center justify-center group-hover:border-primary-container group-hover:bg-primary-container/15 transition-all text-[#8BE28B] group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
              </div>
              <span className="text-[11px] font-label-code text-primary-container font-bold mb-1">
                STEP {step.num}
              </span>
              <span className="text-sm font-semibold text-white mb-1">
                {step.label}
              </span>
              <span className="text-xs text-[#6F7A70] leading-tight">
                {step.desc}
              </span>

              {/* Arrow connector between steps (desktop) */}
              {idx < PIPELINE.length - 1 && (
                <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#6F7A70]">
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Verification Engines & Regulatory Standards (Fills Lower Section Purposefully) ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-label-code text-[#A9B4AA] uppercase tracking-wider">
          Integrated Food Safety Standards & Regulatory Engines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {BENCHMARKS.map((b) => (
            <div
              key={b.title}
              className="flex items-start gap-4 p-5 rounded-xl bg-[#101A13]/70 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#141F17] flex items-center justify-center text-primary-container shrink-0 border border-white/5">
                <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{b.title}</h4>
                  <span className="text-[10px] font-label-code px-2 py-0.5 rounded-full bg-[#141F17] text-[#8BE28B] border border-[#8BE28B]/30 font-medium">
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-[#A9B4AA] leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Instant Quick-Audit Specimen Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary-container/10 via-[#101A13] to-[#141F17] border border-primary-container/30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-black flex items-center justify-center shrink-0 font-bold shadow-[0_0_15px_rgba(200,255,77,0.4)]">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Need an Instant Demonstration?</div>
            <div className="text-xs text-[#A9B4AA]">
              Launch the Camera Scanner and choose "Use Demo Product" to inspect a pre-verified nutritional specimen instantly.
            </div>
          </div>
        </div>
        <Link
          to="/camera-scan"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(200,255,77,0.3)] shrink-0"
        >
          <span>Try Demo Scanner</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
