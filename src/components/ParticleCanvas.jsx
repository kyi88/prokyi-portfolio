import { useEffect, useRef } from 'react';
import './ParticleCanvas.css';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles, raf;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const create = () => {
      const count = Math.min(Math.floor((w * h) / 22000), 60);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.18,
        dy: (Math.random() - 0.5) * 0.1 - 0.03,
        o: Math.random() * 0.35 + 0.08,
        p: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(79,172,254,${0.035 * (1 - d / 130)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.p += 0.006;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
        const a = p.o + Math.sin(p.p) * 0.12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,172,254,${Math.max(0, a)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    create();
    draw();

    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { resize(); create(); }, 250);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
