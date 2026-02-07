import { memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './ScrollPercentage.css';

/**
 * ScrollPercentage — shows current scroll position as a percentage
 * at the bottom-left corner.
 */
function ScrollPercentage() {
  const { scrollYProgress } = useScroll();
  const pct = useTransform(scrollYProgress, v => `${Math.round(v * 100)}%`);
  const opacity = useTransform(scrollYProgress, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      className="scroll-pct"
      aria-hidden="true"
      style={{ opacity }}
    >
      <motion.span className="scroll-pct__value">{pct}</motion.span>
    </motion.div>
  );
}

export default memo(ScrollPercentage);
