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
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="timeline__date">{e.date}</span>
            <h3 className="timeline__heading">{e.title}</h3>
            <p className="timeline__sub">{e.sub}</p>
          </motion.div>
        ))}
      </div>

      <h3 className="card__subtitle">アルバイト経験</h3>

      <div className="job-row">
        {jobs.map((j, i) => (
          <motion.div
            key={j.title}
            className="job-chip"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <span className="job-chip__icon">{j.icon}</span>
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
