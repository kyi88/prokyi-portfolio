import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import GlowCard from './GlowCard';
import './Sidebar.css';

/* World Clocks — Tokyo, London, New York */
const ZONES = [
  { label: 'TOKYO', tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { label: 'LONDON', tz: 'Europe/London', flag: '🇬🇧' },
  { label: 'NEW YORK', tz: 'America/New_York', flag: '🇺🇸' },
];
function WorldClocks() {
  const [times, setTimes] = useState(() => ZONES.map(() => '--:--'));
  useEffect(() => {
    const update = () => {
      setTimes(ZONES.map(z => {
        const d = new Date();
        return d.toLocaleTimeString('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      }));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="world-clocks" aria-label="世界時計">
      {ZONES.map((z, i) => (
        <div key={z.tz} className="world-clocks__item">
          <span className="world-clocks__flag">{z.flag}</span>
          <span className="world-clocks__label">{z.label}</span>
          <span className="world-clocks__time">{times[i]}</span>
        </div>
      ))}
    </div>
  );
}

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

/* Animated counting number */
function useCountUp(target, active, duration = 1200, delay = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now() + delay;
    let raf;
    const step = (now) => {
      const elapsed = Math.max(0, now - t0);
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, delay]);
  return val;
}

/* SVG Radar Chart */
function SkillRadar({ data, inView }) {
  const cx = 100, cy = 100, maxR = 75;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;
  const [hovered, setHovered] = useState(null);

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
      {/* Data points + labels + hover zones */}
      {dataPoints.map((p, i) => (
        <g key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
        >
          {/* Invisible hit area */}
          <circle cx={p[0]} cy={p[1]} r="12" fill="transparent" />
          <motion.circle
            cx={p[0]} cy={p[1]}
            r={hovered === i ? 5 : 3}
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
            opacity={hovered === i ? 1 : 0.8}
            fontWeight={hovered === i ? 'bold' : 'normal'}
          >
            {data[i].name}
          </text>
          {/* Tooltip on hover */}
          {hovered === i && (
            <g>
              <rect
                x={p[0] - 18} y={p[1] - 20}
                width="36" height="14"
                rx="3"
                fill="rgba(6,8,15,0.9)"
                stroke={data[i].color}
                strokeWidth="0.8"
              />
              <text
                x={p[0]} y={p[1] - 11}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={data[i].color}
                fontSize="7"
                fontFamily="var(--font-mono)"
                fontWeight="bold"
              >
                {data[i].lv}%
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

/* Skill list item with count-up animation */
function SkillListItem({ skill, index, inView }) {
  const count = useCountUp(skill.lv, inView, 1200, 600 + index * 100);
  return (
    <li>
      <div className="skill-list__head">
        <span className="skill-list__name">{skill.name}</span>
        <span className="skill-list__lv" style={{ color: skill.color }}>{count}%</span>
      </div>
      <div className="skill-list__bar">
        <motion.div
          className="skill-list__fill"
          style={{ background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.lv}%` } : {}}
          transition={{ duration: 1.2, delay: 0.6 + index * 0.1 }}
        />
      </div>
    </li>
  );
}

/* Status value with optional count-up */
function StatusValue({ item, inView }) {
  const numMatch = item.v.match(/^(\d+)$/);
  const count = useCountUp(numMatch ? parseInt(numMatch[1]) : 0, inView && !!numMatch, 800, 300);
  return <span>{numMatch ? count : item.v}</span>;
}

/* Session timer — own component to avoid re-rendering the whole Sidebar */
function SessionTimer() {
  const [session, setSession] = useState('0:00');
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(s / 60);
      setSession(`${m}:${String(s % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span className="side-card__meta-item">SESSION {session}</span>;
}

export default function Sidebar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const dayLabel = ['日','月','火','水','木','金','土'][new Date().getDay()];

  return (
    <aside className="layout__side" ref={ref} aria-label="サイド情報">
      <GlowCard>
      <motion.div
        className="side-card"
        initial={{ opacity: 0, x: 60, scale: 0.9 }}
        animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <h3 className="side-card__title">
          ステータス
          <span className="pulse-beacon" aria-hidden="true" title="LIVE" />
        </h3>
        <div className="side-card__meta">
          <span className="side-card__meta-item">{dayLabel}曜日</span>
          <SessionTimer />
        </div>
        <ul className="status-list">
          {statusItems.map((item) => (
            <li key={item.k}>
              <span>{item.k}</span>
              <div className="status-val-wrap">
                <StatusValue item={item} inView={inView} />
                {item.bar != null && (
                  <div className="status-bar">
                    <motion.div
                      className="status-bar__fill"
                      style={{ background: item.color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${item.bar}%` } : {}}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <WorldClocks />
      </motion.div>
      </GlowCard>

      <GlowCard>
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
      </GlowCard>

      {/* Skills */}
      <GlowCard>
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
            <SkillListItem key={s.name} skill={s} index={i} inView={inView} />
          ))}
        </ul>
      </motion.div>
      </GlowCard>
    </aside>
  );
}
