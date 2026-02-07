import { memo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import './PageProgress.css';

function PageProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <motion.div
      className="page-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

export default memo(PageProgress);
