import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import './Hero.css';

const BASE = import.meta.env.BASE_URL;

/* ── Particle trail on mouse ── */
function ParticleTrail() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      // Spawn particles
      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: mouse.current.x,
          y: mouse.current.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          size: Math.random() * 3 + 1,
          hue: 190 + Math.random() * 60,
        });
      }
      if (particles.current.length > 80) particles.current.splice(0, particles.current.length - 80);
    };
    canvas.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0) { ps.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.7;
        ctx.fillStyle = `hsl(${p.hue}, 85%, 65%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__trail" aria-hidden="true" />;
}

/* ── XP bar ── */
const XP_CURRENT = 1450;
const XP_MAX = 5000;
const XP_LEVEL = 19;

export default function Hero() {
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState('');
  const [avatarClicks, setAvatarClicks] = useState(0);
  const [secretMsg, setSecretMsg] = useState(false);
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

  useEffect(() => {
    let c = parseInt(localStorage.getItem('prokyi_visits') || '0', 10);
    c++;
    localStorage.setItem('prokyi_visits', String(c));
    const target = c;
    let cur = 0;
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      cur = Math.round(eased * target);
      setCount(cur);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Typing animation with rotating subtitles
  const subtitles = [
    '> Hello, I\'m_',
    '> AI Engineer Candidate_',
    '> Linux Enthusiast_',
    '> Cyberdeck Builder_',
    '> Always Learning_',
  ];
  const subtitleIdx = useRef(0);

  useEffect(() => {
    let i = 0;
    let deleting = false;
    let currentText = subtitles[0];
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
          subtitleIdx.current = (subtitleIdx.current + 1) % subtitles.length;
          currentText = subtitles[subtitleIdx.current];
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
    const next = avatarClicks + 1;
    setAvatarClicks(next);
    if (next >= 7) {
      setSecretMsg(true);
      setAvatarClicks(0);
      setTimeout(() => setSecretMsg(false), 4000);
    }
  };

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
          <img
            src={`${BASE}avatar.jpg`}
            alt="prokyi のアバター"
            className="hero__avatar"
            width="200"
            height="200"
            onClick={handleAvatarClick}
          />
        </motion.div>

        {/* Text */}
        <div className="hero__text">
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
            AI / データサイエンス分野への学習意欲を持つ、
            <br className="hide-sp" />
            フットワークの軽いエンジニア志望
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

          {/* XP Progress bar */}
          <motion.div
            className="hero__xp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.7 }}
          >
            <span className="hero__xp-label">LV.{XP_LEVEL}</span>
            <div className="hero__xp-bar">
              <motion.div
                className="hero__xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(XP_CURRENT / XP_MAX) * 100}%` }}
                transition={{ duration: 1.5, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="hero__xp-text">{XP_CURRENT}/{XP_MAX} XP</span>
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

      {/* Scroll hint */}
      <motion.div
        className="hero__scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 1 }}
        aria-hidden="true"
      >
        <span>scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24">
          <path d="M8 4v12M3 12l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}
