import { memo } from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';
import './ScrollVelocity.css';

function ScrollVelocity() {
  const { scrollYProgress } = useScroll();
  const velocity = useVelocity(scrollYProgress);
  const absVelocity = useTransform(velocity, v => Math.min(Math.abs(v) * 80, 100));
  const smoothVel = useSpring(absVelocity, { stiffness: 100, damping: 20 });
  const opacity = useTransform(smoothVel, [0, 5, 100], [0, 0.5, 1]);
  const dashOffset = useTransform(smoothVel, [0, 100], [157, 0]);
  const glowIntensity = useTransform(smoothVel, [0, 100], [0, 1]);

  return (
    <motion.div
      className="scroll-velocity"
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="44" height="44" viewBox="0 0 60 60">
        {/* Background track */}
        <circle
          cx="30" cy="30" r="25"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
          strokeDasharray="157"
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
        {/* Velocity arc */}
        <motion.circle
          cx="30" cy="30" r="25"
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth="3"
          strokeDasharray="157"
          style={{ strokeDashoffset: dashOffset }}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
      </svg>
      <motion.span
        className="scroll-velocity__label"
        style={{ opacity: glowIntensity }}
      >
        SPD
      </motion.span>
    </motion.div>
  );
}

export default memo(ScrollVelocity);
