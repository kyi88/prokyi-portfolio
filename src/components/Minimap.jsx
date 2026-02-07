import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Minimap.css';

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'career', label: 'Career' },
  { id: 'goals', label: 'Goals' },
  { id: 'status', label: 'Status' },
  { id: 'gadgets', label: 'Gadgets' },
  { id: 'links', label: 'Links' },
];

export default function Minimap() {
  const [active, setActive] = useState('');
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
      const y = window.scrollY + window.innerHeight / 2;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
          setActive(s.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          className="minimap"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4 }}
          aria-label="セクションナビ"
        >
          {sections.map((s) => (
            <button
              key={s.id}
              className={`minimap__dot ${active === s.id ? 'is-active' : ''}`}
              onClick={() => handleClick(s.id)}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={s.label}
            >
              <span className="minimap__pip" />
              <AnimatePresence>
                {hovered === s.id && (
                  <motion.span
                    className="minimap__label"
                    initial={{ opacity: 0, x: 8, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {s.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
          {/* Active position line */}
          <motion.div
            className="minimap__track"
            animate={{ top: `${sections.findIndex(s => s.id === active) * 28 + 6}px` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
