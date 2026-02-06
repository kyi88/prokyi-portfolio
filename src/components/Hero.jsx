import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import './Hero.css';

const BASE = import.meta.env.BASE_URL;

export default function Hero() {
  const [count, setCount] = useState(0);
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

  return (
    <section className="hero" ref={ref} id="top" aria-label="自己紹介">
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
            Hello, I'm
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
        </div>
      </motion.div>

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
