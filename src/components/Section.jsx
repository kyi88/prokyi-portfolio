import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import './Section.css';

/** Scramble a 2-digit number before settling */
function useScrambleNum(target, active) {
  const [display, setDisplay] = useState(target);
  useEffect(() => {
    if (!active) return;
    const chars = '0123456789ABCDEF';
    let frame = 0;
    const total = 10;
    const iv = setInterval(() => {
      if (frame >= total) {
        setDisplay(target);
        clearInterval(iv);
        return;
      }
      const a = chars[Math.floor(Math.random() * chars.length)];
      const b = chars[Math.floor(Math.random() * chars.length)];
      setDisplay(a + b);
      frame++;
    }, 50);
    return () => clearInterval(iv);
  }, [active, target]);
  return display;
}

export default function Section({ id, num, title, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const scrambled = useScrambleNum(num, inView);
  const [showBanner, setShowBanner] = useState(false);

  /* Section scroll progress */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], ['0%', '20%', '90%', '100%']);

  /* Mouse proximity glow tracking */
  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
  }, []);

  useEffect(() => {
    if (inView) {
      setShowBanner(true);
      const t = setTimeout(() => setShowBanner(false), 1800);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <motion.section
      id={id}
      ref={ref}
      className="card section"
      initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
      style={{ transformPerspective: 1200 }}
      onMouseMove={handleMouseMove}
    >
      {/* Mouse proximity glow */}
      <span className="card__glow" aria-hidden="true" />
      {/* Section read progress */}
      <motion.div className="card__read-progress" style={{ width: progressWidth }} aria-hidden="true" />
      {/* Connection banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            className="card__connect-banner"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          >
            ▸ LINK_{num} ESTABLISHED
          </motion.div>
        )}
      </AnimatePresence>
      <motion.h2
        className="card__title gradient-text"
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          className="card__title-num"
          aria-hidden="true"
          initial={{ scale: 0, rotate: -90 }}
          animate={inView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          {scrambled}
        </motion.span>
        <span className="card__title-text glitch" data-text={title}>{title}</span>
      </motion.h2>
      {/* Hologram shimmer */}
      <span className="card__holo" aria-hidden="true" />
      {/* Cyber corner accents */}
      <span className="card__corner card__corner--tl" aria-hidden="true" />
      <span className="card__corner card__corner--tr" aria-hidden="true" />
      <span className="card__corner card__corner--bl" aria-hidden="true" />
      <span className="card__corner card__corner--br" aria-hidden="true" />
      {children}
    </motion.section>
  );
}
