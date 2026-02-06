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
      <p className="goals__lead">
        IT分野でのスキルを最大限に伸ばし、新しい技術を自ら形にすることを目指しています。
      </p>
      <div className="goals-grid">
        {goals.map((g, i) => (
          <motion.article
            key={g.name}
            className="goal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
          >
            <div className="goal__icon-wrap">
              <span>{g.icon}</span>
            </div>
            <h3 className="goal__name">{g.name}</h3>
            <p className="goal__desc">{g.desc}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
