import { useState, useEffect, useRef, useCallback, memo } from 'react';
import './SignalInterceptor.css';

const STATIONS = [
  { freq: 88.1, msg: 'ぷろきぃ — 千葉在住、ZEN大学1期生、AI/DSの道へ' },
  { freq: 91.7, msg: '寿司屋のキッチンで鍛えた忍耐力がコーディングに活きている' },
  { freq: 96.3, msg: '座標: 35.6095°N, 140.1233°E — 千葉市某所より発信中' },
  { freq: 100.5, msg: '推しスタック: Python + React + Docker + Linux' },
  { freq: 103.5, msg: 'AYN Thor MAX で通学中もゲーム三昧' },
];

const FREQ_MIN = 87.0;
const FREQ_MAX = 108.0;
const TOLERANCE = 0.4; // Hz range to lock onto station

/**
 * SignalInterceptor — FM-style radio tuner widget.
 * Tune to specific frequencies to intercept hidden messages.
 */
function SignalInterceptor() {
  const [open, setOpen] = useState(false);
  const [freq, setFreq] = useState(87.0);
  const [found, setFound] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('prokyi_signal_found') || '[]'));
    } catch { return new Set(); }
  });
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // Find matching station
  const station = STATIONS.find((s) => Math.abs(s.freq - freq) < TOLERANCE);

  // Track found in ref to avoid re-triggering useEffect
  const foundRef = useRef(found);
  foundRef.current = found;

  // Mark found
  useEffect(() => {
    if (station && !foundRef.current.has(station.freq)) {
      setFound((prev) => {
        const next = new Set(prev);
        next.add(station.freq);
        localStorage.setItem('prokyi_signal_found', JSON.stringify([...next]));
        return next;
      });
    }
  }, [station]);

  // Toggle: S key (with input guard) or terminal command
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    window.addEventListener('prokyi-signal-toggle', handler);
    return () => window.removeEventListener('prokyi-signal-toggle', handler);
  }, []);

  const freqRef = useRef(freq);
  freqRef.current = freq;
  const stationRef = useRef(station);
  stationRef.current = station;

  // Canvas wave animation
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
      ctx.lineWidth = 1;

      const isStation = !!stationRef.current;
      const noiseAmp = isStation ? 3 : 12;
      const signalAmp = isStation ? 15 : 0;

      ctx.strokeStyle = isStation ? '#00ff41' : '#444';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const noise = (Math.random() - 0.5) * noiseAmp;
        const signal = Math.sin(x * 0.05 + t * 3) * signalAmp;
        const y = h / 2 + signal + noise;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Frequency marker line
      const currentFreq = freqRef.current;
      const markerX = ((currentFreq - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * w;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(markerX, 0);
      ctx.lineTo(markerX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  const handleFreqChange = useCallback((e) => {
    setFreq(parseFloat(e.target.value));
  }, []);

  if (!open) return null;

  return (
    <div className="signal-interceptor" role="dialog" aria-label="Signal Interceptor" aria-modal="true">
      <div className="signal-interceptor__header">
        <span>📡 SIGNAL INTERCEPTOR</span>
        <button className="signal-interceptor__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <div className="signal-interceptor__wave-container">
        <canvas ref={canvasRef} />
      </div>
      <div className="signal-interceptor__controls">
        <span className="signal-interceptor__freq">{freq.toFixed(1)}</span>
        <input
          type="range"
          className="signal-interceptor__slider"
          min={FREQ_MIN}
          max={FREQ_MAX}
          step={0.1}
          value={freq}
          onChange={handleFreqChange}
          aria-label="周波数チューナー"
        />
        <span style={{ fontSize: '0.45rem', color: '#555' }}>MHz</span>
      </div>
      <div className={`signal-interceptor__message${station ? ' signal-interceptor__message--active' : ' signal-interceptor__message--noise'}`}>
        {station ? `▸ ${station.msg}` : '▸ ··· NO SIGNAL ··· static noise ···'}
      </div>
      <div className="signal-interceptor__found">
        STATIONS: {found.size}/{STATIONS.length}
      </div>
    </div>
  );
}

export default memo(SignalInterceptor);
