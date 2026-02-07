import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './BioChipImplant.css';

const NORMAL_SLOTS = [
  { name: 'OPTICS v2.1', status: 'active' },
  { name: 'REFLEX BOOST', status: 'active' },
  { name: 'AI/DS MODULE', status: 'active' },
  { name: 'MEMORY CACHE', status: 'idle' },
  { name: 'FIREWALL CORTEX', status: 'active' },
  { name: 'STEALTH CLOAK', status: 'error' },
];

const JAILBREAK_SLOTS = [
  { name: '☕ カフェイン', status: 'active', override: '99% CRITICAL' },
  { name: '🎮 ゲーミング衝動', status: 'error', override: 'UNCONTAINABLE' },
  { name: '🐧 Linux稼働時間', status: 'active', override: '420日' },
  { name: '🧠 ZEN大学適応率', status: 'active', override: 'MAX' },
  { name: '💤 睡眠', status: 'error', override: 'NOT FOUND' },
  { name: '🍣 寿司欲', status: 'idle', override: 'MODERATE' },
];

function BioChipImplant() {
  const [open, setOpen] = useState(false);
  const [vitals, setVitals] = useState({ temp: 36.5, sync: 94.2, bpm: 72, kernel: 99.8 });
  const [jailbreak, setJailbreak] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const jbTimer = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-biochip-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-biochip-toggle', handler);
    };
  }, [open]);

  // Vital sign drift
  useEffect(() => {
    if (!open || jailbreak) return;
    const iv = setInterval(() => {
      setVitals({
        temp: +(36.2 + Math.random() * 0.6).toFixed(1),
        sync: +(90 + Math.random() * 9.9).toFixed(1),
        bpm: Math.floor(65 + Math.random() * 20),
        kernel: +(98 + Math.random() * 1.9).toFixed(1),
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [open, jailbreak]);

  useEffect(() => () => { clearTimeout(clickTimer.current); clearTimeout(jbTimer.current); }, []);

  useEffect(() => {
    if (!open) { setJailbreak(false); clickCount.current = 0; }
  }, [open]);

  const handleJailbreakClick = useCallback(() => {
    clickCount.current++;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1500);
    if (clickCount.current >= 5 && !jailbreak) {
      setJailbreak(true);
      clearTimeout(jbTimer.current);
      jbTimer.current = setTimeout(() => setJailbreak(false), 4000);
    }
  }, [jailbreak]);

  if (!open) return null;

  const slots = jailbreak ? JAILBREAK_SLOTS : NORMAL_SLOTS;

  return (
    <motion.div className="biochip" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }} role="dialog" aria-label="BioChip Implant HUD" aria-modal="true">
      <div className="biochip__header">
        <span onClick={handleJailbreakClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleJailbreakClick(); } }} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
          🧬 BIOCHIP IMPLANT — HUD
        </span>
        <button className="biochip__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <div className="biochip__vitals">
        <div className="biochip__vital">
          <div className="biochip__vital-label">体温</div>
          <div className="biochip__vital-value">{jailbreak ? '🔥 42.0°C' : `${vitals.temp}°C`}</div>
        </div>
        <div className="biochip__vital">
          <div className="biochip__vital-label">同期率</div>
          <div className="biochip__vital-value">{jailbreak ? '∞%' : `${vitals.sync}%`}</div>
        </div>
        <div className="biochip__vital">
          <div className="biochip__vital-label">心拍</div>
          <div className="biochip__vital-value">{jailbreak ? '💀 999' : vitals.bpm} bpm</div>
        </div>
        <div className="biochip__vital">
          <div className="biochip__vital-label">Kernel安定度</div>
          <div className="biochip__vital-value">{jailbreak ? '0.0%' : `${vitals.kernel}%`}</div>
        </div>
      </div>
      <div className="biochip__slots">
        {slots.map((slot, i) => (
          <div key={i} className="biochip__slot">
            <span className="biochip__slot-name">{slot.name}</span>
            <span className={`biochip__slot-status biochip__slot-status--${slot.status}`}>
              {slot.override || slot.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      {jailbreak && <div className="biochip__jailbreak">⚡ JAILBREAK MODE — ROOT ACCESS GRANTED ⚡</div>}
    </motion.div>
  );
}

export default memo(BioChipImplant);
