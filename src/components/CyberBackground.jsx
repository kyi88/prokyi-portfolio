import { useEffect, useRef, memo } from 'react';

/**
 * CyberBackground — Canvas 2D floating particles + grid.
 * Replaced Three.js (880 KB) with pure Canvas 2D (0 KB dependency).
 * Same visual: colorful additive-blended particles, mouse parallax, click ripple.
 */

const PALETTE = ['#4facfe', '#00f2fe', '#a855f7', '#f59e0b', '#ff2d87', '#22d3a7'];

function getCount() {
  if (typeof window === 'undefined') return 0;
  const w = window.innerWidth;
  if (w < 480) return 0;
  if (w < 768) return 80;
  if (w < 1024) return 140;
  return 260;
}

function CyberBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let cw, ch;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let count = getCount();
    if (count === 0) return;

    let particles = [];
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random(),
          y: Math.random(),
          z: 0.3 + Math.random() * 0.7,
          vx: (Math.random() - 0.5) * 0.0002,
          vy: (Math.random() - 0.5) * 0.0002,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    initParticles();

    let mx = 0.5, my = 0.5;
    const onMouseMove = (e) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let ripples = [];
    const onClickRipple = (e) => {
      ripples.push({ x: e.clientX * dpr, y: e.clientY * dpr, r: 0, alpha: 0.5 });
    };
    window.addEventListener('click', onClickRipple, { passive: true });

    const resize = () => {
      cw = canvas.width = Math.round(window.innerWidth * dpr);
      ch = canvas.height = Math.round(window.innerHeight * dpr);
      const newCount = getCount();
      if (newCount !== count) { count = newCount; initParticles(); }
    };
    resize();
    window.addEventListener('resize', resize);

    let visible = !document.hidden;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    let last = 0;
    const interval = 1000 / 30;

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!visible) return;
      if (now - last < interval) return;
      last = now;

      ctx.clearRect(0, 0, cw, ch);

      const parallaxX = (mx - 0.5) * 20;
      const parallaxY = (my - 0.5) * 14;
      const t = now * 0.001;

      // Particles (additive blend)
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx + Math.cos(t * 0.3 + p.phase) * 0.00008;
        p.y += p.vy + Math.sin(t * 0.2 + p.phase) * 0.00006;
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;

        const px = p.x * cw + parallaxX * p.z;
        const py = p.y * ch + parallaxY * p.z;
        const size = p.z * 2.5 * dpr;

        ctx.globalAlpha = 0.35 + p.z * 0.3;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 4 * dpr;
        rp.alpha -= 0.012;
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
        ctx.globalAlpha = rp.alpha;
        ctx.strokeStyle = '#4facfe';
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Subtle grid (bottom area)
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#1a3a5c';
      ctx.lineWidth = 1;
      const gridY = ch * 0.7;
      const gridLines = 12;
      const spacing = (ch - gridY) / gridLines;
      for (let g = 0; g <= gridLines; g++) {
        const gy = gridY + g * spacing;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke();
      }
      const vLines = 20;
      const vSpacing = cw / vLines;
      for (let v = 0; v <= vLines; v++) {
        ctx.beginPath(); ctx.moveTo(v * vSpacing, gridY); ctx.lineTo(v * vSpacing, ch); ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClickRipple);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (getCount() === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      <canvas
        ref={canvasRef}
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      />
    </div>
  );
}

export default memo(CyberBackground);
