import { useEffect, useRef } from 'react';

interface ParticleSaturn04Props {
  className?: string;
  theme?: 'lime' | 'botanical' | 'amber' | 'neutral';
  density?: 'low' | 'medium' | 'high';
  opacity?: number;
  interactive?: boolean;
}

interface SaturnParticle {
  angle: number;
  radius: number;
  radialOffset: number;
  speed: number;
  size: number;
  alpha: number;
  ringIndex: number;
  tilt: number;
  z: number;
}

/**
 * Originkit "Particle Saturn 4"
 * 3D Ambient Secondary Visual System for NutriVerify inner pages.
 * Features:
 * - Concentric elliptical orbital particle rings in 3D perspective
 * - Glowing central bio-planetary core
 * - Gentle rotational momentum and tilt
 * - Subtle cursor-tracking parallax
 * - Color-adaptive per route (Lime / Botanical / Amber / Neutral)
 * - Optimized for non-intrusive ambient background layering
 */
export default function ParticleSaturn04({
  className = '',
  theme = 'lime',
  density = 'medium',
  opacity = 0.45,
  interactive = true,
}: ParticleSaturn04Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const countMap = { low: 70, medium: 120, high: 180 };
    const totalParticles = countMap[density];

    const particles: SaturnParticle[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      // Normalized offset from center [-1, 1]
      mouse.targetX = (e.clientX / width - 0.5) * 2;
      mouse.targetY = (e.clientY / height - 0.5) * 2;
    };

    if (interactive) {
      window.addEventListener('mousemove', onMouseMove);
    }

    // Color theme configuration
    const themeColors = {
      lime: {
        core: 'rgba(200, 255, 77, ',
        ringA: 'rgba(200, 255, 77, ',
        ringB: 'rgba(139, 226, 139, ',
        accent: 'rgba(255, 255, 255, ',
      },
      botanical: {
        core: 'rgba(139, 226, 139, ',
        ringA: 'rgba(0, 180, 70, ',
        ringB: 'rgba(139, 226, 139, ',
        accent: 'rgba(200, 255, 77, ',
      },
      amber: {
        core: 'rgba(255, 184, 107, ',
        ringA: 'rgba(255, 184, 107, ',
        ringB: 'rgba(200, 255, 77, ',
        accent: 'rgba(255, 220, 188, ',
      },
      neutral: {
        core: 'rgba(220, 235, 225, ',
        ringA: 'rgba(200, 255, 77, ',
        ringB: 'rgba(196, 199, 202, ',
        accent: 'rgba(139, 226, 139, ',
      },
    };

    const colors = themeColors[theme];

    // Build Saturn rings
    const RINGS = [
      { minR: 120, maxR: 170, baseSpeed: 0.004, count: Math.floor(totalParticles * 0.3) },
      { minR: 185, maxR: 240, baseSpeed: 0.0028, count: Math.floor(totalParticles * 0.45) },
      { minR: 260, maxR: 320, baseSpeed: 0.0018, count: Math.floor(totalParticles * 0.25) },
    ];

    RINGS.forEach((ring, rIdx) => {
      for (let i = 0; i < ring.count; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: ring.minR + Math.random() * (ring.maxR - ring.minR),
          radialOffset: (Math.random() - 0.5) * 12,
          speed: ring.baseSpeed * (0.8 + Math.random() * 0.4),
          size: Math.random() * 1.6 + 0.6,
          alpha: Math.random() * 0.5 + 0.25,
          ringIndex: rIdx,
          tilt: -0.42, // Saturn ring inclination ~24 deg
          z: 0,
        });
      }
    });

    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.012;

      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // Center of Saturn is shifted slightly to top-right corner to complement left-side content
      const centerX = width * 0.72 + mouse.x * 30;
      const centerY = height * 0.38 + mouse.y * 20;

      // 1. Draw central glowing bio-sphere
      const coreR = Math.min(width, height) * 0.08;
      const corePulse = 1 + Math.sin(time * 1.5) * 0.05;

      const coreGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        coreR * 0.2,
        centerX,
        centerY,
        coreR * 3.2 * corePulse
      );
      coreGlow.addColorStop(0, `${colors.core}${(0.15 * opacity).toFixed(3)})`);
      coreGlow.addColorStop(0.4, `${colors.ringB}${(0.06 * opacity).toFixed(3)})`);
      coreGlow.addColorStop(1, 'rgba(11, 13, 12, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR * 3.2 * corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Subtle solid core outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = `${colors.core}${(0.08 * opacity).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = `${colors.accent}${(0.2 * opacity).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Draw Ring Guides (ultra faint orbital ellipses)
      const ringTilt = -0.42 + mouse.y * 0.08;
      const ringRotation = 0.25 + mouse.x * 0.05;

      [145, 212, 290].forEach(r => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(ringRotation);
        ctx.scale(1, Math.cos(ringTilt) * 0.38);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `${colors.ringA}${(0.04 * opacity).toFixed(3)})`;
        ctx.lineWidth = 0.75;
        ctx.setLineDash([4, 12]);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Update & render 3D Ring Particles
      particles.forEach(p => {
        p.angle += p.speed;

        // 3D coordinates on inclined orbital plane
        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);
        const curR = p.radius + p.radialOffset;

        // Base 2D on tilted ellipse
        const localX = cosA * curR;
        const localY = sinA * curR * Math.cos(ringTilt) * 0.38;
        p.z = sinA * curR; // depth: positive is behind planet, negative in front

        // Rotate by overall Saturn yaw
        const rotCos = Math.cos(ringRotation);
        const rotSin = Math.sin(ringRotation);
        const projX = centerX + (localX * rotCos - localY * rotSin);
        const projY = centerY + (localX * rotSin + localY * rotCos);

        // Depth perspective scale
        const depthFactor = 1 + (p.z / 400) * 0.3;
        const finalSize = Math.max(0.5, p.size * depthFactor);
        const isBack = p.z > 0;
        const finalAlpha = Math.min(
          1,
          p.alpha * opacity * (isBack ? 0.45 : 0.85) * depthFactor
        );

        // Particle rendering
        ctx.beginPath();
        ctx.arc(projX, projY, finalSize, 0, Math.PI * 2);

        if (p.ringIndex === 0) {
          ctx.fillStyle = `${colors.ringA}${finalAlpha.toFixed(3)})`;
        } else if (p.ringIndex === 1) {
          ctx.fillStyle = `${colors.ringB}${finalAlpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `${colors.accent}${finalAlpha.toFixed(3)})`;
        }
        ctx.fill();

        // Extra twinkle on select particles
        if (p.size > 1.4 && !isBack) {
          ctx.beginPath();
          ctx.arc(projX, projY, finalSize * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `${colors.core}${(finalAlpha * 0.25).toFixed(3)})`;
          ctx.fill();
        }
      });
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, [theme, density, opacity, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
