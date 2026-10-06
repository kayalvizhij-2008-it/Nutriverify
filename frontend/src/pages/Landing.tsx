import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AmbientBackground from '../components/AmbientBackground';
import CommandPalette from '../components/CommandPalette';
import IngredientOrbit from '../components/IngredientOrbit';
import FoodIntelligenceMap from '../components/FoodIntelligenceMap';
import AnalysisFlowchart from '../components/AnalysisFlowchart';
import { getDemoAnalysis, DEMO_PRODUCTS } from '../lib/demo';

export default function Landing() {
  const navigate = useNavigate();
  const [activeLens, setActiveLens] = useState<'claims' | 'nutrition' | 'additives'>('claims');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoStageIdx, setDemoStageIdx] = useState(0);
  const [demoProductName, setDemoProductName] = useState('');

  const DEMO_STAGES = [
    '01 · Reading label & packaging specimen...',
    '02 · Extracting nutritional metrics & declarations...',
    '03 · Checking chemical & botanical ingredients...',
    '04 · Validating front-of-pack claims under FDA / EFSA / FSSAI...',
    '05 · Checking allergen risk matrix (US Big 9 & EU 14)...',
    '06 · Calculating NutriVerify health & authenticity scores...',
    '07 · Preparing verification dossier & statutory audit...'
  ];

  const handleRunDemo = async (index = 0) => {
    const demoData = getDemoAnalysis(index);
    setDemoProductName(demoData.productName);
    setDemoLoading(true);
    setDemoStageIdx(0);

    for (let i = 0; i < DEMO_STAGES.length; i++) {
      setDemoStageIdx(i);
      await new Promise(r => setTimeout(r, 350));
    }

    sessionStorage.setItem('nv_last_result', JSON.stringify(demoData));
    await new Promise(r => setTimeout(r, 200));
    setDemoLoading(false);
    navigate('/results');
  };

  const scrollToWorkbench = () => {
    const el = document.getElementById('test-bench-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0D0C] text-[#dde5d9] font-sans antialiased overflow-x-hidden flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* ── Multi-Layer Ambient Background ── */}
      <AmbientBackground variant="home" intensity="high" />
      <CommandPalette />

      {/* ── Fixed Navbar Matching Reference Image 1 ── */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#071009]/90 backdrop-blur-xl border-b border-white/5">
        <div className="h-16 w-full max-w-[1440px] mx-auto px-6 flex items-center justify-between gap-4">
          {/* Brand Logo & Version Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#C8FF4D] text-black flex items-center justify-center shadow-[0_0_15px_rgba(200,255,77,0.4)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <span className="text-lg tracking-tight text-white font-bold">
                Nutri<span className="text-[#C8FF4D]">Verify</span>
              </span>
            </Link>

            <span className="px-2 py-0.5 rounded-full bg-[#101A13] text-[#8BE28B] font-label-code text-[11px] font-semibold border border-white/10">
              v2.6
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-[#C8FF4D] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C8FF4D] after:rounded-full"
            >
              Home
            </Link>
            <Link to="/analyze" className="text-sm text-[#A9B4AA] hover:text-white transition-colors">
              Analyze Hub
            </Link>
            <Link to="/camera-scan" className="text-sm text-[#A9B4AA] hover:text-white transition-colors">
              Camera Scan
            </Link>
            <Link to="/upload" className="text-sm text-[#A9B4AA] hover:text-white transition-colors">
              Upload Label
            </Link>
            <Link to="/manual" className="text-sm text-[#A9B4AA] hover:text-white transition-colors">
              Manual Entry
            </Link>
          </nav>

          {/* Right Status & User Pills */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#101A13] border border-white/10 text-xs text-[#8BE28B] font-label-code">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BE28B] animate-pulse" />
              <span>AI Food Intelligence Lab • 21 CFR § 101 Synchronized</span>
            </div>

            <Link
              to="/nutrisaathi"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101A13] hover:bg-[#142217] border border-white/10 text-xs font-semibold text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-[#8BE28B]">smart_toy</span>
              <span>NutriVerify AI</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#101A13] hover:bg-[#142217] border border-white/10 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#C8FF4D] text-black flex items-center justify-center font-bold text-xs">
                K
              </div>
              <span className="text-xs font-semibold text-white">Kayalvizhi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Landing Hero Section ── */}
      <main className="relative z-10 w-full pt-16 flex-1 flex flex-col">
        {/* SECTION 1: HERO MATCHING IMAGE 1 */}
        <section className="relative w-full overflow-hidden pt-8 pb-12">
          <div className="max-w-[1440px] mx-auto px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(88vh-80px)]">
              {/* Left Column: Hero Copy & Feature Row */}
              <div className="lg:col-span-6 flex flex-col gap-6 z-10">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#102014]/90 border border-[#8BE28B]/30 text-xs font-semibold text-[#8BE28B] w-fit shadow-[0_0_15px_rgba(139,226,139,0.15)]">
                  <span className="text-[#C8FF4D]">✨</span>
                  <span>Smarter Food Choices • Safer You</span>
                </div>

                {/* Primary Hero Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-white leading-[1.08]">
                  Decode Your Food.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8FF4D] via-[#8BE28B] to-[#C8FF4D]">
                    Verify What You Eat.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#A9B4AA] max-w-xl leading-relaxed">
                  NutriVerify uses AI-powered analysis to decode food labels, check ingredients, detect allergens, and verify health claims — so you can eat with confidence.
                </p>

                {/* Feature Icon Pills Grid Row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    to="/ingredients"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1811]/90 hover:bg-[#142318] border border-white/10 hover:border-[#8BE28B]/40 text-xs font-semibold text-white transition-all shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#8BE28B] group-hover:scale-110 transition-transform">search</span>
                    <span>Ingredient Analysis</span>
                  </Link>

                  <Link
                    to="/allergens"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1811]/90 hover:bg-[#142318] border border-white/10 hover:border-[#8BE28B]/40 text-xs font-semibold text-white transition-all shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#8BE28B] group-hover:scale-110 transition-transform">shield</span>
                    <span>Allergen Detection</span>
                  </Link>

                  <Link
                    to="/claims"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1811]/90 hover:bg-[#142318] border border-white/10 hover:border-[#8BE28B]/40 text-xs font-semibold text-white transition-all shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#8BE28B] group-hover:scale-110 transition-transform">verified</span>
                    <span>Claim Verification</span>
                  </Link>

                  <Link
                    to="/nutrition"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1811]/90 hover:bg-[#142318] border border-white/10 hover:border-[#8BE28B]/40 text-xs font-semibold text-white transition-all shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#8BE28B] group-hover:scale-110 transition-transform">bar_chart</span>
                    <span>Nutrition Insights</span>
                  </Link>

                  <Link
                    to="/compare"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1811]/90 hover:bg-[#142318] border border-white/10 hover:border-[#8BE28B]/40 text-xs font-semibold text-white transition-all shadow-sm group"
                  >
                    <span className="material-symbols-outlined text-[17px] text-[#8BE28B] group-hover:scale-110 transition-transform">compare_arrows</span>
                    <span>Compare Products</span>
                  </Link>
                </div>

                {/* Main Action CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/camera-scan"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#C8FF4D] text-black font-extrabold text-sm shadow-[0_0_24px_rgba(200,255,77,0.4)] hover:shadow-[0_0_32px_rgba(200,255,77,0.6)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    <span>Scan New Label</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>

                  <button
                    onClick={() => handleRunDemo(0)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#101A13]/90 hover:bg-[#16241b] text-white font-bold text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#C8FF4D]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>
              {/* Right Column: Visual Product Showcase & Analysis Results Glass Panel with 3D Orbital Planets */}
              <div className="lg:col-span-6 relative flex items-center justify-center py-6">
                {/* 3D Planetary Orbit Rings & Particle Streams */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                  {/* Outer Glowing Elliptical Orbit Track 1 */}
                  <div className="absolute w-[680px] h-[360px] rounded-[100%] border border-[#8BE28B]/30 rotate-[-18deg] shadow-[0_0_25px_rgba(139,226,139,0.15)] animate-spin-slow">
                    {/* Revolving Planet Node 1 */}
                    <div className="absolute top-0 left-1/4 w-3.5 h-3.5 rounded-full bg-[#C8FF4D] shadow-[0_0_15px_#C8FF4D]" />
                    {/* Revolving Satellite Node 2 */}
                    <div className="absolute bottom-4 right-1/4 w-2 h-2 rounded-full bg-[#8BE28B] shadow-[0_0_10px_#8BE28B]" />
                  </div>

                  {/* Secondary Tilted Elliptical Orbit Track 2 */}
                  <div className="absolute w-[620px] h-[310px] rounded-[100%] border border-[#C8FF4D]/25 rotate-[24deg] shadow-[0_0_20px_rgba(200,255,77,0.12)] animate-spin-reverse-slow">
                    {/* Revolving Planet Node 3 */}
                    <div className="absolute top-6 right-1/3 w-3 h-3 rounded-full bg-[#8BE28B] shadow-[0_0_12px_#8BE28B]" />
                    {/* Micro Photon Node */}
                    <div className="absolute bottom-8 left-1/3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                  </div>

                  {/* Floating Cosmic Atmosphere glow */}
                  <div className="absolute w-[500px] h-[500px] rounded-full bg-[#8BE28B]/12 blur-[140px]" />
                </div>

                <div className="relative z-10 w-full max-w-[580px] grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Realistic Green Framed Product Jar Card with Scanner Brackets */}
                  <div className="sm:col-span-5 relative rounded-2xl bg-[#09120B]/95 border-2 border-[#8BE28B]/60 p-4 shadow-[0_0_35px_rgba(139,226,139,0.25)] flex flex-col items-center justify-between text-center overflow-hidden backdrop-blur-xl group">
                    {/* Futuristic Corner Reticles */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#C8FF4D]" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#C8FF4D]" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#C8FF4D]" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#C8FF4D]" />

                    {/* Top status tag */}
                    <div className="w-full flex items-center justify-center mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142A1A] text-[#8BE28B] text-[11px] font-bold border border-[#8BE28B]/40 shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Scan Complete</span>
                      </span>
                    </div>

                    {/* Realistic Product Canister Photography Representation */}
                    <div className="relative w-36 h-48 rounded-xl bg-gradient-to-b from-[#16271a] via-[#0d1a10] to-[#071009] border border-[#8BE28B]/40 flex flex-col items-center justify-between p-3 my-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
                      {/* Canister Lid with Ribbing */}
                      <div className="w-20 h-5 rounded-t-lg bg-gradient-to-r from-[#203625] via-[#2f4f36] to-[#203625] border-b-2 border-[#8BE28B]/50 flex items-center justify-center shadow-md">
                        <div className="w-12 h-1 bg-white/20 rounded-full" />
                      </div>

                      {/* Canister Body Label */}
                      <div className="w-full flex-1 rounded-lg bg-[#0A140D]/95 border border-white/10 flex flex-col items-center justify-center p-2 text-center my-1 shadow-inner relative">
                        {/* Organic Leaf Emblem */}
                        <div className="w-5 h-5 rounded-full bg-[#8BE28B]/20 text-[#8BE28B] flex items-center justify-center mb-0.5">
                          <span className="material-symbols-outlined text-[13px]">eco</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-[#8BE28B] tracking-wider">Plant Based</span>
                        <span className="text-xs font-black text-white leading-tight mt-0.5 tracking-wide">ORGANIC<br />PROTEIN</span>
                        <div className="flex items-center gap-1 mt-1 text-[8px] font-mono text-[#A9B4AA]">
                          <span>24g PRO</span>
                          <span>•</span>
                          <span>500g</span>
                        </div>
                      </div>

                      {/* Bottom Certification Badges */}
                      <div className="w-full flex items-center justify-between text-[8px] font-label-code text-[#8BE28B] px-1">
                        <span>NON-GMO</span>
                        <span>GLUTEN-FREE</span>
                      </div>

                      {/* Holographic Laser Sweep Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C8FF4D]/15 to-transparent h-6 w-full animate-scan" />
                    </div>

                    {/* Live Spectral Status Bar */}
                    <div className="w-full flex items-center justify-between px-2 pt-1 text-[10px] text-[#8BE28B] font-label-code">
                      <span>Live Spectral OCR</span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#C8FF4D] animate-ping" />
                        <span className="text-[#C8FF4D] font-bold">LOCKED</span>
                      </span>
                    </div>
                  </div>

                  {/* Floating Glass Analysis Results Panel */}
                  <div className="sm:col-span-7 rounded-2xl bg-[#0C150E]/95 backdrop-blur-2xl border border-white/15 p-5 shadow-[0_0_35px_rgba(0,0,0,0.7)] flex flex-col gap-3.5">
                    {/* Header: Title + Verified Badge */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#8BE28B] text-[18px]">insights</span>
                        <h3 className="text-sm font-bold text-white">Analysis Results</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#142A1A] text-[#8BE28B] text-[11px] font-bold border border-[#8BE28B]/40 shadow-sm">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Results Item List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121E15] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#182a1d] text-[#8BE28B] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">biotech</span>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#A9B4AA] font-semibold uppercase">Ingredients</div>
                            <div className="text-xs font-bold text-white">Safe &amp; Natural</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-[#1A3320] text-[#8BE28B] flex items-center justify-center text-xs font-bold">✓</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121E15] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#182a1d] text-[#8BE28B] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">shield</span>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#A9B4AA] font-semibold uppercase">Allergens</div>
                            <div className="text-xs font-bold text-white">No Known Allergens</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-[#1A3320] text-[#8BE28B] flex items-center justify-center text-xs font-bold">✓</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121E15] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#182a1d] text-[#8BE28B] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#A9B4AA] font-semibold uppercase">Nutrition</div>
                            <div className="text-xs font-bold text-white">High Protein • 120 kcal</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-[#1A3320] text-[#8BE28B] flex items-center justify-center text-xs font-bold">✓</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121E15] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#182a1d] text-[#8BE28B] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                          </div>
                          <div>
                            <div className="text-[10px] text-[#A9B4AA] font-semibold uppercase">Claims</div>
                            <div className="text-xs font-bold text-white">Verified Clean</div>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-[#1A3320] text-[#8BE28B] flex items-center justify-center text-xs font-bold">✓</span>
                      </div>
                    </div>

                    {/* Overall Safety Bottom Block with 98% Gauge */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#142A1A] text-[#8BE28B] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#A9B4AA] uppercase font-semibold">Overall Safety</div>
                          <div className="text-sm font-extrabold text-[#8BE28B]">Excellent</div>
                        </div>
                      </div>

                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#142217"
                            strokeWidth="3.5"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#C8FF4D"
                            strokeWidth="3.5"
                            strokeDasharray="98, 100"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute font-bold text-xs text-white">98%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Ticker & Stats Bar matching Reference Image 1 */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Built with AI left label */}
              <div className="flex items-center gap-2 text-xs font-bold text-[#A9B4AA] font-label-code">
                <span className="text-[#C8FF4D] text-sm">☼</span>
                <span>BUILT WITH AI • TRUSTED BY MILLIONS</span>
              </div>

              {/* Center 3 Stats */}
              <div className="flex items-center gap-8 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#142318] text-[#8BE28B] flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-white">10K+</span>
                    <span className="text-[11px] text-[#A9B4AA]">Products Analyzed</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#142318] text-[#C8FF4D] flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-[18px]">track_changes</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-white">99.8%</span>
                    <span className="text-[11px] text-[#A9B4AA]">Accuracy Rate</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#142318] text-[#8BE28B] flex items-center justify-center border border-white/5">
                    <span className="material-symbols-outlined text-[18px]">eco</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-extrabold text-white">50+</span>
                    <span className="text-[11px] text-[#A9B4AA]">Food Categories</span>
                  </div>
                </div>
              </div>

              {/* Right: Signature Cursive Script */}
              <div className="font-['Caveat',cursive] text-2xl text-[#8BE28B] tracking-wide self-end md:self-auto">
                Better Food. Healthier Tomorrow.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THREE WAYS TO VERIFY */}
        <section className="relative w-full py-space-xl bg-[#091009]/70 border-t border-white/5">
          <div className="max-w-[1360px] mx-auto px-gutter w-full flex flex-col gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">
                    Input Channels
                  </span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                  Three Ways to Verify Your Food
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Whether you have packaging in hand, an image in your gallery, or custom nutrient values, NutriVerify produces a unified verification dossier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Camera Scan */}
              <Link
                to="/camera-scan"
                className="group flex flex-col justify-between rounded-2xl bg-[#101A13]/90 hover:bg-[#141F17] p-7 border border-white/10 hover:border-primary-container/40 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#141F17] text-primary-container flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[30px]">photo_camera</span>
                    </div>
                    <span className="font-label-code text-sm font-bold text-primary-container">
                      01
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-container transition-colors">
                    Camera Scan
                  </h3>
                  <p className="text-sm text-[#A9B4AA] leading-relaxed mb-6">
                    Analyze a food label directly through your device camera with real-time text detection.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-primary-container font-bold text-sm group-hover:gap-3 transition-all pt-3 border-t border-white/5">
                  <span>Launch Scanner</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </Link>

              {/* Card 2: Upload Label */}
              <Link
                to="/upload"
                className="group flex flex-col justify-between rounded-2xl bg-[#101A13]/90 hover:bg-[#141F17] p-7 border border-white/10 hover:border-[#8BE28B]/40 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#141F17] text-[#8BE28B] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[30px]">cloud_upload</span>
                    </div>
                    <span className="font-label-code text-sm font-bold text-[#8BE28B]">
                      02
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#8BE28B] transition-colors">
                    Upload Label
                  </h3>
                  <p className="text-sm text-[#A9B4AA] leading-relaxed mb-6">
                    Upload a packaging image for OCR-powered verification and multi-column parsing.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-[#8BE28B] font-bold text-sm group-hover:gap-3 transition-all pt-3 border-t border-white/5">
                  <span>Upload Label</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </Link>

              {/* Card 3: Manual Entry */}
              <Link
                to="/manual"
                className="group flex flex-col justify-between rounded-2xl bg-[#101A13]/90 hover:bg-[#141F17] p-7 border border-white/10 hover:border-[#FFB86B]/40 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#141F17] text-[#FFB86B] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[30px]">edit_note</span>
                    </div>
                    <span className="font-label-code text-sm font-bold text-[#FFB86B]">
                      03
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FFB86B] transition-colors">
                    Manual Entry
                  </h3>
                  <p className="text-sm text-[#A9B4AA] leading-relaxed mb-6">
                    Enter nutrition and ingredient information manually with live compliance checking.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-[#FFB86B] font-bold text-sm group-hover:gap-3 transition-all pt-3 border-t border-white/5">
                  <span>Enter Manually</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3: 5-STEP ALGORITHMIC PIPELINE & FLOWCHART */}
        <section className="relative w-full py-12 bg-[#080E09]/80 border-y border-white/5">
          <div className="max-w-[1360px] mx-auto px-6 w-full flex flex-col gap-8">
            <AnalysisFlowchart />
          </div>
        </section>

        {/* SECTION 4: INGREDIENT ORBIT & FORMULATION DECONSTRUCTION */}
        <section className="relative w-full py-12">
          <div className="max-w-[1360px] mx-auto px-6 w-full flex flex-col gap-8">
            <IngredientOrbit />
          </div>
        </section>

        {/* SECTION 5: 360 FOOD INTELLIGENCE MAP */}
        <section className="relative w-full py-12 bg-[#080E09]/80 border-y border-white/5">
          <div className="max-w-[1360px] mx-auto px-6 w-full flex flex-col gap-8">
            <FoodIntelligenceMap />
          </div>
        </section>

        {/* SECTION 6: INTERACTIVE TEST BENCH */}
        <section id="test-bench-section" className="relative w-full py-12">
          <div className="max-w-[1360px] mx-auto px-6 w-full flex flex-col gap-6">
            <div className="flex flex-col max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#C8FF4D] text-[18px]">biotech</span>
                <span className="font-mono text-xs uppercase text-[#C8FF4D] font-bold tracking-wider">
                  Interactive Test Bench
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl text-white font-black">
                Test a Real-World Deceptive Label
              </h2>
              <p className="text-xs text-[#A9B4AA] mt-1">
                Explore how NutriVerify dissects misleading wellness marketing. Toggle verification lenses below to view raw truth behind common beverage labels.
              </p>
            </div>

            <div className="rounded-3xl bg-[#09120B]/95 p-6 lg:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border border-[#8BE28B]/30 backdrop-blur-xl">
              {/* Left: Product Sample Info & Lens Buttons */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-[#0D1811] flex flex-col gap-3 border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#C8FF4D] font-bold uppercase tracking-wider">
                      FLAGGED PRODUCT SPECIMEN
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#331111] text-[#FF6B6B] text-[10px] font-bold border border-[#FF6B6B]/30">
                      RISK: MEDIUM ⚠
                    </span>
                  </div>

                  {/* High-Tech 3D Beverage Bottle Mockup */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-[#142618] to-[#080E09] border border-[#8BE28B]/30 flex items-center justify-center p-4 group">
                    <div className="absolute inset-0 bg-radial-gradient from-[#8BE28B]/10 to-transparent pointer-events-none" />

                    {/* Bottle Illustration */}
                    <div className="relative z-10 w-24 h-40 rounded-2xl bg-gradient-to-b from-[#1A3320] to-[#0D1A10] border-2 border-[#8BE28B]/60 flex flex-col items-center justify-between p-2 shadow-[0_0_20px_rgba(139,226,139,0.3)]">
                      <div className="w-8 h-3 rounded-t-sm bg-[#8BE28B]/40" />
                      <div className="w-full flex-1 rounded bg-[#061008] p-1.5 flex flex-col items-center justify-center text-center my-1">
                        <span className="text-[8px] font-bold text-[#8BE28B]">100% RAW</span>
                        <span className="text-[10px] font-black text-white leading-tight">GREEN<br />CLEANSE</span>
                        <span className="text-[7px] text-[#A9B4AA] mt-0.5">300 ml</span>
                      </div>
                      <span className="text-[7px] font-mono text-[#FFB86B]">DECEPTIVE LABEL</span>
                    </div>

                    {/* Scanning Laser Beam */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#C8FF4D] shadow-[0_0_12px_#C8FF4D] animate-pulse pointer-events-none" />

                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-[#A9B4AA]">
                      <span className="text-white font-bold">Green Cleanse Pro</span>
                      <span className="text-[#8BE28B]">Barcode: 890103049102</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#A9B4AA]">
                    <span>Serving Size: 300 ml</span>
                    <span className="text-[#8BE28B] font-bold">Audit Dossier #C-1</span>
                  </div>
                </div>

                {/* Lens Selection Buttons */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-[#A9B4AA] uppercase font-bold">
                    Select Diagnostic Lens:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setActiveLens('claims')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                        activeLens === 'claims'
                          ? 'bg-[#C8FF4D] text-black shadow-[0_0_15px_rgba(200,255,77,0.35)]'
                          : 'bg-[#0D1811] text-[#A9B4AA] hover:text-white border border-white/10 hover:border-[#8BE28B]/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                        <span>Deceptive Claim Flags</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>

                    <button
                      onClick={() => setActiveLens('nutrition')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                        activeLens === 'nutrition'
                          ? 'bg-[#C8FF4D] text-black shadow-[0_0_15px_rgba(200,255,77,0.35)]'
                          : 'bg-[#0D1811] text-[#A9B4AA] hover:text-white border border-white/10 hover:border-[#8BE28B]/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                        <span>Macro Breakdown &amp; Sugars</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>

                    <button
                      onClick={() => setActiveLens('additives')}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                        activeLens === 'additives'
                          ? 'bg-[#C8FF4D] text-black shadow-[0_0_15px_rgba(200,255,77,0.35)]'
                          : 'bg-[#0D1811] text-[#A9B4AA] hover:text-white border border-white/10 hover:border-[#8BE28B]/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">science</span>
                        <span>Chemical Additives &amp; Preservatives</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Dynamic Diagnostic Display */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {activeLens === 'claims' && (
                  <div className="flex flex-col gap-4 animate-fade-in-up">
                    <div className="p-5 rounded-2xl bg-[#0D1811] flex flex-col gap-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#FFB86B]">gavel</span>
                          <span>Front-of-Pack Claim Audit</span>
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#331111] text-[#FF6B6B] text-[10px] font-bold border border-[#FF6B6B]/30">
                          2 MISLEADING CLAIMS
                        </span>
                      </div>

                      <div className="space-y-2.5 mt-1">
                        <div className="p-3.5 rounded-xl bg-[#080E09] flex flex-col gap-1 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FF6B6B] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                              “No Added Sugar”
                            </span>
                            <span className="text-[10px] font-mono text-[#FF6B6B] uppercase font-bold">
                              Violates FSSAI §4.2
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                            Detected <strong className="text-white">26g of free sugars</strong> derived from reconstituted white grape juice concentrate, functionally acting as added sweetener.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#080E09] flex flex-col gap-1 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FFB86B] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">help</span>
                              “Active Cellular Detoxification”
                            </span>
                            <span className="text-[10px] font-mono text-[#FFB86B] uppercase font-bold">
                              Unsubstantiated Claim
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                            No approved clinical evidence registered under EFSA or FDA for detoxification via chlorophyll extract at the stated concentration (0.02%).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#102014] flex items-center gap-3 border border-[#8BE28B]/30">
                      <span className="material-symbols-outlined text-[#8BE28B] text-[24px]">eco</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">NutriVerify Recommended Clean Swap</h4>
                        <p className="text-[11px] text-[#A9B4AA]">
                          Consider <em>Verdant Cold-Pressed Celery &amp; Lemon</em> — true zero-concentrate with only 3.2g natural sugars per 300ml.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeLens === 'nutrition' && (
                  <div className="flex flex-col gap-4 animate-fade-in-up">
                    <div className="p-5 rounded-2xl bg-[#0D1811] flex flex-col gap-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#8BE28B]">pie_chart</span>
                          <span>Nutritional Composition (Per 300 ml)</span>
                        </h3>
                        <span className="text-xs font-mono text-[#C8FF4D] font-bold">
                          168 kcal Total
                        </span>
                      </div>

                      <div className="space-y-3 mt-1 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-white">
                            <span>Total Carbohydrates (32g)</span>
                            <span className="text-[#FFB86B] font-bold">High (64% DV)</span>
                          </div>
                          <div className="w-full bg-[#142318] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#FFB86B] h-2 rounded-full" style={{ width: '78%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-white">
                            <span>Protein (1.2g)</span>
                            <span className="text-[#A9B4AA]">Low (2.4% DV)</span>
                          </div>
                          <div className="w-full bg-[#142318] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#8BE28B] h-2 rounded-full" style={{ width: '12%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1 text-white">
                            <span>Dietary Fiber (0.8g)</span>
                            <span className="text-[#FF6B6B]">Stripped Pulp (Minimal)</span>
                          </div>
                          <div className="w-full bg-[#142318] rounded-full h-2 overflow-hidden">
                            <div className="bg-[#FF6B6B] h-2 rounded-full" style={{ width: '8%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0D1811] flex items-center justify-between border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#8BE28B] text-[22px]">bloodtype</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">Glycemic Impact Index</h4>
                          <p className="text-[11px] text-[#A9B4AA]">High rapid-spike potential (Estimated GI: 68)</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-[#142318] text-[#FFB86B] font-mono text-xs font-bold border border-white/10">
                        GI: 68 / 100
                      </span>
                    </div>
                  </div>
                )}

                {activeLens === 'additives' && (
                  <div className="flex flex-col gap-4 animate-fade-in-up">
                    <div className="p-5 rounded-2xl bg-[#0D1811] flex flex-col gap-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#8BE28B]">science</span>
                          <span>Additive &amp; Preservative Scan</span>
                        </h3>
                        <span className="text-[10px] font-mono text-[#FFB86B] font-bold">
                          3 CHEMICAL ADDITIVES DETECTED
                        </span>
                      </div>

                      <div className="divide-y divide-white/5 space-y-2 text-xs">
                        <div className="pt-2 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">Sodium Benzoate (INS 211)</div>
                            <div className="text-[11px] text-[#A9B4AA]">Preservative • High acidity stability</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-[#332210] text-[#FFB86B] text-[10px] font-mono font-bold">
                            Watchlist ⚠
                          </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">Potassium Sorbate (INS 202)</div>
                            <div className="text-[11px] text-[#A9B4AA]">Antimicrobial shelf-life extender</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-[#142618] text-[#8BE28B] text-[10px] font-mono font-bold">
                            Approved ✓
                          </span>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">Natural Identical Flavor (Spearmint)</div>
                            <div className="text-[11px] text-[#A9B4AA]">Synthetic botanical clone essence</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#A9B4AA] text-[10px] font-mono font-bold">
                            Neutral
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0D1811] flex items-center gap-3 border border-white/10">
                      <span className="material-symbols-outlined text-[#8BE28B] text-[22px]">verified_user</span>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">EU Regulatory Restriction Check</h4>
                        <p className="text-[11px] text-[#A9B4AA]">
                          All components conform within legal maximum thresholds under EU 1333/2008 Annex II.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer summary link */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D1811] border border-white/10 text-xs">
                  <span className="flex items-center gap-2 text-[#A9B4AA]">
                    <span className="w-2 h-2 rounded-full bg-[#8BE28B] animate-pulse" />
                    <span>Verified via NutriVerify Deterministic Engine &amp; OCR Pipeline</span>
                  </span>
                  <Link to="/camera-scan" className="text-[#C8FF4D] hover:underline font-bold flex items-center gap-1">
                    <span>Scan Your Own Product</span>
                    <span className="material-symbols-outlined text-[14px]">launch</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: SEVEN PILLARS OF FOOD INTELLIGENCE */}
        <section className="relative w-full py-12 bg-[#080E09]/80 border-t border-white/5">
          <div className="max-w-[1360px] mx-auto px-6 w-full flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#C8FF4D]" />
                  <span className="text-[10px] font-mono uppercase text-[#C8FF4D] font-bold tracking-wider">
                    Full Platform Capabilities
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl text-white font-black">
                  Seven Pillars of Food Intelligence
                </h2>
              </div>
              <p className="text-xs text-[#A9B4AA] max-w-md">
                Every analysis connects directly to deep specialized intelligence pages with zero dead ends.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* 1. Nutrition Intelligence */}
              <Link
                to="/nutrition"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-white/10 hover:border-[#8BE28B]/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#142618] text-[#8BE28B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">pie_chart</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Nutrition Intelligence</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Granular macro &amp; micro breakdowns, glycemic index estimates, and portion scaling calibrated against Daily Value standards.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#8BE28B] text-xs font-bold">
                  <span>Explore Macros</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              {/* 2. Ingredient Intelligence */}
              <Link
                to="/ingredients"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-white/10 hover:border-[#8BE28B]/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#142618] text-[#8BE28B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">biotech</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Ingredient Intelligence</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Cross-indexed against 45,000+ compounds with international E-numbers, chemical additive flags, and processing levels.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#8BE28B] text-xs font-bold">
                  <span>Audit Ingredients</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              {/* 3. Allergen Detection */}
              <Link
                to="/allergens"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-white/10 hover:border-[#FFB86B]/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#332210] text-[#FFB86B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Allergen Safety Matrix</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Automated screen against US Big 9, EU 14 mandatory declarations, cross-contact facility warnings, and custom profile matching.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#FFB86B] text-xs font-bold">
                  <span>Check Allergens</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              {/* 4. Claim Verification */}
              <Link
                to="/claims"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-white/10 hover:border-[#8BE28B]/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#142618] text-[#8BE28B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">gavel</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Claim Verification</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Statutory audit of front-of-pack claims against US FDA 21 CFR, EU 1924/2006, and FSSAI 2020 labelling regulations.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#8BE28B] text-xs font-bold">
                  <span>Verify Claims</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              {/* 5. Product Comparison */}
              <Link
                to="/compare"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-white/10 hover:border-[#C8FF4D]/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#142618] text-[#C8FF4D] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">compare_arrows</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Product Comparison</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Side-by-side head-to-head comparison engine with nutritional differentials, allergen contrasts, and score metrics.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#C8FF4D] text-xs font-bold">
                  <span>Compare Products</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              {/* 6. Audit Reports */}
              <Link
                to="/reports"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-white/10 hover:border-[#8BE28B]/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#142618] text-[#8BE28B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">description</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Audit Reports</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Comprehensive multi-format export system generating clean Print/PDF reports, JSON raw data, and RFC-4180 CSV tables.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#8BE28B] text-xs font-bold">
                  <span>Export Reports</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              {/* 7. NutriVerify AI Assistant */}
              <Link
                to="/chat"
                className="group p-5 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 hover:border-[#C8FF4D] transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between md:col-span-2 xl:col-span-2"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-[#142618] text-[#C8FF4D] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">NutriVerify AI Assistant</h3>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Context-aware conversational food intelligence grounded in active product specifications, answering inquiries on sugar thresholds, allergen safety, and botanical ingredient profiles.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[#C8FF4D] text-xs font-bold">
                  <span>Chat with NutriVerify AI</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 8: REGULATORY TRUST & GLOBAL BENCHMARKS */}
        <section className="relative w-full py-12">
          <div className="max-w-[1360px] mx-auto px-6 w-full flex flex-col gap-6">
            <div className="text-center max-w-xl mx-auto flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-[#C8FF4D] font-bold tracking-wider">
                Compliance Benchmarks
              </span>
              <h2 className="text-2xl lg:text-3xl text-white font-black">
                Benchmarked Against Global Authorities
              </h2>
              <p className="text-xs text-[#A9B4AA]">
                NutriVerify harmonizes nutrition guidelines across 3 primary global jurisdictions to ensure compliance across borders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white">FSSAI India</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] font-mono text-[10px] font-bold">
                      ACTIVE FEED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Automated validation against the Food Safety and Standards (Labelling and Display) Regulations 2020, tracking non-retail labeling standards and color codes.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 text-[10px] font-mono text-[#A9B4AA]">
                  Regulatory Sync: <strong className="text-[#8BE28B]">Version 2025.1</strong>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white">U.S. FDA 21 CFR</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] font-mono text-[10px] font-bold">
                      ACTIVE FEED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    Strict compliance validation for dual-column nutrition facts labeling, FALCPA allergen declarations, and modern “Healthy” implied nutrient claim rules.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 text-[10px] font-mono text-[#A9B4AA]">
                  Regulatory Sync: <strong className="text-[#8BE28B]">Title 21 Live DB</strong>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#09120B]/90 border border-[#8BE28B]/30 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white">EFSA European Union</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1A3320] text-[#8BE28B] font-mono text-[10px] font-bold">
                      ACTIVE FEED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9B4AA] leading-relaxed">
                    EU Regulation (EU) No 1169/2011 on provision of food info to consumers. Verification of 14 mandatory allergen bolding and botanical health claims register.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/5 text-[10px] font-mono text-[#A9B4AA]">
                  Regulatory Sync: <strong className="text-[#8BE28B]">Register 1924/2006</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: FINAL CALL TO ACTION */}
        <section className="relative w-full py-12">
          <div className="max-w-[1360px] mx-auto px-6 w-full">
            <div className="relative rounded-3xl bg-[#09120B]/95 p-8 lg:p-12 overflow-hidden shadow-2xl flex flex-col items-center text-center gap-6 border-2 border-[#8BE28B]/40 backdrop-blur-2xl">
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#C8FF4D]/15 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center gap-2 max-w-2xl">
                <span className="text-[10px] font-mono uppercase text-[#C8FF4D] font-extrabold tracking-widest">
                  START IN SECONDS • ZERO INSTALLATION REQUIRED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Take Control of What You Put on Your Plate.
                </h2>
                <p className="text-xs sm:text-sm text-[#A9B4AA] leading-relaxed">
                  Join thousands of health-conscious consumers, athletes, and nutritionists using NutriVerify's verified AI food scanner today.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/camera-scan"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#C8FF4D] text-black font-extrabold text-xs shadow-[0_0_24px_rgba(200,255,77,0.4)] transition-all duration-200 hover:brightness-110 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  <span>Launch Camera Scanner</span>
                </Link>

                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#102014] text-white font-bold text-xs shadow-md transition-all duration-200 hover:bg-[#162a1b] active:scale-95 border border-white/10"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#8BE28B]">upload_file</span>
                  <span>Upload Label Image</span>
                </Link>
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 text-[#A9B4AA] text-[11px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#8BE28B]">check_circle</span>
                  <span>No Credit Card Needed</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#8BE28B]">check_circle</span>
                  <span>Immediate Processing</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#8BE28B]">check_circle</span>
                  <span>GDPR &amp; HIPAA Compliant</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full bg-[#060A07] border-t border-white/10 mt-auto">
        <div className="w-full max-w-[1360px] mx-auto px-6 py-10 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C8FF4D] text-black flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                </div>
                <span className="text-base text-white font-bold">
                  Nutri<span className="text-[#C8FF4D]">Verify</span>
                </span>
              </div>
              <p className="text-xs text-[#A9B4AA] max-w-lg leading-relaxed">
                Scientific-grade food label verification, botanical additive cross-validation, and bio-nutritional spectral intelligence powered by edge OCR and deterministic engines.
              </p>
              <div className="flex items-center gap-2 text-[#A9B4AA] text-[10px] font-mono pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8BE28B] animate-pulse" />
                <span>API Gateway: Operational (latency: 14ms)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="text-[10px] font-mono text-[#8BE28B] uppercase tracking-wider font-bold">
                Verification Hub
              </span>
              <Link to="/camera-scan" className="text-[#A9B4AA] hover:text-white transition-colors">
                Camera OCR Scan
              </Link>
              <Link to="/upload" className="text-[#A9B4AA] hover:text-white transition-colors">
                Batch Label Upload
              </Link>
              <Link to="/manual" className="text-[#A9B4AA] hover:text-white transition-colors">
                Manual Spectral Input
              </Link>
              <Link to="/chat" className="text-[#A9B4AA] hover:text-[#C8FF4D] transition-colors">
                NutriVerify AI Assistant
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <span className="text-[10px] font-mono text-[#8BE28B] uppercase tracking-wider font-bold">
                Ecosystem &amp; Project
              </span>
              <Link to="/compare" className="text-[#A9B4AA] hover:text-white transition-colors">
                Nutritional Comparison
              </Link>
              <Link to="/reports" className="text-[#A9B4AA] hover:text-white transition-colors">
                Safety Audit Report
              </Link>
              <Link to="/about" className="text-[#A9B4AA] hover:text-white transition-colors">
                Methodology &amp; Standards
              </Link>
              <div className="pt-2 flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#A9B4AA] text-[9px] font-mono border border-white/5">
                  #FoodSafetyAI
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#A9B4AA] text-[9px] font-mono border border-white/5">
                  #BioTech2025
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-[#6F7A70]">
            <p className="text-center md:text-left">
              Disclaimer: NutriVerify provides AI-assisted food label verification; consult clinical professionals for medical diets and acute allergen treatment.
            </p>
            <span className="shrink-0 font-mono">
              © 2025 NutriVerify Platform. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* ── Interactive Demo Verification Modal ── */}
      {demoLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in-up">
          <div className="w-full max-w-lg bg-[#0D1610] border border-primary-container/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            {/* Top scanning pulse line */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent animate-pulse" />

            <div className="w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary-container/40 text-primary-container flex items-center justify-center mb-5 animate-spin-slow">
              <span className="material-symbols-outlined text-[36px]">biotech</span>
            </div>

            <span className="font-label-code text-xs text-primary-container font-bold uppercase tracking-widest mb-1">
              Live Verification Pipeline Active
            </span>
            <h3 className="text-xl font-extrabold text-white mb-2">
              Analyzing {demoProductName || 'Packaging Specimen'}
            </h3>
            <p className="text-xs text-[#A9B4AA] mb-6">
              Deconstructing label text, verifying statutory claims &amp; screening allergens...
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-[#142217] rounded-full h-2.5 overflow-hidden border border-white/10 mb-6">
              <div
                className="bg-primary-container h-full transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(200,255,77,0.8)]"
                style={{ width: `${Math.round(((demoStageIdx + 1) / DEMO_STAGES.length) * 100)}%` }}
              />
            </div>

            {/* Stage Step Indicator */}
            <div className="w-full space-y-2 text-left bg-[#142217] p-4 rounded-2xl border border-white/5">
              {DEMO_STAGES.map((stage, idx) => {
                const isDone = idx < demoStageIdx;
                const isCurrent = idx === demoStageIdx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs font-label-code transition-all ${
                      isCurrent ? 'text-primary-container font-bold translate-x-1' :
                      isDone ? 'text-white/80 opacity-70' :
                      'text-[#A9B4AA]/40'
                    }`}
                  >
                    <span>{stage}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isDone ? 'check_circle' : isCurrent ? 'hourglass_top' : 'circle'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
