import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Breadcrumbs.css';

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'career', label: 'Career' },
  { id: 'goals', label: 'Goals' },
  { id: 'status', label: 'Status' },
  { id: 'gadgets', label: 'Gadgets' },
  { id: 'links', label: 'Links' },
];

function Breadcrumbs() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const elCacheRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 400);
      if (!elCacheRef.current) {
        elCacheRef.current = SECTIONS.map(s => document.getElementById(s.id));
      }
      const y = window.scrollY + window.innerHeight * 0.3;
      let found = null;
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = elCacheRef.current[i];
        if (el && y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
          found = SECTIONS[i].id;
          break;
        }
      }
      setActive(found);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {scrolled && active && (
        <motion.nav
          className="breadcrumbs"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          aria-label="セクションナビゲーション"
        >
          {SECTIONS.map((s, i) => (
            <span key={s.id} className="breadcrumbs__item">
              {i > 0 && <span className="breadcrumbs__sep" aria-hidden="true">›</span>}
              <button
                className={`breadcrumbs__link ${active === s.id ? 'breadcrumbs__link--active' : ''}`}
                onClick={() => handleClick(s.id)}
              >
                {s.label}
                {active === s.id && (
                  <motion.span
                    className="breadcrumbs__indicator"
                    layoutId="bc-indicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </button>
            </span>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default memo(Breadcrumbs);
