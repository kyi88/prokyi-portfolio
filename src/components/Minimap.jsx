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
  const [hidden, setHidden] = useState(false);

  // Keyboard shortcut "M" to toggle
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setHidden(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const elCacheRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
      if (!elCacheRef.current) {
        elCacheRef.current = sections.map(s => document.getElementById(s.id));
      }
      const y = window.scrollY + window.innerHeight / 2;
      for (let i = 0; i < sections.length; i++) {
        const el = elCacheRef.current[i];
        if (el && y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
          setActive(sections[i].id);
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
      {visible && !hidden && (
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
            animate={{ top: `${Math.max(0, sections.findIndex(s => s.id === active)) * 28 + 6}px` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
