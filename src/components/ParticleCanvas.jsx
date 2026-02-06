import { useEffect, useRef } from 'react';
import './ParticleCanvas.css';

const COLORS = [
  [79, 172, 254],   // blue
  [0, 242, 254],    // cyan
  [167, 139, 250],  // purple
  [255, 100, 200],  // pink
  [255, 107, 53],   // orange
  [34, 211, 167],   // green
  [251, 191, 36],   // gold
];

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles, shootingStars, raf;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = document.documentElement.scrollHeight;
    };

    const create = () => {
      const count = Math.min(Math.floor((w * h) / 14000), 120);
      particles = Array.from({ length: count }, () => {
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.4,
          dx: (Math.random() - 0.5) * 0.35,
          dy: (Math.random() - 0.5) * 0.2 - 0.05,
          o: Math.random() * 0.45 + 0.1,
          p: Math.random() * Math.PI * 2,
          c,
        };
      });
      shootingStars = [];
    };

    const spawnStar = () => {
      if (shootingStars.length >= 3) return;
      shootingStars.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.3,
        len: 80 + Math.random() * 120,
        speed: 6 + Math.random() * 6,
        angle: (Math.PI / 6) + Math.random() * (Math.PI / 6),
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            const ci = particles[i].c;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${ci[0]},${ci[1]},${ci[2]},${0.06 * (1 - d / 160)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // particles
      for (const p of particles) {
        // mouse repulsion
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 180) {
          const force = (180 - md) / 180 * 0.8;
          p.x += (mdx / md) * force;
          p.y += (mdy / md) * force;
        }

        p.x += p.dx;
        p.y += p.dy;
        p.p += 0.01;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
        const a = p.o + Math.sin(p.p) * 0.18;

        // glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${Math.max(0, a)})`);
        grad.addColorStop(1, `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${Math.max(0, a + 0.2)})`;
        ctx.fill();
      }

      // shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const ex = s.x + Math.cos(s.angle) * s.len;
        const ey = s.y + Math.sin(s.angle) * s.len;

        const sg = ctx.createLinearGradient(s.x, s.y, ex, ey);
        sg.addColorStop(0, `rgba(${s.c[0]},${s.c[1]},${s.c[2]},0)`);
        sg.addColorStop(0.6, `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life * 0.6})`);
        sg.addColorStop(1, `rgba(255,255,255,${s.life * 0.9})`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life -= s.decay;
        if (s.life <= 0) shootingStars.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    create();
    draw();

    // spawn shooting stars periodically
    const starInterval = setInterval(() => {
      if (Math.random() < 0.4) spawnStar();
    }, 2000);

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    };

    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { resize(); create(); }, 250);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(starInterval);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
