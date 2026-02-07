import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './HackingMinigame.css';

const TARGET = 'PROKYI539';
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
const CRACK_INTERVAL = 60; // ms per iteration

function HackingMinigame() {
  const [open, setOpen] = useState(false);
  const [cracking, setCracking] = useState(false);
  const [display, setDisplay] = useState('_________');
  const [solved, setSolved] = useState([]);
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    const handler = () => setOpen((p) => !p);
    window.addEventListener('prokyi-hackgame-toggle', handler);
    return () => window.removeEventListener('prokyi-hackgame-toggle', handler);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      setCracking(false);
      setDisplay('_________');
      setSolved([]);
      setLog([]);
      setDone(false);
    }
  }, [open]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const startCrack = useCallback(() => {
    if (cracking || done) return;
    setCracking(true);
    setLog([`[${new Date().toLocaleTimeString('ja-JP')}] Brute force started...`]);
    const solvedArr = Array(TARGET.length).fill(false);
    let iterations = 0;

    timerRef.current = setInterval(() => {
      iterations++;
      // Each iteration, randomly solve one unsolved char (probability ~5%)
      const unsolved = solvedArr.map((s, i) => s ? -1 : i).filter((i) => i >= 0);
      if (unsolved.length === 0) {
        clearInterval(timerRef.current);
        setCracking(false);
        setDone(true);
        setDisplay(TARGET);
        setLog((prev) => [...prev, `[OK] Password cracked: ${TARGET}`, `[OK] Total iterations: ${iterations}`]);
        window.dispatchEvent(new CustomEvent('prokyi-achievement', { detail: 'MASTER HACKER' }));
        return;
      }

      // Occasionally solve a char
      if (Math.random() < 0.05 || iterations > 100) {
        const idx = unsolved[Math.floor(Math.random() * unsolved.length)];
        solvedArr[idx] = true;
        setSolved([...solvedArr]);
        setLog((prev) => [...prev, `[HIT] Position ${idx}: '${TARGET[idx]}' found (${iterations} tries)`]);
      }

      // Display: solved chars show real, unsolved show random
      const disp = solvedArr.map((s, i) =>
        s ? TARGET[i] : CHARSET[Math.floor(Math.random() * CHARSET.length)]
      ).join('');
      setDisplay(disp);
    }, CRACK_INTERVAL);
  }, [cracking, done]);

  if (!open) return null;

  const progress = solved.filter(Boolean).length / TARGET.length * 100;

  return (
    <motion.div className="hacking-game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }} role="dialog" aria-label="Hacking Minigame">
      <div className="hacking-game__header">
        <span>🔓 PASSWORD CRACKER v1.0</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {!cracking && !done && (
            <button className="hacking-game__btn" onClick={startCrack}>▶ CRACK</button>
          )}
          <button className="hacking-game__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>
      <div className="hacking-game__display">{display}</div>
      <div className="hacking-game__progress">
        <div className="hacking-game__progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="hacking-game__log" ref={logRef}>
        {log.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <div className={`hacking-game__status${done ? ' hacking-game__status--success' : ''}`}>
        {done ? '✅ ACCESS GRANTED — Welcome, prokyi.' : cracking ? `Cracking... ${solved.filter(Boolean).length}/${TARGET.length}` : 'Press ▶ CRACK to begin brute force'}
      </div>
    </motion.div>
  );
}

export default memo(HackingMinigame);
