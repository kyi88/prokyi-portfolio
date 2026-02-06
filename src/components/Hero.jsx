import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

const BASE = import.meta.env.BASE_URL;

export default function Hero() {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    let c = parseInt(localStorage.getItem('prokyi_visits') || '0', 10);
    c++;
    localStorage.setItem('prokyi_visits', String(c));
    // animate
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

      <motion.div
        className="hero__inner"
        style={{ opacity }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        {/* Avatar */}
        <motion.div
          className="hero__avatar-wrap"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <div className="hero__avatar-ring" aria-hidden="true" />
          <div className="hero__avatar-ring hero__avatar-ring--2" aria-hidden="true" />
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Hello, I'm
          </motion.p>

          <motion.h1
            className="hero__name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            ぷろきぃ<span className="hero__name-en">prokyi</span>
          </motion.h1>

          <motion.p
            className="hero__bio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            AI / データサイエンス分野への学習意欲を持つ、
            <br className="hide-sp" />
            フットワークの軽いエンジニア志望
          </motion.p>

          <motion.div
            className="hero__tags"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            {['ZEN大学 在学中', '千葉県', '英検2級'].map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </motion.div>

          <motion.div
            className="hero__counter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
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
