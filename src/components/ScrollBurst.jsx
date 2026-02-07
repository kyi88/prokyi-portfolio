import { useEffect, useRef, memo } from 'react';

const PARTICLE_COUNT = 30;
const COLORS = ['#4facfe', '#00f2fe', '#a78bfa', '#ff2d87', '#fbbf24'];

function ScrollBurst() {
  const canvasRef = useRef(null);
  const firedRef = useRef(new Set());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let raf = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const burst = (y) => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1,
          decay: 0.015 + Math.random() * 0.015,
          size: 2 + Math.random() * 3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity
        p.life -= p.decay;
        if (p.life <= 0) continue;
        particles[alive++] = p;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      particles.length = alive;
      ctx.globalAlpha = 1;
      if (particles.length > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        raf = null;
      }
    };

    const sections = ['profile', 'career', 'goals', 'status', 'gadgets', 'links'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !firedRef.current.has(entry.target.id)) {
            firedRef.current.add(entry.target.id);
            const rect = entry.target.getBoundingClientRect();
            burst(rect.top);
            if (!raf) raf = requestAnimationFrame(draw);
          }
        });
      },
      { threshold: 0.2 }
    );

    // Delay to let DOM settle
    const t = setTimeout(() => {
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 1000);

    return () => {
      clearTimeout(t);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="scroll-burst"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 950,
        pointerEvents: 'none',
      }}
    />
  );
}

export default memo(ScrollBurst);
