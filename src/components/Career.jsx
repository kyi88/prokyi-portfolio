import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Career.css';

const education = [
  { date: '2025.03', title: '千葉敬愛高等学校', sub: '理系特進コース 卒業', active: false },
  { date: '2025.04 —', title: 'ZEN大学 在学中', sub: 'オンライン講義を通じた実践的なスキル習得', active: true },
];

const jobs = [
  { icon: '🍣', title: '寿司屋のキッチン', desc: '調理補助・食材管理' },
  { icon: '🏪', title: 'コンビニエンスストア', desc: '接客・レジ・在庫管理' },
];

export default function Career() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref}>
      <div className="timeline">
        {education.map((e, i) => (
          <motion.div
            key={e.date}
            className={`timeline__item ${e.active ? 'timeline__item--active' : ''}`}
            initial={{ opacity: 0, x: -50, scale: 0.9, filter: 'blur(5px)' }}
            animate={inView ? { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 8, transition: { duration: 0.2 } }}
          >
            <span className="timeline__date">{e.date}</span>
            <h3 className="timeline__heading">{e.title}</h3>
            <p className="timeline__sub">{e.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.h3
        className="card__subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        アルバイト経験
      </motion.h3>

      <div className="job-row">
        {jobs.map((j, i) => (
          <motion.div
            key={j.title}
            className="job-chip"
            initial={{ opacity: 0, y: 30, rotate: -5, scale: 0.85 }}
            animate={inView ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.15, type: 'spring', stiffness: 120 }}
            whileHover={{ y: -6, scale: 1.05, rotate: 1, boxShadow: '0 12px 30px rgba(79, 172, 254, 0.15)', transition: { duration: 0.25 } }}
          >
            <motion.span
              className="job-chip__icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {j.icon}
            </motion.span>
            <div>
              <strong>{j.title}</strong>
              <small>{j.desc}</small>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
