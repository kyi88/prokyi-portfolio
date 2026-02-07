import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Sidebar.css';

const statusItems = [
  { k: '所在地', v: '千葉県' },
  { k: '状態', v: '学習中 🔥', bar: 75, color: '#22d3a7' },
  { k: '資格', v: '英検2級' },
  { k: '学校', v: 'ZEN大学' },
  { k: 'LV', v: '19', bar: 19, color: '#4facfe' },
];

const skills = [
  { name: 'Python',     lv: 55, color: '#fbbf24' },
  { name: 'JavaScript', lv: 45, color: '#f59e0b' },
  { name: 'React',      lv: 40, color: '#4facfe' },
  { name: 'Linux',      lv: 50, color: '#22d3a7' },
  { name: 'Docker',     lv: 35, color: '#00f2fe' },
  { name: 'AI / ML',    lv: 30, color: '#a855f7' },
];

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
          {statusItems.map(({ k, v, bar, color }) => (
            <li key={k}>
              <span>{k}</span>
              <div className="status-val-wrap">
                <span>{v}</span>
                {bar != null && (
                  <div className="status-bar">
                    <motion.div
                      className="status-bar__fill"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${bar}%` } : {}}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                )}
              </div>
            </li>
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
        {/* Scrolling ticker */}
        <div className="news-ticker" aria-hidden="true">
          <span className="news-ticker__text">SYSTEM ONLINE — ステータス画面追加 — ガジェット追加 — React版リニューアル — </span>
          <span className="news-ticker__text">SYSTEM ONLINE — ステータス画面追加 — ガジェット追加 — React版リニューアル — </span>
        </div>
        <ul className="news-list">
          {[
            ['2026/02/07', 'プレイヤーステータス追加'],
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

      {/* Skills */}
      <motion.div
        className="side-card"
        initial={{ opacity: 0, x: 60, scale: 0.9 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <h3 className="side-card__title">スキル</h3>
        <ul className="skill-list">
          {skills.map((s, i) => (
            <li key={s.name}>
              <div className="skill-list__head">
                <span className="skill-list__name">{s.name}</span>
                <span className="skill-list__lv" style={{ color: s.color }}>{s.lv}%</span>
              </div>
              <div className="skill-list__bar">
                <motion.div
                  className="skill-list__fill"
                  style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${s.lv}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.6 + i * 0.1 }}
                />
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </aside>
  );
}
