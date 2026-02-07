import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StomachGame.css';

const HAZARDS = ['🥛', '☕', '🥛', '☕'];
const SAFE    = ['🍎', '🍙', '💧', '🍵', '🍰'];
const DURATION = 15;

const rand = (a) => a[Math.floor(Math.random() * a.length)];

export default function StomachGame({ onClose }) {
  const [score, setScore]      = useState(0);
  const [hp, setHp]            = useState(3);
  const [time, setTime]        = useState(DURATION);
  const [items, setItems]      = useState([]);
  const [over, setOver]        = useState(false);
  const [combo, setCombo]      = useState(0);
  const [flashes, setFlashes]  = useState([]);
  const idRef = useRef(0);

  /* spawn */
  useEffect(() => {
    if (over) return;
    const iv = setInterval(() => {
      const haz = Math.random() < 0.4;
      setItems(p => [...p.slice(-14), {
        id: idRef.current++,
        emoji: haz ? rand(HAZARDS) : rand(SAFE),
        hazard: haz,
        x: 8 + Math.random() * 84,
        y: -8,
        speed: 1.2 + Math.random() * 2.2,
      }]);
    }, 550);
    return () => clearInterval(iv);
  }, [over]);

  /* fall */
  useEffect(() => {
    if (over) return;
    const iv = setInterval(() => {
      let hitList = [];
      setItems(p => {
        const next = [];
        for (const it of p) {
          const ny = it.y + it.speed;
          if (ny >= 100) {
            if (it.hazard) hitList.push(it.x);
          } else {
            next.push({ ...it, y: ny });
          }
        }
        return next;
      });
      // Side effects outside updater
      for (const x of hitList) {
        setHp(h => h - 1);
        addFlash(x, '💀');
      }
      hitList = [];
    }, 50);
    return () => clearInterval(iv);
  }, [over]);

  /* timer */
  useEffect(() => {
    if (over) return;
    const iv = setInterval(() => setTime(t => { if (t <= 1) { setOver(true); return 0; } return t - 1; }), 1000);
    return () => clearInterval(iv);
  }, [over]);

  useEffect(() => { if (hp <= 0) setOver(true); }, [hp]);

  const addFlash = (x, text) => {
    const fid = Date.now() + Math.random();
    setFlashes(p => [...p, { id: fid, x, text }]);
    setTimeout(() => setFlashes(p => p.filter(f => f.id !== fid)), 600);
  };

  const tap = useCallback((it) => {
    if (over) return;
    setItems(p => p.filter(i => i.id !== it.id));
    if (it.hazard) {
      const pts = 10 + combo * 5;
      setScore(s => s + pts);
      setCombo(c => c + 1);
      addFlash(it.x, `+${pts}`);
    } else {
      setScore(s => s + 5);
      setCombo(0);
      addFlash(it.x, '+5');
    }
  }, [over, combo]);

  return (
    <motion.div className="sg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      role="dialog" aria-modal="true" aria-label="腹痛回避ミニゲーム">
      <div className="sg">
        <div className="sg__head">
          <h3 className="sg__title">🚨 STOMACH DEFENSE 🚨</h3>
          <p className="sg__rules">🥛☕を<strong>タップして回避</strong>！安全な食べ物🍎を<strong>タップで摂取</strong>！</p>
        </div>

        <div className="sg__hud">
          <span>{'❤️'.repeat(Math.max(hp, 0))}</span>
          <span>⏱ {time}s</span>
          <span>🏆 {score}</span>
          {combo > 1 && <motion.span className="sg__combo" key={combo} initial={{ scale: 1.5 }} animate={{ scale: 1 }}>🔥x{combo}</motion.span>}
        </div>

        <div className="sg__field">
          {items.map(it => (
            <button key={it.id}
              className={`sg__item${it.hazard ? ' sg__item--haz' : ''}`}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              onClick={() => tap(it)}
            >{it.emoji}</button>
          ))}

          {/* score flashes */}
          <AnimatePresence>
            {flashes.map(f => (
              <motion.span key={f.id} className="sg__flash"
                style={{ left: `${f.x}%` }}
                initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              >{f.text}</motion.span>
            ))}
          </AnimatePresence>

          <div className="sg__danger" aria-hidden="true" />
        </div>

        {over && (
          <motion.div className="sg__result" initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h4>{hp <= 0 ? '💀 STOMACH DESTROYED' : '🎉 SURVIVED!'}</h4>
            <p className="sg__rscore">SCORE: {score}</p>
            <button className="sg__rbtn" onClick={onClose}>CLOSE</button>
          </motion.div>
        )}

        <button className="sg__x" onClick={onClose} aria-label="閉じる">✕</button>
      </div>
    </motion.div>
  );
}
