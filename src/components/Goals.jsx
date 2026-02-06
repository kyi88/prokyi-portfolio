import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Goals.css';

const goals = [
  { icon: '🤖', name: 'LLM', desc: '大規模言語モデルの開発環境構築と、特定用途へのファインチューニング' },
  { icon: '🖥️', name: '自宅サーバー', desc: 'セキュリティを考慮したサーバー構築と運用、Webサービス公開' },
  { icon: '🎬', name: '動画編集', desc: 'クリエイティブなコンテンツ制作' },
  { icon: '🎨', name: '3Dモデリング', desc: 'ビジュアルコンテンツの創造' },
];

export default function Goals() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref}>
      <motion.p
        className="goals__lead"
        initial={{ opacity: 0, x: -30, filter: 'blur(5px)' }}
        animate={inView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.8 }}
      >
        IT分野でのスキルを最大限に伸ばし、新しい技術を自ら形にすることを目指しています。
      </motion.p>
      <div className="goals-grid">
        {goals.map((g, i) => (
          <motion.article
            key={g.name}
            className="goal"
            initial={{ opacity: 0, y: 40, scale: 0.8, rotateY: 20 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1, rotateY: 0 } : {}}
            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -8,
              scale: 1.04,
              boxShadow: '0 20px 50px rgba(79, 172, 254, 0.15)',
              transition: { duration: 0.3 },
            }}
            style={{ transformPerspective: 800 }}
          >
            <motion.div
              className="goal__icon-wrap"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 + i }}
            >
              <span>{g.icon}</span>
            </motion.div>
            <h3 className="goal__name">{g.name}</h3>
            <p className="goal__desc">{g.desc}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
