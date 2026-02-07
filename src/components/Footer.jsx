import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Footer.css';

/* ── Cyber Quote Rotator ── */
const QUOTES = [
  '「未来はすでにここにある — ただ均等に行き渡っていないだけだ」',
  '「我思う、ゆえに我あり... のプロセスID: 7742」',
  '「コードは詩であり、バグは散文である」',
  '「デバッグとは、まだ書いていないバグを見つける技術だ」',
  '「Hello World から全ては始まった」',
  '「夜のコーディングは、朝の技術的負債」',
  '「The Net is vast and infinite — 攻殻機動隊」',
  '「Stack Overflow がなかったら、我々は洞窟に住んでいただろう」',
  '「0と1の間に、無限の可能性がある」',
  '「電脳空間は第二の故郷」',
];
function QuoteRotator() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  useEffect(() => {
    const iv = setInterval(() => {
      setIdx(prev => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(iv);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        className="footer__quote"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.4, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      >
        {QUOTES[idx]}
      </motion.p>
    </AnimatePresence>
  );
}

/* ── Matrix trickle — falling chars in footer ── */
const MATRIX_CHARS = 'ぷろきぃ01アイウエオ>_{}[]#$%&';
function MatrixRain() {
  const [columns] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i / 18) * 100}%`,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 4,
      char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
    }))
  );

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
      setTimeout(measure, 0);
    } else {
      const onLoad = () => setTimeout(measure, 0);
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);
  if (ms === null) return null;
  return <span className="footer__load-time">LOAD: {ms}ms</span>;
}

/* ── Uptime counter ── */
function Uptime() {
  const [uptime, setUptime] = useState('0:00:00');
  useEffect(() => {
    const start = Date.now();
    const fmt = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setUptime(`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`);
    };
    const iv = setInterval(fmt, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span className="footer__uptime">UPTIME: {uptime}</span>;
}

/* ── Typewriter "Built with" message ── */
const BUILT_WITH_TEXT = 'Built with ❤️ by prokyi';
function BuiltWith() {
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(BUILT_WITH_TEXT.slice(0, i));
      if (i >= BUILT_WITH_TEXT.length) clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, [started]);

  return (
    <p ref={ref} className="footer__built-with" aria-label={BUILT_WITH_TEXT}>
      {typed}<span className="footer__cursor" aria-hidden="true">|</span>
    </p>
  );
}

export default function Footer() {
  const [eggClicks, setEggClicks] = useState(0);
  const eggTimerRef = useRef(null);
  const [showEgg, setShowEgg] = useState(false);

  // Cleanup egg timer on unmount
  useEffect(() => () => clearTimeout(eggTimerRef.current), []);

  const handleCopyClick = () => {
    setEggClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowEgg(true);
        clearTimeout(eggTimerRef.current);
        eggTimerRef.current = setTimeout(() => setShowEgg(false), 4000);
        return 0;
      }
      return next;
    });
  };

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Wave separator */}
      <svg className="footer__wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,40 C320,10 420,60 720,30 C1020,0 1200,50 1440,20 L1440,60 L0,60 Z" fill="rgba(79,172,254,0.04)" />
        <path d="M0,50 C360,20 540,55 900,35 C1100,25 1300,55 1440,30 L1440,60 L0,60 Z" fill="rgba(0,242,254,0.03)" />
      </svg>
      <MatrixRain />
      <div className="footer__inner">
        <QuoteRotator />
        <motion.p
          className="footer__copy"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          onClick={handleCopyClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopyClick(); } }}
          role="button"
          tabIndex={0}
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          &copy; 2026 ぷろきぃ (prokyi) &mdash; <span className="gradient-text">技術と創造の交差点</span>
        </motion.p>
        {showEgg && (
          <motion.p
            className="footer__egg"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            🎉 You found the secret! — The cake is a lie, but the code is real.
          </motion.p>
        )}
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
        <BuiltWith />
        <motion.div
          className="footer__stats"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.25 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <span>COMPONENTS: 50</span>
          <span>CHUNKS: 8</span>
          <span>EASTER EGGS: 16</span>
          <span>LOOPS: 86</span>
          <LoadTime />
          <Uptime />
        </motion.div>
        <span className="ghost-text" data-ghost-id="ghost-footer" aria-hidden="true">
          このサイトの最初のコミットは1行のHTML
        </span>
      </div>
    </motion.footer>
  );
}
