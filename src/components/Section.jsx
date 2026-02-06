import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Section.css';

export default function Section({ id, num, title, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      className="card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="card__title">
        <span className="card__title-num" aria-hidden="true">{num}</span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
