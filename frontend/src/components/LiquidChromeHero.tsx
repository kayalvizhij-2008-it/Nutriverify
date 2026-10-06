'use client';

import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

// ----------------------------------------------------------------------
// COMPONENT: LIQUID CHROME (Uilora liquid-chrome-hero)
// Procedural simulation of molten chrome alloys with velocity-based
// distortion. Interactive liquid metal surface with specular highlights.
// ----------------------------------------------------------------------

interface LiquidChromeProps extends React.HTMLAttributes<HTMLDivElement> {
    baseColor?: [number, number, number];
    speed?: number;
    amplitude?: number;
    interactive?: boolean;
}

export const LiquidChrome: React.FC<LiquidChromeProps> = ({
    baseColor = [0.5, 0.5, 0.5], // Default to neutral silver
    speed = 1.0,
    amplitude = 0.6,
    interactive = true,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // 1. Setup Renderer
        let renderer: Renderer;
        try {
            renderer = new Renderer({
                alpha: true,
                antialias: true,
                dpr: Math.min(window.devicePixelRatio, 2)
            });
        } catch {
            // No WebGL support — leave the container empty; the layered
            // gradient background behind this component remains visible.
            return;
        }
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 1);

        // 2. The Shader Logic
        const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

        const fragmentShader = `
      precision highp float;
      
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uDistort; // Driven by mouse velocity
      uniform vec3 uBaseColor;
      
      varying vec2 vUv;

      void main() {
          vec2 uv = vUv;
          
          // Fix aspect ratio
          uv.x *= uResolution.x / uResolution.y;

          // Mouse influence (Area of effect)
          vec2 mouse = uMouse;
          mouse.x *= uResolution.x / uResolution.y;
          float dist = distance(uv, mouse);
          float influence = smoothstep(0.6, 0.0, dist);

          // Liquid Distortion Loop
          // We warp the coordinates iteratively
          for (float i = 1.0; i < 8.0; i++){
              uv.x += 0.6 / i * cos(i * 2.5 * uv.y + uTime + (uDistort * influence * 2.0));
              uv.y += 0.6 / i * cos(i * 1.5 * uv.x + uTime + (uDistort * influence * 2.0));
          }

          // Calculate "Height" for the chrome reflection effect
          // This creates the shiny ridges
          vec2 grid = uv * 3.0;
          float height = sin(grid.x + grid.y);

          // Chrome Color Mapping
          // Mix between dark, base, and highlight based on height
          vec3 col = uBaseColor;
          
          // Darken the valleys
          col *= smoothstep(-1.0, 1.0, height);
          
          // Add sharp specular highlights (The "Chrome" shine)
          float specular = smoothstep(0.8, 1.0, sin(uv.x * 10.0 + uv.y * 10.0));
          col += vec3(1.0) * specular * 0.8;

          // Add subtle color aberration based on velocity
          col.r += uDistort * 0.02;
          col.b -= uDistort * 0.02;

          gl_FragColor = vec4(col, 1.0);
      }
    `;

        // 3. Program Setup
        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
                uBaseColor: { value: new Float32Array(baseColor) },
                uMouse: { value: new Vec2(0.5, 0.5) }, // Center default
                uDistort: { value: 0 }, // Turbulence
            }
        });

        const mesh = new Mesh(gl, { geometry, program });

        // 4. Resize Handling
        function resize() {
            if (!container) return;
            const { width, height } = container.getBoundingClientRect();
            renderer.setSize(width, height);
            program.uniforms.uResolution.value.set(width, height);
        }
        window.addEventListener('resize', resize);
        resize();

        // 5. Interaction Logic (Velocity Tracking)
        let lastMouse = { x: 0, y: 0 };
        let currentDistort = 0;

        function handleMouseMove(e: MouseEvent) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y for WebGL

            program.uniforms.uMouse.value.set(x, y);

            // Calculate Velocity
            const velX = Math.abs(x - lastMouse.x);
            const velY = Math.abs(y - lastMouse.y);
            const velocity = Math.sqrt(velX * velX + velY * velY);

            // Spike distortion based on speed (Sensitivity 50.0)
            currentDistort = Math.min(velocity * 50.0, 5.0);

            lastMouse = { x, y };
        }

        if (interactive) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        // 6. Render Loop
        let animationId: number;
        let time = 0;

        function update() {
            animationId = requestAnimationFrame(update);
            // Slow down the distortion over time (Damping)
            currentDistort += (0 - currentDistort) * 0.05;

            // Pass data to shader
            program.uniforms.uDistort.value = currentDistort;

            // Base auto-scroll
            time += 0.005 * speed;
            program.uniforms.uTime.value = time;

            renderer.render({ scene: mesh });
        }
        animationId = requestAnimationFrame(update);

        container.appendChild(gl.canvas);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            if (interactive) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (gl.canvas.parentElement) {
                gl.canvas.parentElement.removeChild(gl.canvas);
            }
        };
    }, [baseColor, speed, amplitude, interactive]);

    return <div ref={containerRef} className="w-full h-full" {...props} />;
};

export default function LiquidChromeHero() {
    return (
        <main className="relative w-full h-screen bg-black overflow-hidden font-sans">

            {/* BACKGROUND: The Liquid Chrome Component */}
            <div className="absolute inset-0 z-0">
                <LiquidChrome
                    baseColor={[0.5, 0.5, 0.55]} // Silver/Chrome Color
                    speed={0.8}
                    amplitude={0.9}
                    interactive={false}
                />
            </div>

            {/* OVERLAY: Gradient Fade to Black (Bottom) */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/40"></div>

            {/* UI CONTENT: Mix-Blend-Mode for Visibility */}
            <div className="relative z-20 flex flex-col justify-between w-full h-full p-8 md:p-16 mix-blend-difference text-white pointer-events-none">

                {/* Top Nav */}
                <div className="flex justify-between items-center pointer-events-auto">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-3 h-3 bg-white rounded-full group-hover:scale-125 transition-transform"></div>
                        <span className="font-bold tracking-tight uppercase text-sm">ChromeOS®</span>
                    </div>
                    <button className="border border-white/50 px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-white hover:text-black transition-all">
                        Menu
                    </button>
                </div>

                {/* Hero Text */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="inline-block px-4 py-1 border border-white/30 rounded-full mb-6 backdrop-blur-md">
                        <span className="text-xs uppercase tracking-widest font-mono">Interactive WebGL 2.0</span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-4 uppercase">
                        Liquid<br />Metal
                    </h1>
                    <p className="max-w-md text-sm md:text-base font-medium opacity-80 leading-relaxed">
                        Move your cursor to disturb the surface tension.
                        A procedural simulation of molten chrome alloys.
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-between items-end text-xs font-mono uppercase opacity-70">
                    <div className="flex flex-col gap-1">
                        <span>Lat: 34.0522</span>
                        <span>Lon: 118.2437</span>
                    </div>
                    <div className="pointer-events-auto flex gap-6">
                        <a href="#" className="hover:underline hover:text-white">GitHub</a>
                        <a href="#" className="hover:underline hover:text-white">Twitter</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
