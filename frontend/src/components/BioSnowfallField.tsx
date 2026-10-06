import { useEffect, useRef } from 'react';

interface Particle3D {
  x: number;
  y: number;
  z: number; // 0.1 (far) to 1.0 (near)
  r: number;
  speedY: number;
  driftSpeed: number;
  driftAmp: number;
  phase: number;
  baseOpacity: number;
  color: string;
  glowColor: string;
}

interface BioSnowfallFieldProps {
  density?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function BioSnowfallField({
  density = 110,
  speed = 1.0,
  className = '',
  style,
}: BioSnowfallFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId: number;

    const COLORS = [
      { fill: 'rgba(200, 255, 77, ', glow: 'rgba(200, 255, 77, 0.4)' }, // #C8FF4D Electric Lime
      { fill: 'rgba(139, 226, 139, ', glow: 'rgba(139, 226, 139, 0.35)' }, // #8BE28B Botanical Green
      { fill: 'rgba(74, 222, 128, ', glow: 'rgba(74, 222, 128, 0.3)' }, // #4ADE80 Emerald
      { fill: 'rgba(244, 247, 242, ', glow: 'rgba(244, 247, 242, 0.2)' }, // Soft White Highlight
    ];

    const particles: Particle3D[] = [];
    const count = Math.min(Math.round((width * height) / 12000), density);

    for (let i = 0; i < count; i++) {
      const z = 0.15 + Math.random() * 0.85; // depth
      const colorScheme = COLORS[Math.floor(Math.random() * COLORS.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        r: (0.75 + Math.random() * 2.2) * z,
        speedY: (0.35 + Math.random() * 0.9) * z * speed,
        driftSpeed: 0.001 + Math.random() * 0.003,
        driftAmp: 25 + Math.random() * 45,
        phase: Math.random() * Math.PI * 2,
        baseOpacity: 0.2 + z * 0.65,
        color: colorScheme.fill,
        glowColor: colorScheme.glow,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseRef.current.targetX = (e.clientX - cx) / cx;
      mouseRef.current.targetY = (e.clientY - cy) / cy;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.016;
      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Sort particles roughly by z for depth rendering
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle downwards with organic horizontal sway
        p.y += p.speedY;
        const drift = Math.sin(time * p.driftSpeed * 100 + p.phase) * (p.driftAmp * p.z * 0.02);
        p.x += drift;

        // Wrap around bounds
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;

        // Calculate 3D Parallax offset based on depth (z)
        const parallaxX = mouseRef.current.x * 35 * p.z;
        const parallaxY = mouseRef.current.y * 25 * p.z;
        const drawX = p.x + parallaxX;
        const drawY = p.y + parallaxY;

        // Dynamic pulsing opacity
        const pulse = 0.85 + 0.15 * Math.sin(time * 2 + p.phase);
        const currentOpacity = p.baseOpacity * pulse;

        // Draw particle with soft halo
        ctx.beginPath();
        ctx.arc(drawX, drawY, Math.max(0.6, p.r), 0, Math.PI * 2);

        if (p.z > 0.5) {
          ctx.shadowBlur = 6 * p.z;
          ctx.shadowColor = p.glowColor;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `${p.color}${currentOpacity.toFixed(2)})`;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[2] w-full h-full ${className}`}
      style={{ opacity: 0.92, ...style }}
      aria-hidden="true"
    />
  );
}
