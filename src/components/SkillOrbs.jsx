import { memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import './SkillOrbs.css';

const SKILLS = [
  { name: 'React', color: '#61dafb' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Python', color: '#3776ab' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Three.js', color: '#049ef4' },
  { name: 'AI / ML', color: '#ff6f61' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'Git', color: '#f05032' },
  { name: 'Linux', color: '#fcc624' },
  { name: 'Vite', color: '#646cff' },
];

function SkillOrbs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <div className="skill-orbs" ref={ref} aria-label="スキル一覧">
      <p className="skill-orbs__label">SKILLS</p>
      <div className="skill-orbs__grid">
        {SKILLS.map((s, i) => (
          <motion.span
            key={s.name}
            className="skill-orb"
            style={{ '--orb-color': s.color, '--bob-delay': `${i * 0.3}s` }}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.06, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.15, y: -4, transition: { duration: 0.2 } }}
          >
            <span className="skill-orb__dot" aria-hidden="true" />
            {s.name}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export default memo(SkillOrbs);
