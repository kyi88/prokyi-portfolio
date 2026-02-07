import { useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import './Goals.css';

const goals = [
  { icon: '🤖', name: 'LLM', desc: '大規模言語モデルの開発環境構築と、特定用途へのファインチューニング', progress: 20 },
  { icon: '🖥️', name: '自宅サーバー', desc: 'セキュリティを考慮したサーバー構築と運用、Webサービス公開', progress: 15 },
  { icon: '🎬', name: '動画編集', desc: 'クリエイティブなコンテンツ制作', progress: 10 },
  { icon: '🎨', name: '3Dモデリング', desc: 'ビジュアルコンテンツの創造', progress: 5 },
];

export default function Goals() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const handleSpotlight = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--spot-x', `${x}px`);
    card.style.setProperty('--spot-y', `${y}px`);
  }, []);

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
            onMouseMove={handleSpotlight}
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
            <div className="goal__progress">
              <div className="goal__progress-label">
                <span>進捗</span>
                <span>{g.progress}%</span>
              </div>
              <div className="goal__progress-bar">
                <motion.div
                  className="goal__progress-fill"
                  style={{ background: `var(--goal-color, var(--c-accent))` }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${g.progress}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                />
              </div>
              <span className="goal__rank">
                {g.progress >= 80 ? '🏆 MASTER' : g.progress >= 50 ? '⚡ ADVANCED' : g.progress >= 20 ? '🔧 LEARNING' : '🌱 STARTING'}
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
