import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Sidebar.css';

export default function Sidebar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <aside className="layout__side" ref={ref} aria-label="サイド情報">
      <motion.div
        className="side-card"
        initial={{ opacity: 0, x: 60, scale: 0.9 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <h3 className="side-card__title">ステータス</h3>
        <ul className="status-list">
          {[
            ['所在地', '千葉県'],
            ['状態', '学習中 🔥'],
            ['資格', '英検2級'],
            ['学校', 'ZEN大学'],
          ].map(([k, v]) => (
            <li key={k}><span>{k}</span><span>{v}</span></li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="side-card"
        initial={{ opacity: 0, x: 60, scale: 0.9 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <h3 className="side-card__title">更新情報</h3>
        <ul className="news-list">
          {[
            ['2026/02/07', 'ガジェットセクション追加'],
            ['2026/02/07', 'React版にリニューアル'],
            ['2026/02/06', 'ポートフォリオ開設'],
            ['2025/04/09', 'ZEN大学 入学'],
            ['2025/03/01', '千葉敬愛高等学校 卒業'],
          ].map(([date, text]) => (
            <li key={date + text}>
              <time>{date}</time>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </aside>
  );
}
