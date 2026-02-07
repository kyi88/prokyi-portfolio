import { useEffect, useRef, memo } from 'react';
import './CyberGrid.css';

function CyberGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
    const ctx = canvas.getContext('2d');
    let raf = null;
    let mx = -1000, my = -1000;
    const SPACING = 30;
    const RADIUS = 120;
    let needsDraw = true;

    // Cache accent color — update on resize (theme change triggers re-render)
    let accentColor = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe';

    // Declare draw & scheduleDraw BEFORE resize to avoid Temporal Dead Zone
    const draw = () => {
      raf = null;
      if (!needsDraw) return; // stop loop when idle
      needsDraw = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cols = Math.ceil(canvas.width / SPACING);
      const rows = Math.ceil(canvas.height / SPACING);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING;
          const y = r * SPACING;
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / RADIUS);

          if (proximity > 0) {
            const size = 1 + proximity * 2.5;
            const alpha = 0.03 + proximity * 0.3;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.globalAlpha = 0.03;
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const scheduleDraw = () => {
      needsDraw = true;
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      accentColor = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe';
      scheduleDraw();
    };
    resize();

    const onMove = (e) => { mx = e.clientX; my = e.clientY; scheduleDraw(); };
    const onLeave = () => { mx = -1000; my = -1000; scheduleDraw(); };

    // Listen for theme changes to update accent color
    const observer = new MutationObserver(() => {
      const newColor = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe';
      if (newColor !== accentColor) {
        accentColor = newColor;
        scheduleDraw();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    scheduleDraw();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cyber-grid" aria-hidden="true" />;
}

export default memo(CyberGrid);
