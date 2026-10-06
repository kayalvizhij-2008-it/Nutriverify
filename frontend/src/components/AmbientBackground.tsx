import FlowingBotanicalGradient from './FlowingBotanicalGradient';
import BioSnowfallField from './BioSnowfallField';
import ParticleSaturn04 from './ParticleSaturn04';
import AccretionDisc from './AccretionDisc';

export interface AmbientBackgroundProps {
  variant?: 'home' | 'analysis' | 'results' | 'dashboard' | 'nutrition' | 'allergen' | 'claims' | 'assistant' | 'auth';
  intensity?: 'low' | 'medium' | 'high';
  showParticles?: boolean;
  showOrbital?: boolean;
  showAccretion?: boolean;
  showGlow?: boolean;
  className?: string;
}

export default function AmbientBackground({
  variant = 'home',
  intensity = 'high',
  showParticles = true,
  showOrbital = true,
  showAccretion = true,
  showGlow = true,
  className = '',
}: AmbientBackgroundProps) {
  // Mobile / Reduced motion check
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Derive saturn theme based on variant
  const saturnThemeMap: Record<string, 'lime' | 'botanical' | 'amber' | 'neutral'> = {
    home: 'lime',
    analysis: 'lime',
    results: 'lime',
    dashboard: 'neutral',
    nutrition: 'botanical',
    allergen: 'amber',
    claims: 'amber',
    assistant: 'lime',
    auth: 'neutral',
  };

  const saturnTheme = saturnThemeMap[variant] || 'lime';
  const saturnDensity = intensity === 'low' ? 'low' : intensity === 'high' ? 'high' : 'medium';
  const particleCount = intensity === 'low' ? 70 : intensity === 'high' ? 140 : 100;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#071009] ${className}`}
      aria-hidden="true"
    >
      {/* ── Layer 1: Flowing Botanical Dark Green Gradient Atmosphere ── */}
      {showGlow && (
        <FlowingBotanicalGradient
          variant={variant}
          intensity={intensity}
        />
      )}

      {/* ── Layer 2: 3D Flowing Snowfall / AI Bio-Particle Field ── */}
      {showParticles && !isReducedMotion && (
        <BioSnowfallField
          density={particleCount}
          speed={variant === 'assistant' ? 1.2 : 0.9}
        />
      )}

      {/* ── Layer 3: WebGL Accretion Atmospheric Dust (Selective) ── */}
      {showAccretion && !isReducedMotion && (
        <div
          className="fixed inset-0 pointer-events-none z-[2] overflow-hidden transition-opacity duration-1000"
          style={{ opacity: intensity === 'high' ? 0.35 : 0.2 }}
        >
          <AccretionDisc
            baseColor={variant === 'allergen' || variant === 'claims' ? '#C2410C' : '#047857'}
            accentColor={variant === 'allergen' || variant === 'claims' ? '#F59E0B' : '#A3E635'}
            density={intensity === 'low' ? 25 : 45}
            dotSize={140}
            speed={20}
            distance={250}
            disc={{ arms: 6, core: 5, tilt: 35 }}
            jets={{ amount: 14, length: 240, spread: 28 }}
            field={{ blur: 0, scatter: 35 }}
          />
        </div>
      )}

      {/* ── Layer 4: Orbital / Planetary Ring Depth (Home, Results, Analyze) ── */}
      {showOrbital && !isReducedMotion && (variant === 'home' || variant === 'results' || variant === 'analysis') && (
        <ParticleSaturn04
          theme={saturnTheme}
          density={saturnDensity}
          opacity={0.4}
          className="fixed inset-0 pointer-events-none z-[3] transition-opacity duration-700"
        />
      )}
    </div>
  );
}
