import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './NeuralLinkSync.css';

const CHANNELS = [
  { name: 'α', color: '#0ff' },
  { name: 'β', color: '#f0f' },
  { name: 'γ', color: '#0f0' },
  { name: 'δ', color: '#ff0' },
];

function NeuralLinkSync() {
  const [open, setOpen] = useState(false);
  const [syncRate, setSyncRate] = useState(87.3);
  const [berserk, setBerserk] = useState(false);
  const [status, setStatus] = useState('SYNC STABLE');
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const berserkTimer = useRef(null);

  // Toggle
  useEffect(() => {
    const handler = () => setOpen((p) => !p);
    window.addEventListener('prokyi-neurallink-toggle', handler);
    return () => window.removeEventListener('prokyi-neurallink-toggle', handler);
  }, []);

  // Sync rate drift
  useEffect(() => {
    if (!open || berserk) return;
    const iv = setInterval(() => {
      setSyncRate((prev) => {
        const drift = (Math.random() - 0.5) * 2.4;
        return Math.max(60, Math.min(99.9, prev + drift));
      });
    }, 1500);
    return () => clearInterval(iv);
  }, [open, berserk]);

  // Status label
  useEffect(() => {
    if (berserk) { setStatus('⚠ BERSERK MODE — PILOT OVERRIDE FAILED'); return; }
    const labels = ['SYNC STABLE', 'SIGNAL DRIFT', 'CALIBRATING...', 'OVERCLOCKED'];
    const iv = setInterval(() => {
      setStatus(labels[Math.floor(Math.random() * labels.length)]);
    }, 5000);
    return () => clearInterval(iv);
  }, [berserk]);

  // Wave animation
  useEffect(() => {
    if (!open) { cancelAnimationFrame(rafRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const draw = (time) => {
      const t = time * 0.001;
      ctx.clearRect(0, 0, w, h);
      CHANNELS.forEach((ch, ci) => {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.7;
        const yBase = (ci + 0.5) * (h / CHANNELS.length);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const freq = 0.03 + ci * 0.015;
          const amp = berserk ? 15 + Math.random() * 10 : 6 + Math.sin(t * 0.5) * 2;
          const noise = (Math.random() - 0.5) * (berserk ? 8 : 2);
          const y = yBase + Math.sin(x * freq + t * (2 + ci * 0.8)) * amp + noise;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, berserk]);

  // Berserk easter egg: 5 rapid clicks on sync rate
  const handleSyncClick = useCallback(() => {
    clickCount.current++;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1500);
    if (clickCount.current >= 5 && !berserk) {
      setBerserk(true);
      setSyncRate(400.0);
      clearTimeout(berserkTimer.current);
      berserkTimer.current = setTimeout(() => {
        setBerserk(false);
        setSyncRate(87.3);
      }, 5000);
    }
  }, [berserk]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(clickTimer.current);
      clearTimeout(berserkTimer.current);
    };
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      cancelAnimationFrame(rafRef.current);
      setBerserk(false);
      setSyncRate(87.3);
    }
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      className="neural-link"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Neural Link Sync Monitor"
    >
      <div className="neural-link__header">
        <span>🧠 NEURAL LINK v3.1</span>
        <button className="neural-link__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <canvas ref={canvasRef} className="neural-link__wave" />
      <div
        className={`neural-link__sync${berserk ? ' neural-link__sync--berserk' : ''}`}
        onClick={handleSyncClick}
        role="button"
        tabIndex={0}
        aria-label={`Sync rate ${syncRate.toFixed(1)}%`}
      >
        {syncRate.toFixed(1)}%
      </div>
      <div className={`neural-link__status${berserk ? ' neural-link__status--berserk' : ''}`}>
        {status}
      </div>
      <div className="neural-link__channels">
        {CHANNELS.map((ch) => (
          <div key={ch.name} className="neural-link__ch">
            <span className="neural-link__ch-dot" style={{ background: ch.color }} />
            {ch.name}波
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default memo(NeuralLinkSync);
