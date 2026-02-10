import { useEffect, useRef, memo } from 'react';
import './JellyfishArt.css';

/**
 * Jellyfish Art — generative point-cloud animation
 * Canvas dynamically sized to viewport for crisp full-screen rendering.
 *
 * Mobile optimizations:
 * - Moderate internal resolution (max 720px) for good quality
 * - 10000 points for detailed shape
 * - 24 fps for smooth animation without battery drain
 * - CSS smoothing hides any remaining pixelation
 */

const IS_MOBILE = typeof window !== 'undefined' &&
  (window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));

const POINTS_DESKTOP = 15000;
const POINTS_MOBILE = 10000;
const MAX_RES_DESKTOP = 1200;
const MAX_RES_MOBILE = 720;
const FPS_DESKTOP = 30;
const FPS_MOBILE = 24;

function JellyfishArt() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);
  const tabVisibleRef = useRef(!document.hidden);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const mobile = IS_MOBILE;
    const maxRes = mobile ? MAX_RES_MOBILE : MAX_RES_DESKTOP;
    const basePoints = mobile ? POINTS_MOBILE : POINTS_DESKTOP;
    const targetFps = mobile ? FPS_MOBILE : FPS_DESKTOP;

    const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    let cw, ch, scale;

    const resize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxDim = Math.max(vw, vh) * dpr;
      const ratio = maxDim > maxRes ? maxRes / maxDim : 1;
      cw = Math.round(vw * dpr * ratio);
      ch = Math.round(vh * dpr * ratio);
      canvas.width = cw;
      canvas.height = ch;
      scale = Math.min(cw, ch) / 400;
    };
    resize();
    window.addEventListener('resize', resize);

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawFrame(ctx, cw, ch, scale, basePoints, Math.PI / 4);
      return () => window.removeEventListener('resize', resize);
    }

    const onVisChange = () => { tabVisibleRef.current = !document.hidden; };
    document.addEventListener('visibilitychange', onVisChange);

    let last = 0;
    const interval = 1000 / targetFps;

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!tabVisibleRef.current) return;
      if (now - last < interval) return;
      last = now;
      tRef.current += Math.PI / 45;
      drawFrame(ctx, cw, ch, scale, basePoints, tRef.current);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisChange);
      // Clean up context reference
      try { 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (_) {}
    };
  }, []);

  return (
    <div className="jellyfish-art" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="jellyfish-art__canvas"
      />
    </div>
  );
}

function drawFrame(ctx, cw, ch, scale, basePoints, t) {
  ctx.clearRect(0, 0, cw, ch);

  const imageData = ctx.getImageData(0, 0, cw, ch);
  const data = imageData.data;
  const cx = cw / 2;
  const cy = ch / 2;

  const pointCount = Math.min(basePoints, Math.round(basePoints * (cw * ch) / (800 * 800)));

  for (let i = pointCount; i--;) {
    const y = i / 99;
    const k = 8 * Math.cos(y);
    const e = y / 8 - 12;
    const mag = Math.sqrt(k * k + e * e);
    const d = (mag * mag * mag) / 999 + 1;
    const q =
      79 -
      e * Math.sin(k) +
      (k / d) * (8 + 4 * Math.sin(d * d - t + Math.cos(e + t / 2)));
    const c = d / 2 + (e / 99) * Math.sin(t + d) - t / 8 + (i % 2) * 3;

    // Map formula coords (centered at 200,190 in 400x400) to canvas center
    const px = ((q * Math.sin(c) + 200 - 200) * scale + cx) | 0;
    const py = (((q + 40) * Math.cos(c) + 190 - 200) * scale + cy) | 0;

    if (px < 0 || px >= cw || py < 0 || py >= ch) continue;

    // 2x2 block for sub-pixel density
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        const bx = px + dx;
        const by = py + dy;
        if (bx >= cw || by >= ch) continue;
        const idx = (by * cw + bx) * 4;
        data[idx]     = Math.min(255, data[idx]     + 80);
        data[idx + 1] = Math.min(255, data[idx + 1] + 170);
        data[idx + 2] = Math.min(255, data[idx + 2] + 210);
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export default memo(JellyfishArt);
