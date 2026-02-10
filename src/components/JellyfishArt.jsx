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
const POINTS_MOBILE = 15000;
const MAX_RES_DESKTOP = 1200;
const MAX_RES_MOBILE = 1200;
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

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw, ch, scale;

    // Pre-compute frame-invariant values (don't depend on t)
    const pointCount = basePoints;
    const yArr = new Float32Array(pointCount);
    const kArr = new Float32Array(pointCount);
    const eArr = new Float32Array(pointCount);
    const dArr = new Float32Array(pointCount);
    const modArr = new Uint8Array(pointCount);   // i % 2
    for (let i = 0; i < pointCount; i++) {
      const y = i / 99;
      const k = 8 * Math.cos(y);
      const e = y / 8 - 12;
      const mag = Math.sqrt(k * k + e * e);
      yArr[i] = y;
      kArr[i] = k;
      eArr[i] = e;
      dArr[i] = (mag * mag * mag) / 999 + 1;
      modArr[i] = i & 1;
    }

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
      drawFrame(ctx, cw, ch, scale, pointCount, Math.PI / 4, kArr, eArr, dArr, modArr);
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
      drawFrame(ctx, cw, ch, scale, pointCount, tRef.current, kArr, eArr, dArr, modArr);
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

function drawFrame(ctx, cw, ch, scale, pointCount, t, kArr, eArr, dArr, modArr) {
  ctx.clearRect(0, 0, cw, ch);

  const imageData = ctx.getImageData(0, 0, cw, ch);
  const data = imageData.data;
  const cx = cw / 2;
  const cy = ch / 2;
  const halfT = t / 2;
  const eighthT = t / 8;
  const fillBody = scale > 1.5;

  for (let i = pointCount; i--;) {
    const k = kArr[i];
    const e = eArr[i];
    const d = dArr[i];

    const q =
      79 -
      e * Math.sin(k) +
      (k / d) * (8 + 4 * Math.sin(d * d - t + Math.cos(e + halfT)));
    const c = d / 2 + (e / 99) * Math.sin(t + d) - eighthT + modArr[i] * 3;

    const sinC = Math.sin(c);
    const cosC = Math.cos(c);
    const px = (q * sinC * scale + cx) | 0;
    const py = ((q + 40) * cosC * scale + cy - 10 * scale) | 0;

    if (px < 0 || px >= cw || py < 0 || py >= ch) continue;

    const idx = (py * cw + px) << 2;
    data[idx]     = data[idx]     + 90 < 256 ? data[idx]     + 90 : 255;
    data[idx + 1] = data[idx + 1] + 180 < 256 ? data[idx + 1] + 180 : 255;
    data[idx + 2] = data[idx + 2] + 220 < 256 ? data[idx + 2] + 220 : 255;
    data[idx + 3] = 255;

    if (fillBody && d < 3) {
      const bx = px + 1;
      const by = py + 1;
      if (bx < cw && by < ch) {
        const idx2 = (by * cw + bx) << 2;
        data[idx2]     = data[idx2]     + 60 < 256 ? data[idx2]     + 60 : 255;
        data[idx2 + 1] = data[idx2 + 1] + 130 < 256 ? data[idx2 + 1] + 130 : 255;
        data[idx2 + 2] = data[idx2 + 2] + 170 < 256 ? data[idx2 + 2] + 170 : 255;
        data[idx2 + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export default memo(JellyfishArt);
