import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

/* ── Matrix trickle — falling chars in footer ── */
function MatrixRain() {
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    const chars = 'ぷろきぃ01アイウエオ>_{}[]#$%&';
    const cols = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i / 18) * 100}%`,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 4,
      char: chars[Math.floor(Math.random() * chars.length)],
    }));
    setColumns(cols);
  }, []);

  return (
    <div className="footer__matrix" aria-hidden="true">
      {columns.map(c => (
        <span key={c.id} className="footer__matrix-char"
          style={{ left: c.left, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }}>
          {c.char}
        </span>
      ))}
    </div>
  );
}

/* ── Live clock ── */
function LiveClock() {
  const [time, setTime] = useState(new Date().toLocaleString('ja-JP'));
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleString('ja-JP')), 1000);
    return () => clearInterval(iv);
  }, []);
  return <span>{time}</span>;
}

/* ── Page load time ── */
function LoadTime() {
  const [ms, setMs] = useState(null);
  useEffect(() => {
    const measure = () => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        setMs(Math.round(nav.loadEventEnd - nav.startTime));
      } else {
        setMs(Math.round(performance.now()));
      }
    };
    if (document.readyState === 'complete') {
      measure();
    } else {
      window.addEventListener('load', measure);
      return () => window.removeEventListener('load', measure);
    }
  }, []);
  if (ms === null) return null;
  return <span className="footer__load-time">LOAD: {ms}ms</span>;
}

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <MatrixRain />
      <div className="footer__inner">
        <motion.p
          className="footer__copy"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          &copy; 2026 ぷろきぃ (prokyi) &mdash; <span className="gradient-text">技術と創造の交差点</span>
        </motion.p>
        <motion.p
          className="footer__update"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Last updated: 2026/02/07 &mdash; <LiveClock />
        </motion.p>
        <motion.p
          className="footer__system"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          SYSTEM: React 19 + Vite 6 + Three.js + Framer Motion
        </motion.p>
        <motion.div
          className="footer__stats"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.25 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <span>COMPONENTS: 18</span>
          <span>CHUNKS: 8</span>
          <span>EASTER EGGS: 5</span>
          <span>LOOPS: 14</span>
          <LoadTime />
        </motion.div>
      </div>
    </motion.footer>
  );
}
