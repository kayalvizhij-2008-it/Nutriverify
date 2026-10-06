import React from 'react';

interface FlowingBotanicalGradientProps {
  variant?: 'home' | 'analysis' | 'results' | 'dashboard' | 'nutrition' | 'allergen' | 'claims' | 'assistant' | 'auth';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export default function FlowingBotanicalGradient({
  variant = 'home',
  intensity = 'high',
  className = '',
}: FlowingBotanicalGradientProps) {
  // Variant specific accent tints
  const isAllergenOrClaim = variant === 'allergen' || variant === 'claims';
  const isNutrition = variant === 'nutrition';

  const opacityMultiplier = intensity === 'low' ? 0.6 : intensity === 'high' ? 1.0 : 0.8;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[1] overflow-hidden ${className}`}
      style={{ opacity: opacityMultiplier }}
      aria-hidden="true"
    >
      {/* Base Deep Botanical Vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />

      {/* Layer 1: Large Emerald Floating Gradient Orb (Top Left to Center) */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full blur-[110px] pointer-events-none"
        style={{
          background: isAllergenOrClaim
            ? 'radial-gradient(circle, rgba(194, 65, 12, 0.28) 0%, rgba(67, 20, 7, 0.15) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(4, 120, 87, 0.38) 0%, rgba(5, 46, 22, 0.22) 50%, transparent 75%)',
          animation: 'botanical-drift-1 18s ease-in-out infinite',
        }}
      />

      {/* Layer 2: Deep Forest Green Floating Glow (Bottom Right to Center) */}
      <div
        className="absolute -bottom-[15%] -right-[10%] w-[70vw] h-[70vw] max-w-[950px] max-h-[950px] rounded-full blur-[130px] pointer-events-none"
        style={{
          background: isAllergenOrClaim
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.24) 0%, rgba(120, 53, 15, 0.18) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(16, 68, 38, 0.45) 0%, rgba(6, 32, 16, 0.25) 50%, transparent 75%)',
          animation: 'botanical-drift-2 22s ease-in-out infinite',
        }}
      />

      {/* Layer 3: Vibrant Electric Lime Bio-Pulse Accent (Center & Orbiting) */}
      <div
        className="absolute top-[30%] left-[25%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: isAllergenOrClaim
            ? 'radial-gradient(circle, rgba(255, 184, 107, 0.18) 0%, transparent 70%)'
            : isNutrition
            ? 'radial-gradient(circle, rgba(139, 226, 139, 0.25) 0%, rgba(200, 255, 77, 0.16) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(200, 255, 77, 0.22) 0%, rgba(139, 226, 139, 0.14) 45%, transparent 70%)',
          animation: 'botanical-drift-3 14s ease-in-out infinite',
        }}
      />

      {/* Layer 4: Organic Gradient Flow Mesh Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(200, 255, 77, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 226, 139, 0.08) 0%, transparent 40%)',
          backgroundSize: '150% 150%',
          animation: 'botanical-mesh 25s ease infinite alternate',
        }}
      />
    </div>
  );
}
