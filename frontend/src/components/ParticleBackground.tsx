import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; a: number;
  type: 'silver' | 'gold';
}

/**
 * Full-viewport canvas background with:
 * - Silver/gold particles drifting slowly
 * - Constellation lines between nearby particles
 * - Radial gold glow that follows mouse (desktop only)
 * - Respects prefers-reduced-motion
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return; // skip entirely for reduced-motion users

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let mouse = { x: -1000, y: -1000 };
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 55;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    // Create particles — mix of silver and gold
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isGold = i < 8; // ~15% gold
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.08,
        r: isGold ? Math.random() * 1.8 + 0.8 : Math.random() * 1.2 + 0.4,
        a: isGold ? Math.random() * 0.35 + 0.15 : Math.random() * 0.25 + 0.08,
        type: isGold ? 'gold' : 'silver',
      });
    }

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());

      // Update & draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w() + 10;
        if (p.x > w() + 10) p.x = -10;
        if (p.y < -10) p.y = h() + 10;
        if (p.y > h() + 10) p.y = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.type === 'gold') {
          ctx.fillStyle = `rgba(212, 175, 55, ${p.a})`;
        } else {
          ctx.fillStyle = `rgba(196, 199, 202, ${p.a})`; // silver
        }
        ctx.fill();
      });

      // Constellation lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = 0.03 * (1 - dist / 140);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(196, 199, 202, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Mouse-responsive gold glow
      if (mouse.x > 0) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.025)');
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w(), h());
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
