import { useEffect, useRef, useState, memo } from 'react';
import './ParallaxStars.css';

/**
 * ParallaxStars — scrolling star field behind the Hero section.
 * Three layers moving at different scroll speeds for depth.
 */
const STAR_COUNT = [60, 35, 15]; // small, medium, large
const SPEEDS = [0.02, 0.05, 0.1];
const SIZES = [1, 1.8, 2.5];

const ParallaxStars = memo(function ParallaxStars() {
  const canvasRef = useRef(null);
  const [alive, setAlive] = useState(true);

  // ProcessMonitor kill/start
  useEffect(() => {
    const handler = (e) => setAlive(e.detail.alive);
    window.addEventListener('prokyi-process-parallaxstars', handler);
    return () => window.removeEventListener('prokyi-process-parallaxstars', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    // Generate random stars per layer
    const layers = STAR_COUNT.map((count, li) =>
      Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: 0.5 + Math.random() * 1.5,
        size: SIZES[li] * (0.7 + Math.random() * 0.6),
      }))
    );

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let accentCache = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe';
    const onTheme = () => { accentCache = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe'; };
    window.addEventListener('prokyi-theme-sync', onTheme);

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !raf) raf = requestAnimationFrame(draw);
    }, { threshold: 0 });
    observer.observe(canvas);

    let raf;
    const draw = (time) => {
      if (!isVisible) { raf = null; return; }
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.001;
      const scrollY = window.scrollY;

      for (let li = 0; li < layers.length; li++) {
        const speed = SPEEDS[li];
        const stars = layers[li];
        for (const s of stars) {
          const yOffset = (scrollY * speed) % h;
          const y = ((s.y * h - yOffset) % h + h) % h;
          const alpha = 0.3 + 0.4 * Math.sin(t * s.blinkSpeed + s.blink);

          ctx.beginPath();
          ctx.arc(s.x * w, y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = accentCache;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('prokyi-theme-sync', onTheme);
      observer.disconnect();
    };
  }, []);

  return alive ? <canvas ref={canvasRef} className="parallax-stars" aria-hidden="true" /> : null;
});

export default ParallaxStars;
