import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
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

  return (
    <motion.section
      id={id}
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
      style={{ transformPerspective: 1200 }}
    >
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
      {/* Cyber corner accents */}
      <span className="card__corner card__corner--tl" aria-hidden="true" />
      <span className="card__corner card__corner--tr" aria-hidden="true" />
      <span className="card__corner card__corner--bl" aria-hidden="true" />
      <span className="card__corner card__corner--br" aria-hidden="true" />
      {children}
    </motion.section>
  );
}
