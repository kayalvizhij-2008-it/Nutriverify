import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

/* ── Gold Particle Canvas ──────────────────────────────── */
function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.3 - 0.05,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.a})`;
        ctx.fill();
      });

      // Draw faint connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Score Ring ────────────────────────────────────────── */
function ScoreRing({ score, color, label }: { score: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 15.9155;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-nv-surface-variant" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset: offset }} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[family-name:var(--font-display)] text-[24px] font-bold text-nv-text leading-none">{score}</span>
          <span className="text-[9px] font-[family-name:var(--font-mono)] text-nv-text-dim">/ 100</span>
        </div>
      </div>
      <span className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

/* ── Main Landing ──────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-nv-surface">
      {/* ───────── NAVBAR ───────── */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-nv-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.5)]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-nv-primary-container/20 border border-nv-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px] text-nv-primary">verified</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-[17px] text-nv-text font-semibold tracking-tight">NutriVerify</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Product', href: '#how-it-works' },
              { label: 'How It Works', href: '#methodology' },
              { label: 'Analysis', href: '#engine' },
              { label: 'AI Assistant', href: '#ai' },
            ].map(item => (
              <a key={item.label} href={item.href} className="px-3 py-1.5 text-[13px] font-[family-name:var(--font-body)] text-nv-text-muted hover:text-nv-text rounded-lg hover:bg-nv-surface-container-high/60 transition-colors">{item.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-[13px] font-[family-name:var(--font-body)] text-nv-text-muted hover:text-nv-text transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-nv-primary-container/15 hover:bg-nv-primary-container/25 text-nv-primary text-[13px] font-medium rounded-lg border border-nv-primary/20 hover:border-nv-primary/40 transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───────── HERO ───────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <GoldParticles />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial from-nv-primary-container/8 via-transparent to-transparent rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-nv-tertiary/4 to-transparent blur-[100px] pointer-events-none" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Left — Text */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="inline-flex items-center gap-2 mb-6 self-start">
                  <span className="h-px w-8 bg-nv-primary/50"></span>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em]">AI-Assisted Label Verification</span>
                </div>

                <h1 className="font-[family-name:var(--font-display)] text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.03em] font-semibold mb-6">
                  <span className="text-nv-text">Beyond the</span><br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-nv-primary via-nv-primary-fixed to-nv-text">Printed Claim.</span>
                </h1>

                <p className="text-[16px] font-[family-name:var(--font-body)] text-nv-text-muted max-w-md leading-relaxed mb-8">
                  Understand what the label says. Verify what the evidence supports.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/register" className="group flex items-center gap-2.5 px-6 py-3 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container font-[family-name:var(--font-display)] text-[15px] font-semibold rounded-xl shadow-[0_0_24px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(242,202,80,0.35)] transition-all">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">biotech</span>
                    Analyze a Food Label
                  </Link>
                  <a href="#methodology" className="flex items-center gap-2 px-6 py-3 bg-nv-surface-container-high/60 hover:bg-nv-surface-container-high text-nv-text text-[15px] font-[family-name:var(--font-body)] rounded-xl border border-nv-outline-variant/30 hover:border-nv-outline-variant/50 transition-all">
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                    How It Works
                  </a>
                </div>
              </div>

              {/* Right — Floating Product Visualization */}
              <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
                <div className="absolute -inset-8 bg-gradient-to-br from-nv-primary/5 to-nv-tertiary/3 rounded-3xl blur-2xl pointer-events-none" />

                <div className="relative w-full max-w-[420px]">
                  {/* Floating demo analysis card */}
                  <div className="animate-subtle-float glass-card rounded-2xl p-6 gold-glow-md">
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-nv-primary animate-pulse"></span>
                          <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.15em]">Demo Analysis</span>
                        </div>
                        <h3 className="font-[family-name:var(--font-display)] text-[20px] font-semibold text-nv-text">Organic Almond Milk</h3>
                        <p className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim mt-0.5">PureNutri Labs · Batch #ALM-90214</p>
                      </div>
                      <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-tertiary bg-nv-tertiary/10 px-2 py-0.5 rounded">SAMPLE</span>
                    </div>

                    {/* Score rings */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-nv-surface/60 rounded-xl p-3 flex flex-col items-center">
                        <ScoreRing score={97} color="#f2ca50" label="Authenticity" />
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim mt-1">Trusted Verdict</span>
                      </div>
                      <div className="bg-nv-surface/60 rounded-xl p-3 flex flex-col items-center">
                        <ScoreRing score={94} color="#5de88e" label="Health Quality" />
                        <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim mt-1">Grade A Optimal</span>
                      </div>
                    </div>

                    {/* Claim results */}
                    <div className="space-y-2">
                      {[
                        { icon: 'check_circle', text: '"Zero Added Sugars"', badge: 'Confirmed', color: 'text-nv-tertiary' },
                        { icon: 'check_circle', text: '"Cold Pressed Almonds"', badge: 'Corroborated 98%', color: 'text-nv-tertiary' },
                        { icon: 'info', text: '"Calcium Rich (30% DV)"', badge: 'Synthetic Fortified', color: 'text-nv-primary' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-nv-surface-container/40 transition-colors">
                          <span className="flex items-center gap-2 text-[13px] text-nv-text">
                            <span className={`material-symbols-outlined text-[15px] ${item.color}`}>{item.icon}</span>
                            {item.text}
                          </span>
                          <span className={`text-[10px] font-[family-name:var(--font-mono)] ${item.color}`}>{item.badge}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-nv-outline-variant/20">
                      <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">fingerprint</span>
                        3 / 3 Claims Audited
                      </span>
                      <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-primary">DEMO MODE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── THE PROBLEM ───────── */}
        <section className="py-32 bg-nv-surface-container-lowest">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">The Problem</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] leading-[1.15] tracking-[-0.02em] font-semibold text-nv-text mb-4">
                The label tells a story.<br />
                <span className="text-nv-text-muted">The evidence tells the rest.</span>
              </h2>
              <p className="text-[16px] text-nv-text-muted leading-relaxed">
                Ultra-processed foods hide behind deceptive packaging, clever font sizing, and misleading marketing. NutriVerify reveals the gap between what packages promise and what the evidence shows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'gpp_bad', title: 'Misleading Claims', desc: '100% All-Natural Fruit Spread may contain high-fructose corn syrup as its primary ingredient — not fruit.', color: 'text-nv-error', bg: 'bg-nv-error/5 border-nv-error/15' },
                { icon: 'biotech', title: 'Hidden Complexity', desc: 'A short ingredient list can still contain 20+ chemical additives disguised under scientific nomenclature.', color: 'text-nv-primary', bg: 'bg-nv-primary/5 border-nv-primary/15' },
                { icon: 'psychology', title: 'Nutrition Confusion', desc: 'Serving size manipulation, obscure measurements, and misleading daily value percentages obscure the real impact.', color: 'text-nv-tertiary', bg: 'bg-nv-tertiary/5 border-nv-tertiary/15' },
              ].map((item) => (
                <div key={item.title} className={`rounded-xl p-6 border ${item.bg} hover:scale-[1.02] transition-transform`}>
                  <span className={`material-symbols-outlined text-[28px] ${item.color} block mb-4`}>{item.icon}</span>
                  <h3 className="font-[family-name:var(--font-display)] text-[18px] font-semibold text-nv-text mb-2">{item.title}</h3>
                  <p className="text-[14px] text-nv-text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── HOW IT WORKS ───────── */}
        <section className="py-32" id="methodology">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">Methodology</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text">How NutriVerify Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { num: '01', icon: 'qr_code_scanner', title: 'Capture', desc: 'Scan, photograph, or manually enter any food label.' },
                { num: '02', icon: 'biotech', title: 'Analyze', desc: 'AI engines parse ingredients, nutrition, and marketing claims.' },
                { num: '03', icon: 'fact_check', title: 'Verify', desc: 'Cross-reference claims against evidence and nutritional data.' },
                { num: '04', icon: 'speed', title: 'Score', desc: 'Generate authenticity and health quality scores from 0-100.' },
                { num: '05', icon: 'psychology', title: 'Explain', desc: 'Get clear, actionable insights and AI-powered explanations.' },
              ].map((step, i) => (
                <div key={step.num} className="relative text-center group">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-nv-surface-container-high border border-nv-outline-variant/20 flex items-center justify-center group-hover:border-nv-primary/30 group-hover:bg-nv-primary-container/10 transition-all">
                    <span className="material-symbols-outlined text-[24px] text-nv-text-muted group-hover:text-nv-primary transition-colors">{step.icon}</span>
                  </div>
                  <span className="text-[10px] font-[family-name:var(--font-mono)] text-nv-primary block mb-1">{step.num}</span>
                  <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text mb-1.5">{step.title}</h3>
                  <p className="text-[13px] text-nv-text-muted leading-relaxed">{step.desc}</p>
                  {i < 4 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+36px)] w-[calc(100%-72px)] h-px bg-gradient-to-r from-nv-outline-variant/30 to-nv-outline-variant/10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── ANALYSIS ENGINE ───────── */}
        <section className="py-32 bg-nv-surface-container-lowest" id="engine">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">Analysis Engine</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text mb-4">Six Verification Modules</h2>
              <p className="text-[15px] text-nv-text-muted max-w-xl mx-auto">Each product passes through six independent verification engines before receiving its final analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: 'science', title: 'Ingredient Intelligence', desc: 'Classifies every ingredient by risk level — natural, moderate, or high concern — with detailed reasoning.' },
                { icon: 'fact_check', title: 'Claim Verification', desc: 'Cross-references marketing claims against actual nutrition data and ingredient evidence.' },
                { icon: 'balance', title: 'Nutrition Consistency', desc: 'Validates calorie-macronutrient relationships using Atwater factors and detects label contradictions.' },
                { icon: 'verified_user', title: 'Authenticity Score', desc: 'Calculates a 0–100 trust index based on ingredient fidelity, claim alignment, and compliance.' },
                { icon: 'monitor_heart', title: 'Health Quality', desc: 'Rates nutritional density against harmful adulterants for a clear health classification.' },
                { icon: 'neurology', title: 'Recommendations', desc: 'Generates personalized dietary guidance based on analysis results and nutritional science.' },
              ].map((mod) => (
                <div key={mod.title} className="bg-nv-surface-container rounded-xl p-6 border border-nv-outline-variant/15 hover:border-nv-outline-variant/30 hover:bg-nv-surface-container-high/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-nv-primary-container/10 flex items-center justify-center mb-4 group-hover:bg-nv-primary-container/20 transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-nv-primary">{mod.icon}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text mb-2">{mod.title}</h3>
                  <p className="text-[14px] text-nv-text-muted leading-relaxed">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── INTERACTIVE DEMO PREVIEW ───────── */}
        <section className="py-32" id="demo">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">See It In Action</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text">Real Analysis, Real Results</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Product label mockup */}
              <div className="bg-nv-surface-container rounded-2xl p-8 border border-nv-outline-variant/15">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-nv-tertiary"></span>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-tertiary uppercase tracking-wider">Verified Product</span>
                </div>

                <h3 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-nv-text mb-1">Organic Almond Milk</h3>
                <p className="text-[13px] font-[family-name:var(--font-mono)] text-nv-text-dim mb-6">PureNutri Laboratories · 1L</p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-nv-outline-variant/15">
                    <span className="text-[13px] text-nv-text-muted">Calories</span>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-nv-text font-medium">60 kcal</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-nv-outline-variant/15">
                    <span className="text-[13px] text-nv-text-muted">Protein</span>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-nv-text font-medium">2g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-nv-outline-variant/15">
                    <span className="text-[13px] text-nv-text-muted">Sugar</span>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-nv-tertiary font-medium">0g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-nv-outline-variant/15">
                    <span className="text-[13px] text-nv-text-muted">Sodium</span>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-nv-text font-medium">120mg</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Organic', 'No Added Sugar', 'Dairy-Free'].map(c => (
                    <span key={c} className="text-[11px] font-[family-name:var(--font-mono)] text-nv-tertiary bg-nv-tertiary/10 px-2.5 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>

              {/* Analysis results */}
              <div className="space-y-5">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15 flex flex-col items-center">
                    <ScoreRing score={97} color="#f2ca50" label="Authenticity" />
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim mt-2">Trusted Verdict</span>
                  </div>
                  <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15 flex flex-col items-center">
                    <ScoreRing score={94} color="#5de88e" label="Health Quality" />
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim mt-2">Grade A</span>
                  </div>
                </div>

                {/* Claim verdicts */}
                <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15">
                  <h4 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Claim Verification</h4>
                  <div className="space-y-2.5">
                    {[
                      { claim: 'Zero Added Sugars', verdict: 'Confirmed', v: 'text-nv-tertiary' },
                      { claim: 'Cold Pressed Almonds', verdict: 'Corroborated (98%)', v: 'text-nv-tertiary' },
                      { claim: 'Calcium Rich (30% DV)', verdict: 'Synthetic Fortified', v: 'text-nv-primary' },
                    ].map(c => (
                      <div key={c.claim} className="flex items-center justify-between">
                        <span className="text-[13px] text-nv-text">{c.claim}</span>
                        <span className={`text-[11px] font-[family-name:var(--font-mono)] ${c.v}`}>{c.verdict}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-nv-surface-container rounded-2xl p-5 border border-nv-outline-variant/15">
                  <h4 className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim uppercase tracking-wider mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {[
                      'Good source of plant-based calcium',
                      'Low sodium — suitable for heart-healthy diets',
                      'Consider pairing with protein-rich foods',
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-nv-tertiary mt-0.5">check_circle</span>
                        <span className="text-[13px] text-nv-text-muted">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── AI ASSISTANT ───────── */}
        <section className="py-32 bg-nv-surface-container-lowest" id="ai">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">AI Assistant</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text mb-4">
                Ask the label.<br />Get the evidence.
              </h2>
              <p className="text-[15px] text-nv-text-muted max-w-lg mx-auto">
                NutriSaathi understands your actual analysis context — not generic nutrition FAQ. Ask anything about your analyzed products.
              </p>
            </div>

            {/* Chat mockup */}
            <div className="max-w-2xl mx-auto bg-nv-surface-container rounded-2xl border border-nv-outline-variant/20 overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-nv-outline-variant/15 bg-nv-surface-container-low/50">
                <div className="w-8 h-8 rounded-full bg-nv-primary-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-nv-primary">smart_toy</span>
                </div>
                <div>
                  <span className="text-[14px] font-[family-name:var(--font-display)] font-semibold text-nv-text block">NutriSaathi</span>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-tertiary">AI Nutrition Assistant</span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-nv-primary-container/15 border border-nv-primary/15 px-4 py-2.5 rounded-2xl rounded-br-md">
                    <p className="text-[14px] text-nv-text">Why did this product receive a 94 health score?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-nv-surface-container-high/60 px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <p className="text-[14px] text-nv-text leading-relaxed">
                      Based on <strong className="text-nv-primary">Organic Almond Milk</strong> — your Health Quality Score of <strong className="text-nv-tertiary">94/100</strong> reflects excellent nutritional density. Zero added sugar, low sodium (120mg), and natural ingredients contribute positively. The 6-point deduction comes from moderate protein (2g) and absence of dietary fiber.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-nv-primary-container/15 border border-nv-primary/15 px-4 py-2.5 rounded-2xl rounded-br-md">
                    <p className="text-[14px] text-nv-text">What ingredients should I watch out for?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-nv-surface-container-high/60 px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <p className="text-[14px] text-nv-text leading-relaxed">
                      This product has a clean ingredient list. All ingredients are classified as <strong className="text-nv-tertiary">Low Concern</strong>. The gellan gum stabilizer is synthetic but approved and used in very small quantities. Overall — excellent choice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="px-5 py-3 border-t border-nv-outline-variant/15 bg-nv-surface-container-low/30">
                <div className="flex items-center gap-3 bg-nv-surface rounded-xl px-4 py-2.5 border border-nv-outline-variant/20">
                  <span className="material-symbols-outlined text-[18px] text-nv-text-dim">chat</span>
                  <span className="text-[14px] text-nv-text-dim">Ask about your analysis...</span>
                  <span className="material-symbols-outlined text-[18px] text-nv-primary ml-auto">arrow_upward</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── THREE ANALYSIS METHODS ───────── */}
        <section className="py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">Input Methods</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text">Three ways to analyze</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: 'edit_note', title: 'Manual Entry', desc: 'Enter nutrition facts and ingredients by hand for precise analysis.', color: 'text-nv-primary' },
                { icon: 'cloud_upload', title: 'Upload Image', desc: 'Upload a photo of any food label for automated extraction.', color: 'text-nv-tertiary' },
                { icon: 'photo_camera', title: 'Live Camera', desc: 'Point your camera at a label for real-time scanning.', color: 'text-nv-secondary' },
              ].map((m) => (
                <Link key={m.title} to="/analyze" className="bg-nv-surface-container rounded-xl p-6 border border-nv-outline-variant/15 hover:border-nv-outline-variant/30 transition-all group">
                  <span className={`material-symbols-outlined text-[28px] ${m.color} block mb-4`}>{m.icon}</span>
                  <h3 className="font-[family-name:var(--font-display)] text-[17px] font-semibold text-nv-text mb-1.5">{m.title}</h3>
                  <p className="text-[13px] text-nv-text-muted leading-relaxed">{m.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── WHY IT MATTERS ───────── */}
        <section className="py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-3">Impact</span>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text">Why It Matters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'visibility', title: 'See Beyond Labels', desc: 'Understand what ingredients actually do inside your body.' },
                { icon: 'gpp_bad', title: 'Detect Deception', desc: 'Identify unsupported claims hidden in marketing language.' },
                { icon: 'science', title: 'Ingredient Clarity', desc: 'Know which ingredients to trust and which to question.' },
                { icon: 'compare_arrows', title: 'Smart Comparison', desc: 'Compare products with objective, evidence-based analysis.' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-nv-surface-container-high border border-nv-outline-variant/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px] text-nv-primary">{item.icon}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-[16px] font-semibold text-nv-text mb-1.5">{item.title}</h3>
                  <p className="text-[13px] text-nv-text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── TECHNOLOGY ───────── */}
        <section className="py-24 bg-nv-surface-container-lowest border-y border-nv-outline-variant/15">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-primary uppercase tracking-[0.2em] block mb-2">Technology</span>
                <h3 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-nv-text">Engineered for Precision</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {['Java', 'Spring Boot', 'React', 'REST APIs', 'JUnit 5'].map(tech => (
                  <span key={tech} className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-muted bg-nv-surface-container px-3 py-1.5 rounded-lg border border-nv-outline-variant/15">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────── TRUST / ACADEMIC ───────── */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="h-8 w-px bg-nv-outline-variant/30 mx-auto mb-6"></div>
            <p className="text-[14px] text-nv-text-muted leading-relaxed">
              Developed at <strong className="text-nv-text">Chennai Institute of Technology</strong> — Department of Computer Science & Health Informatics. Designed to bring algorithmic integrity to consumer food verification.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-[family-name:var(--font-mono)] text-nv-text-dim">
              <span>PROJECT CIT-NUTRIVERIFY</span>
              <span className="w-1 h-1 rounded-full bg-nv-outline-variant/40"></span>
              <span>2025</span>
            </div>
          </div>
        </section>

        {/* ───────── CTA ───────── */}
        <section className="py-32 bg-nv-surface-container-lowest relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,40px)] tracking-[-0.02em] font-semibold text-nv-text mb-4">
              See beyond the label.
            </h2>
            <p className="text-[16px] text-nv-text-muted max-w-lg mx-auto mb-8">
              Start verifying food labels with intelligent analysis. Make every bite informed.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2.5 px-8 py-4 bg-nv-primary-container hover:bg-nv-primary text-nv-on-primary-container font-[family-name:var(--font-display)] text-[16px] font-semibold rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(242,202,80,0.35)] transition-all">
              <span className="material-symbols-outlined text-[20px]">biotech</span>
              Analyze Your First Label
            </Link>
          </div>
        </section>

        {/* ───────── FOOTER ───────── */}
        <footer className="py-10 border-t border-nv-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-nv-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-nv-primary">verified</span>
              </div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] text-nv-text-dim">NutriVerify</span>
            </div>
            <div className="flex items-center gap-6 text-[12px] text-nv-text-dim">
              <a href="/privacy" className="hover:text-nv-primary transition-colors">Privacy</a>
              <a href="/help" className="hover:text-nv-primary transition-colors">Help</a>
              <a href="/accessibility" className="hover:text-nv-primary transition-colors">Accessibility</a>
            </div>
            <span className="text-[11px] font-[family-name:var(--font-mono)] text-nv-text-dim">© 2025 NutriVerify</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
