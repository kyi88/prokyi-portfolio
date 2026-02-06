import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import './Profile.css';

const items = [
  { label: '名前', value: 'ぷろきぃ (prokyi)' },
  { label: '所在地', value: '千葉県' },
  { label: '趣味', value: 'インターネット / 技術動向の調査' },
  { label: '資格', value: '実用英語技能検定 (英検) 2級' },
  { label: '現在', value: 'ZEN大学 在学中' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const itemVariant = (i) => ({
  hidden: { opacity: 0, x: i % 2 === 0 ? -40 : 40, scale: 0.9, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
});

export default function Profile() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.dl
      className="profile-grid"
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
    >
      {items.map((d, i) => (
        <motion.div
          key={d.label}
          className="profile-grid__item"
          variants={itemVariant(i)}
          whileHover={{ scale: 1.03, x: 6, transition: { duration: 0.2 } }}
        >
          <dt>{d.label}</dt>
          <dd>{d.value}</dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}
