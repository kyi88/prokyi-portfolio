import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect, memo } from 'react';
import './Profile.css';

/* Typewriter hook — reveals text character by character */
function useTypewriter(text, active, speed = 35, delay = 400) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) return;
    let i = 0;
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(iv);
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [active, text, speed, delay]);
  return displayed;
}

const BIO_TEXT = '独学でWeb技術を学び続けるエンジニア志望。サイバーパンクな世界観と最新テクノロジーに惹かれ、日々コードを書いています。';

const items = [
  { label: '名前', value: 'ぷろきぃ (prokyi)', icon: '👤', tip: 'ネットの名前です' },
  { label: '所在地', value: '千葉県', icon: '📍', tip: '関東エリア在住' },
  { label: '趣味', value: 'インターネット / 技術動向の調査', icon: '🔍', tip: '常に最新技術をチェック' },
  { label: '資格', value: '実用英語技能検定 (英検) 2級', icon: '📜', tip: '英語でドキュメント読めます' },
  { label: '現在', value: 'ZEN大学 在学中', icon: '🎓', tip: 'オンライン大学で学習中' },
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

function Profile() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const bioText = useTypewriter(BIO_TEXT, inView);

  return (
    <div ref={ref}>
      {/* Typewriter bio */}
      <motion.p
        className="profile-bio"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
      >
        {bioText}
        <span className="profile-bio__cursor" aria-hidden="true">|</span>
      </motion.p>

      <motion.dl
        className="profile-grid"
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
          <motion.span
            className="profile-grid__icon"
            aria-hidden="true"
            initial={{ scale: 0, rotate: -30 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.3 + i * 0.12 }}
          >
            {d.icon}
          </motion.span>
          <dt>{d.label}</dt>
          <dd>{d.value}</dd>
          {d.tip && <span className="profile-grid__tip" aria-label={d.tip}>{d.tip}</span>}
          <div className="profile-grid__scanline" aria-hidden="true" />
        </motion.div>
      ))}
    </motion.dl>
    </div>
  );
}

export default memo(Profile);
