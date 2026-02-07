import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import ProgressiveImage from './ProgressiveImage';
import './Hero.css';

const BASE = import.meta.env.BASE_URL;

/* ── Particle trail on mouse ── */
function ParticleTrail() {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const heroEl = canvas.parentElement;
    if (!heroEl) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;
      let alive = 0;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0) continue;
        ps[alive++] = p;
        ctx.globalAlpha = p.life * 0.7;
        ctx.fillStyle = `hsl(${p.hue}, 85%, 65%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ps.length = alive;
      ctx.globalAlpha = 1;
      if (particles.current.length > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        raf = null;
      }
    };
    const startDraw = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      for (let i = 0; i < 3; i++) {
        particles.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: 2 + Math.random() * 3,
          hue: 195 + Math.random() * 60,
        });
      }
      startDraw();
      if (particles.current.length > 80) particles.current.splice(0, particles.current.length - 80);
    };
    // Listen on parent hero element so pointer-events:none on canvas doesn't block
    heroEl.addEventListener('mousemove', onMove);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      heroEl.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__trail" aria-hidden="true" />;
}

/* ── XP bar ── */
const XP_CURRENT = 1450;
const XP_MAX = 5000;
const XP_LEVEL = 19;

const CYBER_QUOTES = [
  '"The future is already here — it\'s just not evenly distributed." — W. Gibson',
  '"Any sufficiently advanced technology is indistinguishable from magic." — A.C. Clarke',
  '"Stay hungry, stay foolish." — Steve Jobs',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"Code is poetry." — WordPress',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"The best way to predict the future is to invent it." — Alan Kay',
  '"Debugging is twice as hard as writing code." — Brian Kernighan',
];

const SUBTITLES = [
  '> Hello, I\'m_',
  '> 2000s Japan Vibes_',
  '> AI Enthusiast_',
  '> 二次元大好き_',
  '> Cyberpunk Dreamer_',
  '> Always Learning_',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return '> SYSTEM_BOOT — おはよう、ハッカー';
  if (h >= 12 && h < 17) return '> MISSION_ACTIVE — 探索中...';
  if (h >= 17 && h < 21) return '> SUNSET_MODE — 夕暮れプロトコル';
  return '> NIGHT_OWL_PROTOCOL — 同志よ';
}

export default function Hero() {
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState('');
  const [avatarClicks, setAvatarClicks] = useState(0);
  const [secretMsg, setSecretMsg] = useState(false);
  const [quote] = useState(() => CYBER_QUOTES[Math.floor(Math.random() * CYBER_QUOTES.length)]);
  const [timeGreeting, setTimeGreeting] = useState(getGreeting);
  const secretTimerRef = useRef(null);
  const ref = useRef(null);
  const avatarRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.9]);

  // 3D tilt for avatar
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 150, damping: 20 });
  const springY = useSpring(tiltY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    if (!avatarRef.current) return;
    const rect = avatarRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    tiltX.set((e.clientY - cy) / 8);
    tiltY.set(-(e.clientX - cx) / 8);
  };
  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // Increment visit counter outside effect to avoid StrictMode double-counting
  const visitTarget = useRef(null);
  if (visitTarget.current === null) {
    let c = parseInt(localStorage.getItem('prokyi_visits') || '0', 10);
    c++;
    localStorage.setItem('prokyi_visits', String(c));
    visitTarget.current = c;
  }

  useEffect(() => {
    const target = visitTarget.current;
    const dur = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Typing animation with rotating subtitles
  const subtitleIdx = useRef(0);

  useEffect(() => {
    let i = 0;
    let deleting = false;
    let currentText = SUBTITLES[0];
    let timeout;

    const tick = () => {
      if (!deleting) {
        setTyped(currentText.slice(0, i + 1));
        i++;
        if (i >= currentText.length) {
          // Pause before deleting
          timeout = setTimeout(() => { deleting = true; tick(); }, 2500);
          return;
        }
        timeout = setTimeout(tick, 80);
      } else {
        i--;
        setTyped(currentText.slice(0, i));
        if (i <= 2) {
          deleting = false;
          subtitleIdx.current = (subtitleIdx.current + 1) % SUBTITLES.length;
          currentText = SUBTITLES[subtitleIdx.current];
          timeout = setTimeout(tick, 300);
          return;
        }
        timeout = setTimeout(tick, 40);
      }
    };
    tick();
    return () => clearTimeout(timeout);
  }, []);

  // Secret: click avatar 7 times
  const handleAvatarClick = () => {
    setAvatarClicks(prev => {
      const next = prev + 1;
      if (next >= 7) {
        setSecretMsg(true);
        clearTimeout(secretTimerRef.current);
        secretTimerRef.current = setTimeout(() => setSecretMsg(false), 4000);
        return 0;
      }
      return next;
    });
  };

  // Cleanup secret timer
  useEffect(() => () => clearTimeout(secretTimerRef.current), []);

  // Update time greeting every minute
  useEffect(() => {
    const iv = setInterval(() => setTimeGreeting(getGreeting()), 60000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="hero" ref={ref} id="top" aria-label="自己紹介">
      {/* Particle trail canvas (desktop) */}
      <ParticleTrail />

      {/* Parallax ambient glow */}
      <motion.div className="hero__ambient" style={{ y }} aria-hidden="true" />

      {/* Floating orbs */}
      <div className="hero__orbs" aria-hidden="true">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
        <div className="hero__orb hero__orb--4" />
        <div className="hero__orb hero__orb--5" />
      </div>

      <motion.div
        className="hero__inner"
        style={{ opacity, scale }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        {/* Avatar with 3D tilt */}
        <motion.div
          className="hero__avatar-wrap"
          ref={avatarRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{
            rotateX: springX,
            rotateY: springY,
            transformPerspective: 600,
          }}
        >
          <div className="hero__avatar-ring" aria-hidden="true" />
          <div className="hero__avatar-ring hero__avatar-ring--2" aria-hidden="true" />
          <div className="hero__avatar-ring hero__avatar-ring--3" aria-hidden="true" />
          <ProgressiveImage
            src={`${BASE}avatar.jpg`}
            alt="prokyi のアバター"
            className="hero__avatar"
            width="200"
            height="200"
            loading="eager"
            fetchpriority="high"
            onClick={handleAvatarClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAvatarClick(); } }}
            role="button"
            tabIndex={0}
          />
        </motion.div>

        {/* Text */}
        <div className="hero__text">
          {/* Time-based greeting */}
          <motion.p
            className="hero__time-greeting"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            aria-hidden="true"
          >
            {timeGreeting}
          </motion.p>

          <motion.p
            className="hero__greeting"
            initial={{ opacity: 0, x: -40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {typed}<span className="hero__cursor">|</span>
          </motion.p>

          <motion.h1
            className="hero__name"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero__name-jp glitch" data-text="ぷろきぃ">ぷろきぃ</span>
            <span className="hero__name-en">prokyi</span>
          </motion.h1>

          <motion.p
            className="hero__bio"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.0, delay: 0.9 }}
          >
            2000年代の日本の空気が好きなAI好き。
            <br className="hide-sp" />
            サイバーパンクとかわいい二次元をこよなく愛する人間
          </motion.p>

          <motion.div
            className="hero__tags"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            {['ZEN大学 在学中', '千葉県', '英検2級'].map((t, i) => (
              <motion.span
                key={t}
                className="tag"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.12, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 2 }}
              >
                {t}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="hero__counter"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.5, type: 'spring' }}
          >
            <span className="hero__counter-label">visitors</span>
            <span className="hero__counter-num">{count.toLocaleString()}</span>
          </motion.div>

          {/* XP Progress Ring */}
          <motion.div
            className="hero__xp-ring-wrap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.7, type: 'spring' }}
          >
            <svg className="hero__xp-ring" viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--c-border)" strokeWidth="4" opacity="0.3" />
              <motion.circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="url(#xp-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - XP_CURRENT / XP_MAX) }}
                transition={{ duration: 2.0, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 40 40)"
              />
              <defs>
                <linearGradient id="xp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--c-accent)" />
                  <stop offset="100%" stopColor="var(--c-accent2)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="hero__xp-ring-text">
              <span className="hero__xp-ring-level">LV.{XP_LEVEL}</span>
              <span className="hero__xp-ring-val">{XP_CURRENT}/{XP_MAX}</span>
            </div>
          </motion.div>

          {/* Status LEDs */}
          <motion.div
            className="hero__leds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.9 }}
          >
            <span className="hero__led hero__led--green" title="SYS ONLINE" />
            <span className="hero__led hero__led--blue" title="NET OK" />
            <span className="hero__led hero__led--amber" title="LEARNING" />
          </motion.div>
        </div>
      </motion.div>

      {/* Secret message */}
      <AnimatePresence>
        {secretMsg && (
          <motion.div className="hero__secret"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
          >
            <span className="hero__secret-icon">🔓</span>
            <span>ACCESS GRANTED — Welcome to the inner layer, traveler.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random cyber quote */}
      <motion.p
        className="hero__quote"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2.5, duration: 1.5 }}
        aria-hidden="true"
      >
        {quote}
      </motion.p>

      {/* Scroll hint */}
      <motion.div
        className="hero__scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 2.0, duration: 1.5, y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } }}
        aria-hidden="true"
      >
        <span>scroll down</span>
        <svg width="20" height="28" viewBox="0 0 20 28">
          <rect x="6" y="2" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <motion.circle cx="10" cy="8" r="1.5" fill="currentColor"
            animate={{ cy: [7, 12, 7] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
          <path d="M10 18v6M6 22l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}
