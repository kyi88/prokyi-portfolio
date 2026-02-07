import { useRef, useState, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import './Gadgets.css';

/* 3D tilt on hover */
function useTilt() {
  const onMouseMove = useCallback((e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
  }, []);
  const onMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = '';
  }, []);
  return { onMouseMove, onMouseLeave };
}

const categories = [
  {
    id: 'pc',
    name: 'デスクトップ PC',
    icon: '🖥️',
    color: '#4facfe',
    devices: [
      {
        name: 'メイン PC',
        specs: [
          { label: 'CPU', value: 'AMD Ryzen 7 5700X' },
          { label: 'GPU', value: 'NVIDIA GeForce RTX 4070 Ti SUPER' },
          { label: 'RAM', value: 'DDR4 64GB' },
          { label: 'Storage', value: 'SSD 2TB' },
        ],
      },
      {
        name: 'サブ PC',
        specs: [
          { label: 'CPU', value: 'AMD Ryzen 9 PRO 6950H' },
          { label: '', value: '8コア / 16スレッド — 3.3〜4.9 GHz' },
          { label: 'RAM', value: '32GB' },
          { label: 'Storage', value: 'M.2 2280 NVMe SSD 2TB' },
        ],
      },
    ],
  },
  {
    id: 'laptop',
    name: 'ノート PC',
    icon: '💻',
    color: '#00f2fe',
    devices: [
      {
        name: 'Apple MacBook Air (M1)',
        specs: [
          { label: 'RAM', value: '8GB' },
          { label: 'Storage', value: 'SSD 512GB' },
        ],
      },
      {
        name: 'ASUS VivoBook 15 X1504ZA',
        specs: [
          { label: 'RAM', value: '16GB' },
          { label: 'Storage', value: 'SSD 512GB' },
        ],
      },
    ],
  },
  {
    id: 'tablet',
    name: 'タブレット',
    icon: '📱',
    color: '#a78bfa',
    devices: [
      { name: 'OnePlus Pad 3', specs: [] },
      { name: 'Apple iPad Air (M2)', specs: [] },
    ],
  },
  {
    id: 'phone',
    name: 'スマートフォン',
    icon: '📲',
    color: '#ff2d87',
    devices: [
      { name: 'Apple iPhone 13 Pro Max', specs: [] },
      { name: 'Samsung Galaxy Z Fold4', specs: [] },
      { name: 'HUAWEI P50 Pro', specs: [] },
      { name: 'Nothing CMF Phone 1', specs: [] },
    ],
  },
  {
    id: 'wearable',
    name: 'ウェアラブル',
    icon: '⌚',
    color: '#22d3a7',
    devices: [
      { name: 'Nothing CMF Watch Pro 2', specs: [] },
    ],
  },
  {
    id: 'audio',
    name: 'オーディオ',
    icon: '🎧',
    color: '#a855f7',
    devices: [
      {
        name: 'Soundcore Space One Pro',
        specs: [
          { label: 'Type', value: 'Wireless Headphones' },
          { label: 'Codec', value: 'LDAC / Hi-Res' },
          { label: 'Battery', value: '60h' },
        ],
      },
      {
        name: 'JBL Tour Pro 3',
        specs: [
          { label: 'Type', value: 'Wireless Earphones' },
          { label: 'Driver', value: 'Dual Driver + Planar' },
          { label: 'Battery', value: '12h (Buds)' },
        ],
      },
      {
        name: 'Edifier MR3',
        specs: [
          { label: 'Type', value: 'Monitor Speakers' },
          { label: 'Driver', value: '4" Full Range' },
          { label: 'Power', value: '36W RMS' },
        ],
      },
    ],
  },
  {
    id: 'gaming',
    name: 'ゲーミング',
    icon: '🎮',
    color: '#ef4444',
    devices: [
      {
        name: 'AYN Thor [MAX]',
        specs: [
          { label: 'Type', value: 'Emulation Console' },
          { label: 'CPU', value: 'Snapdragon 8 Gen 2' },
          { label: 'RAM / ROM', value: '16GB / 1TB' },
          { label: 'Upper', value: '6" 120Hz' },
          { label: 'Lower', value: '3.92" 60Hz' },
        ],
      },
    ],
  },
];

const allId = 'all';

export default function Gadgets() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [filter, setFilter] = useState(allId);
  const tilt = useTilt();

  const visible = filter === allId
    ? categories
    : categories.filter((c) => c.id === filter);

  const totalDevices = categories.reduce((s, c) => s + c.devices.length, 0);

  return (
    <div ref={ref}>
      {/* Device counter */}
      <motion.div
        className="gadgets__counter"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="gadgets__counter-num">{totalDevices}</span>
        <span className="gadgets__counter-label">devices</span>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        className="gadgets__tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <button
          className={`gadgets__tab ${filter === allId ? 'is-active' : ''}`}
          onClick={() => setFilter(allId)}
        >
          すべて
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`gadgets__tab ${filter === cat.id ? 'is-active' : ''}`}
            style={{ '--tab-color': cat.color }}
            onClick={() => setFilter(cat.id)}
          >
            <span className="gadgets__tab-icon">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Categories + devices */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          className="gadgets__list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {visible.map((cat, ci) => (
            <div key={cat.id} className="gadgets__category">
              <motion.h3
                className="gadgets__cat-title"
                style={{ '--cat-color': cat.color }}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: ci * 0.1 }}
              >
                <span className="gadgets__cat-icon">{cat.icon}</span>
                <span className="gadgets__cat-name">{cat.name}</span>
                <span className="gadgets__cat-count">{cat.devices.length}</span>
              </motion.h3>

              <div className="gadgets__grid">
                {cat.devices.map((dev, di) => (
                  <motion.article
                    key={dev.name}
                    className="gadget-card"
                    style={{ '--card-color': cat.color }}
                    initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 10 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : {}}
                    transition={{
                      duration: 0.7,
                      delay: ci * 0.12 + di * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileTap={{ scale: 0.98 }}
                    onMouseMove={tilt.onMouseMove}
                    onMouseLeave={tilt.onMouseLeave}
                  >
                    <div className="gadget-card__header">
                      <span className="gadget-card__dot" />
                      <h4 className="gadget-card__name">{dev.name}</h4>
                    </div>

                    {dev.specs.length > 0 && (
                      <ul className="gadget-card__specs">
                        {dev.specs.map((s, si) => (
                          <motion.li
                            key={si}
                            initial={{ opacity: 0, x: -10 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.4, delay: ci * 0.12 + di * 0.08 + si * 0.05 + 0.3 }}
                          >
                            {s.label && <span className="gadget-card__spec-label">{s.label}</span>}
                            <span className="gadget-card__spec-value">{s.value}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    {/* Animated border glow */}
                    <div className="gadget-card__glow" aria-hidden="true" />
                    {/* Equalizer bars */}
                    <div className="gadget-card__eq" aria-hidden="true">
                      <span /><span /><span /><span /><span />
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
