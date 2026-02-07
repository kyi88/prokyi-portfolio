import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import './StatusScreen.css';

/* ════════════════════════ DATA ════════════════════════ */

const STATS = [
  { label: 'VISION',  value: '0.1',         tag: 'Cybernetic Eye Required', icon: '👁️', bar: 5,   color: '#ef4444' },
  { label: 'HEIGHT',  value: '163 cm',      tag: 'Lightweight Class',       icon: '📏', bar: 45,  color: '#4facfe' },
  { label: 'WEIGHT',  value: '49 kg',       tag: 'Agile Build',             icon: '⚖️', bar: 30,  color: '#00f2fe' },
  { label: 'SPRINT',  value: '7.8s / 50m',  tag: 'Standard Mobility',       icon: '🏃', bar: 50,  color: '#22d3a7' },
  { label: 'ROMANCE', value: 'N/A',         tag: 'Solo Player Mastery: MAX',icon: '💔', bar: 100, color: '#a78bfa' },
];

const TRAITS = [
  { label: 'HOUSING', value: '公営住宅',           tag: 'Public Sector Dwelling', icon: '🏠' },
  { label: 'FAMILY',  value: '母子家庭 / 一人っ子', tag: 'Lone Wolf Origin',       icon: '👤' },
];

const DEBUFFS = [
  { id: 'lactose',  name: '乳糖不耐性',       nameEn: 'LACTOSE INTOLERANCE',  desc: '牛乳摂取で確定クリティカル（腹痛）',       icon: '🥛', severity: 'CRITICAL' },
  { id: 'caffeine', name: 'カフェイン不耐性', nameEn: 'CAFFEINE SENSITIVITY', desc: 'コーヒー系で確定クリティカル（腹痛）',     icon: '☕', severity: 'CRITICAL' },
  { id: 'burp',     name: '排気不全',          nameEn: 'EXHAUST FAILURE',      desc: 'ゲップが出せない — ガス排出機能に障害あり', icon: '💨', severity: 'MODERATE' },
  { id: 'fashion',  name: 'デフォルトスキン', nameEn: 'DEFAULT SKIN ONLY',    desc: '自分で服を買った経験なし',                 icon: '👕', severity: 'LOW' },
];

const HISTORY = [
  {
    era: 'ELEMENTARY', label: '小学校時代',
    events: [
      { text: '進研ゼミ → 公文 → スイミング → 学習塾', tag: 'Intensive Training Arc' },
      { text: '近所の公園で「天才！志村どうぶつ園」ロケ中の志村けんに遭遇', tag: '⚡ LEGENDARY ENCOUNTER', legendary: true },
    ],
  },
  { era: 'MIDDLE SCHOOL', label: '中学時代', events: [{ text: '吹奏楽部（パーカッション）', tag: 'Rhythm Skill Acquired' }] },
  { era: 'HIGH SCHOOL',   label: '高校時代', events: [{ text: '軽音部（幽霊部員）',         tag: 'Stealth Skill: LV MAX' }] },
];

const INVENTORY = [
  { slot: 'HEADGEAR',      name: 'Soundcore Space One Pro', type: 'Wireless Headphones',   icon: '🎧', rarity: 'EPIC',      color: '#a855f7', specs: [{ l: 'ANC',     v: 'LDAC / Hi-Res' },  { l: 'BATTERY', v: '60h' }] },
  { slot: 'EAR-WEAR',      name: 'JBL Tour Pro 3',          type: 'Wireless Earphones',     icon: '🎵', rarity: 'LEGENDARY', color: '#f59e0b', specs: [{ l: 'DRIVER',  v: 'Dual + Planar' },  { l: 'BATTERY', v: '12h (Buds)' }] },
  { slot: 'DESKTOP AUDIO', name: 'Edifier MR3',             type: 'Monitor Speakers',       icon: '🔊', rarity: 'RARE',      color: '#3b82f6', specs: [{ l: 'DRIVER',  v: '4\" Full Range' }, { l: 'POWER',   v: '36W RMS' }] },
  { slot: 'ARTIFACT',      name: 'AYN Thor',                type: 'Emulation Console [MAX]', icon: '🎮', rarity: 'LEGENDARY', color: '#ef4444', specs: [{ l: 'CPU',     v: 'Snapdragon 8 Gen 2' }, { l: 'RAM/ROM', v: '16GB / 1TB' }, { l: 'UPPER',  v: '6" 120Hz' }, { l: 'LOWER', v: '3.92" 60Hz' }] },
];

