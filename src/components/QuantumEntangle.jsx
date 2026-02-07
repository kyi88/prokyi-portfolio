import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './QuantumEntangle.css';

const TAU = Math.PI * 2;

function QuantumEntangle() {
  const [open, setOpen] = useState(false);
  const [coherence, setCoherence] = useState(99.9);
  const [observed, setObserved] = useState(false);
  const [superposition, setSuperposition] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const coherenceRef = useRef(99.9);
  const observedRef = useRef(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const superTimerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-quantum-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-quantum-toggle', handler);
    };
  }, [open]);

  // Canvas animation
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    let t = 0;
    coherenceRef.current = 99.9;
    observedRef.current = false;
    setCoherence(99.9);
    setObserved(false);

    const draw = () => {
      t += 0.02;
      ctx.clearRect(0, 0, w, h);

      // Coherence decay
      if (!observedRef.current && coherenceRef.current > 10) {
        coherenceRef.current = Math.max(10, coherenceRef.current - 0.02);
        if (Math.floor(t * 50) % 50 === 0) setCoherence(+coherenceRef.current.toFixed(1));
      }

      const cx1 = w * 0.3;
      const cy1 = h * 0.5;
      const cx2 = w * 0.7;
      const cy2 = h * 0.5;

      const wobble = observedRef.current ? 0 : (100 - coherenceRef.current) * 0.15;
      const dx1 = Math.sin(t * 2.3) * (10 + wobble);
      const dy1 = Math.cos(t * 1.8) * (8 + wobble);
      const dx2 = -Math.sin(t * 2.3) * (10 + wobble); // mirrored
      const dy2 = -Math.cos(t * 1.8) * (8 + wobble);

      const x1 = cx1 + dx1;
      const y1 = cy1 + dy1;
      const x2 = cx2 + dx2;
      const y2 = cy2 + dy2;

      // Entanglement line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const cpx = w * 0.5;
      const cpy = h * 0.5 + Math.sin(t * 3) * 20;
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.strokeStyle = observedRef.current
        ? 'rgba(100,100,100,0.3)'
        : `rgba(179,136,255,${0.3 + Math.sin(t * 4) * 0.15})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Qubit A (cyan)
      const glow1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, 20);
      glow1.addColorStop(0, observedRef.current ? 'rgba(0,229,255,0.8)' : `rgba(0,229,255,${0.5 + Math.sin(t * 5) * 0.3})`);
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(x1 - 20, y1 - 20, 40, 40);
      ctx.beginPath();
      ctx.arc(x1, y1, 6, 0, TAU);
      ctx.fillStyle = '#0ff';
      ctx.fill();

      // Qubit B (magenta)
      const glow2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, 20);
      glow2.addColorStop(0, observedRef.current ? 'rgba(255,0,255,0.8)' : `rgba(255,0,255,${0.5 + Math.sin(t * 5 + Math.PI) * 0.3})`);
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(x2 - 20, y2 - 20, 40, 40);
      ctx.beginPath();
      ctx.arc(x2, y2, 6, 0, TAU);
      ctx.fillStyle = '#f0f';
      ctx.fill();

      // Labels
      ctx.font = '10px monospace';
      ctx.fillStyle = '#0ff';
      ctx.textAlign = 'center';
      ctx.fillText(observedRef.current ? '|0⟩' : '|ψ⟩', x1, y1 - 14);
      ctx.fillStyle = '#f0f';
      ctx.fillText(observedRef.current ? '|1⟩' : '|ψ⟩', x2, y2 - 14);

      // Floating bits
      if (!observedRef.current) {
        for (let i = 0; i < 5; i++) {
          const fx = w * 0.3 + Math.sin(t + i * 1.3) * 60;
          const fy = h * 0.2 + Math.cos(t * 0.8 + i * 0.9) * 40 + i * 20;
          ctx.fillStyle = `rgba(179,136,255,${0.2 + Math.sin(t + i) * 0.1})`;
          ctx.font = '8px monospace';
          ctx.fillText(Math.random() > 0.5 ? '0' : '1', fx, fy);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  const handleObserve = useCallback(() => {
    // Easter egg: rapid clicks → superposition (count ALL clicks, even after collapse)
    clickCountRef.current++;
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 1500);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setSuperposition(true);
      clearTimeout(superTimerRef.current);
      superTimerRef.current = setTimeout(() => {
        setSuperposition(false);
        // Reset observation
        observedRef.current = false;
        setObserved(false);
        coherenceRef.current = 99.9;
        setCoherence(99.9);
      }, 3000);
      return;
    }

    if (observedRef.current) return;
    observedRef.current = true;
    setObserved(true);
    setCoherence(0);
    coherenceRef.current = 0;
  }, []);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(clickTimerRef.current);
    clearTimeout(superTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open) {
      cancelAnimationFrame(rafRef.current);
      setObserved(false);
      setCoherence(99.9);
      setSuperposition(false);
      clickCountRef.current = 0;
    }
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      className="quantum-entangle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Quantum Entanglement Visualizer"
      aria-modal="true"
    >
      <div className="quantum-entangle__header">
        <span>⚛️ QUANTUM ENTANGLEMENT LAB</span>
        <button className="quantum-entangle__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <canvas
        ref={canvasRef}
        className="quantum-entangle__canvas"
        onClick={handleObserve}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleObserve(); } }}
        aria-label="Observe quantum state"
      />
      <div className="quantum-entangle__stats">
        <div className="quantum-entangle__stat">
          <div className="quantum-entangle__stat-label">Coherence</div>
          <div className="quantum-entangle__stat-value">{coherence.toFixed(1)}%</div>
        </div>
        <div className="quantum-entangle__stat">
          <div className="quantum-entangle__stat-label">State</div>
          <div className="quantum-entangle__stat-value">{observed ? 'COLLAPSED' : 'ENTANGLED'}</div>
        </div>
        <div className="quantum-entangle__stat">
          <div className="quantum-entangle__stat-label">Bell Pair</div>
          <div className="quantum-entangle__stat-value">{observed ? '|01⟩' : '|Φ+⟩'}</div>
        </div>
      </div>
      {superposition && (
        <div className="quantum-entangle__superposition">
          ✨ SUPERPOSITION ACHIEVED — Both states observed simultaneously ✨
        </div>
      )}
      <div className="quantum-entangle__status">
        {observed ? 'Wave function collapsed. Click rapidly (5x) to achieve superposition.' : 'Click the qubits to observe and collapse the wave function.'}
      </div>
    </motion.div>
  );
}

export default memo(QuantumEntangle);
