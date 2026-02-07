import { useRef, useMemo, useState, useEffect } from 'react';
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

/* SVG Radar Chart */
function SkillRadar({ data, inView }) {
  const cx = 100, cy = 100, maxR = 75;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;

  const getPoint = (i, pct) => {
    const angle = angleStep * i - Math.PI / 2;
    return [cx + Math.cos(angle) * maxR * (pct / 100), cy + Math.sin(angle) * maxR * (pct / 100)];
  };

  // Grid rings at 25, 50, 75, 100
  const rings = [25, 50, 75, 100];
  const gridPaths = rings.map(pct => {
    const pts = Array.from({ length: n }, (_, i) => getPoint(i, pct));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';
  });

  // Data shape
  const dataPoints = data.map((s, i) => getPoint(i, s.lv));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ') + ' Z';

  // Axis lines
  const axes = Array.from({ length: n }, (_, i) => getPoint(i, 100));

  return (
    <svg viewBox="0 0 200 200" className="skill-radar" aria-label="スキルレーダーチャート">
      {/* Grid */}
      {gridPaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(79,172,254,0.12)" strokeWidth="0.5" />
      ))}
      {/* Axes */}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a[0]} y2={a[1]} stroke="rgba(79,172,254,0.08)" strokeWidth="0.5" />
      ))}
      {/* Data fill */}
      <motion.path
        d={dataPath}
        fill="rgba(79,172,254,0.12)"
        stroke="#4facfe"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 1 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Data points + labels */}
      {dataPoints.map((p, i) => (
        <g key={i}>
          <motion.circle
            cx={p[0]} cy={p[1]} r="3"
            fill={data[i].color}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2 + i * 0.1 }}
          />
          {/* Label */}
          <text
            x={axes[i][0] + (axes[i][0] - cx) * 0.2}
            y={axes[i][1] + (axes[i][1] - cy) * 0.2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={data[i].color}
            fontSize="6.5"
            fontFamily="var(--font-mono)"
            opacity={0.8}
          >
            {data[i].name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Sidebar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [session, setSession] = useState('0:00');

  // Session timer
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(s / 60);
      setSession(`${m}:${String(s % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const dayLabel = ['日','月','火','水','木','金','土'][new Date().getDay()];

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
        <div className="side-card__meta">
          <span className="side-card__meta-item">{dayLabel}曜日</span>
          <span className="side-card__meta-item">SESSION {session}</span>
        </div>
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
        <SkillRadar data={skills} inView={inView} />
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