/* ════════════════════════ SUB-COMPONENTS ════════════════════════ */

function GlitchText({ children, className = '' }) {
  return <span className={`ss-glitch ${className}`} data-text={children}>{children}</span>;
}

function StatBar({ value, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div className="ss-bar" ref={ref}>
      <motion.div
        className="ss-bar__fill"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : {}}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function SeverityBadge({ severity }) {
  const colors = { CRITICAL: '#ef4444', MODERATE: '#f59e0b', LOW: '#22d3ee' };
  return (
    <span className="ss-severity" style={{ '--sev': colors[severity] || '#888' }}>
      <span className="ss-severity__dot" />
      {severity}
    </span>
  );
}

function RarityBadge({ rarity }) {
  const colors = { COMMON: '#9ca3af', RARE: '#3b82f6', EPIC: '#a855f7', LEGENDARY: '#f59e0b' };
  return <span className="ss-rarity" style={{ '--rar': colors[rarity] }}>{rarity}</span>;
}

/* ════════════════════════ SHIMURA OVERLAY ════════════════════════ */

function ShimuraOverlay({ open, onClose }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="shimura" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Legendary Encounter">
          <motion.div
            className="shimura__card"
            initial={{ scale: 0.4, rotateX: 50 }}
            animate={{ scale: 1, rotateX: 0 }}
            exit={{ scale: 0.4, rotateX: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shimura__head"><span className="shimura__icon">⚡</span><GlitchText className="shimura__title">LEGENDARY ENCOUNTER</GlitchText></div>
            <div className="shimura__body">
              <p className="shimura__meta">ERA: 小学校時代 &nbsp;|&nbsp; 📍 近所の公園</p>
              <p className="shimura__text">「天才！志村どうぶつ園」のロケ中、<br /><strong>志村けん</strong>に遭遇。</p>
              <p className="shimura__flavor">"Some encounters are written in the stars — or in the neighborhood park."</p>
            </div>
            <button className="shimura__close" onClick={onClose}>[ESC] CLOSE</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════ MAIN ════════════════════════ */

const tabs = [
  { id: 'stats',     label: 'STATUS',    icon: '📊' },
  { id: 'debuffs',   label: 'DEBUFFS',   icon: '⚠️' },
  { id: 'history',   label: 'HISTORY',   icon: '📜' },
  { id: 'inventory', label: 'INVENTORY', icon: '🎒' },
];

const panelAnim = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.35 } };

export default function StatusScreen() {
  const [tab, setTab] = useState('stats');
  const [shimura, setShimura] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <div className="ss" ref={ref} aria-labelledby="ss-heading">
      {/* Scanline */}
      <div className="ss__scanline" aria-hidden="true" />

      {/* Header */}
      <motion.div className="ss__header" initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
        <span className="ss__tag">{'< CHARACTER_PROFILE />'}</span>
        <h3 id="ss-heading" className="ss__title"><GlitchText>PLAYER STATUS</GlitchText></h3>
        <p className="ss__sub">ID: <code>prokyi</code> — Class: <code>Full-Stack Developer</code> — LV: <code>19</code></p>
      </motion.div>

      {/* Tabs */}
      <nav className="ss__tabs" role="tablist" aria-label="ステータスタブ">
        {tabs.map((t) => (
          <button key={t.id} id={`ss-tab-${t.id}`} role="tab" aria-selected={tab === t.id} aria-controls={`ss-p-${t.id}`}
            className={`ss__tab${tab === t.id ? ' is-active' : ''}`} onClick={() => setTab(t.id)}>
            <span className="ss__tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* Panels */}
      <AnimatePresence mode="wait">
        {/* ── STATS ── */}
        {tab === 'stats' && (
          <motion.div key="stats" id="ss-p-stats" role="tabpanel" aria-labelledby="ss-tab-stats" className="ss__panel" {...panelAnim}>
            <h4 className="ss__ptitle">BASIC STATS</h4>
            <div className="ss__stats-grid">
              {STATS.map((s, i) => (
                <motion.div key={s.label} className="ss-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="ss-stat__top"><span className="ss-stat__icon">{s.icon}</span><span className="ss-stat__label">{s.label}</span></div>
                  <div className="ss-stat__val">{s.value}</div>
                  <StatBar value={s.bar} color={s.color} />
                  <span className="ss-stat__tag">{s.tag}</span>
                </motion.div>
              ))}
            </div>
            <h4 className="ss__ptitle" style={{ marginTop: 28 }}>TRAITS</h4>
            <div className="ss__traits">
              {TRAITS.map((t, i) => (
                <motion.div key={t.label} className="ss-trait" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.12 }}>
                  <span className="ss-trait__icon">{t.icon}</span>
                  <div><div className="ss-trait__label">{t.label}</div><div className="ss-trait__val">{t.value}</div><div className="ss-trait__tag">{t.tag}</div></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── DEBUFFS ── */}
        {tab === 'debuffs' && (
          <motion.div key="debuffs" id="ss-p-debuffs" role="tabpanel" aria-labelledby="ss-tab-debuffs" className="ss__panel" {...panelAnim}>
            <h4 className="ss__ptitle">DEBUFFS &amp; QUIRKS</h4>
            <div className="ss__debuffs-grid">
              {DEBUFFS.map((d, i) => (
                <motion.div key={d.id} className="ss-debuff" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="ss-debuff__head">
                    <span className="ss-debuff__icon">{d.icon}</span>
                    <div><div className="ss-debuff__name">{d.name}</div><div className="ss-debuff__en">{d.nameEn}</div></div>
                    <SeverityBadge severity={d.severity} />
                  </div>
                  <p className="ss-debuff__desc">{d.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <motion.div key="history" id="ss-p-history" role="tabpanel" aria-labelledby="ss-tab-history" className="ss__panel" {...panelAnim}>
            <h4 className="ss__ptitle">SKILL ACQUISITION LOG</h4>
            <div className="ss__timeline">
              {HISTORY.map((era, ei) => (
                <motion.div key={era.era} className="ss-tl" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ei * 0.15 }}>
                  <div className="ss-tl__era"><span className="ss-tl__dot" />{era.era}<span className="ss-tl__label">{era.label}</span></div>
                  {era.events.map((ev, evi) => (
                    <div key={evi}
                      className={`ss-tl__ev${ev.legendary ? ' ss-tl__ev--legend' : ''}`}
                      onClick={ev.legendary ? () => setShimura(true) : undefined}
                      onKeyDown={ev.legendary ? (e) => e.key === 'Enter' && setShimura(true) : undefined}
                      role={ev.legendary ? 'button' : undefined}
                      tabIndex={ev.legendary ? 0 : undefined}
                      aria-label={ev.legendary ? 'レジェンド体験の詳細を表示' : undefined}
                    >
                      <p className="ss-tl__text">{ev.text}</p>
                      <span className={`ss-tl__tag${ev.legendary ? ' ss-tl__tag--legend' : ''}`}>{ev.tag}</span>
                      {ev.legendary && <span className="ss-tl__hint">▶ CLICK FOR DETAILS</span>}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── INVENTORY ── */}
        {tab === 'inventory' && (
          <motion.div key="inventory" id="ss-p-inventory" role="tabpanel" aria-labelledby="ss-tab-inventory" className="ss__panel" {...panelAnim}>
            <h4 className="ss__ptitle">EQUIPPED INVENTORY</h4>
            <div className="ss__inv-grid">
              {INVENTORY.map((it, i) => (
                <motion.div key={it.slot} className="ss-inv" style={{ '--ic': it.color }}
                  initial={{ opacity: 0, y: 20, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${it.color}22, 0 8px 32px rgba(0,0,0,.4)` }}
                >
                  <div className="ss-inv__slot">{it.slot}</div>
                  <div className="ss-inv__icon">{it.icon}</div>
                  <h5 className="ss-inv__name">{it.name}</h5>
                  <p className="ss-inv__type">{it.type}</p>
                  <RarityBadge rarity={it.rarity} />
                  {it.specs.length > 0 && (
                    <ul className="ss-inv__specs">
                      {it.specs.map((sp) => <li key={sp.l}><span className="ss-inv__sl">{sp.l}</span><span className="ss-inv__sv">{sp.v}</span></li>)}
                    </ul>
                  )}
                  <div className="ss-inv__glow" aria-hidden="true" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShimuraOverlay open={shimura} onClose={() => setShimura(false)} />
    </div>
  );
}
