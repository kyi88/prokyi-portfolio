import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareButton from './ShareButton';
import './Header.css';

const navItems = [
  { href: '#profile', label: 'Profile' },
  { href: '#career', label: 'Career' },
  { href: '#goals', label: 'Goals' },
  { href: '#status', label: 'Status' },
  { href: '#gadgets', label: 'Gadgets' },
  { href: '#links', label: 'Links' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const [viewedCount, setViewedCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('prokyi_theme') || 'cyber');
  const viewedRef = useRef(new Set());

  // Apply theme with flash transition
  useEffect(() => {
    if (theme === 'green') {
      document.documentElement.setAttribute('data-theme', 'green');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('prokyi_theme', theme);
  }, [theme]);

  // Sync theme when changed externally (e.g. CyberTerminal "theme" command)
  useEffect(() => {
    const onSync = (e) => setTheme(e.detail);
    window.addEventListener('prokyi-theme-sync', onSync);
    return () => window.removeEventListener('prokyi-theme-sync', onSync);
  }, []);

  const sparkleTimers = useRef([]);

  // Cleanup sparkle DOM timers on unmount
  useEffect(() => () => {
    sparkleTimers.current.forEach(t => clearTimeout(t));
    sparkleTimers.current = [];
  }, []);

  const toggleTheme = useCallback(() => {
    // Flash effect on toggle
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;background:var(--c-accent);opacity:0.08;transition:opacity 0.4s;';
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '0'; });
    sparkleTimers.current.push(setTimeout(() => flash.remove(), 500));

    // Sparkle particles burst from toggle button
    const btn = document.querySelector('.header__theme-btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
        const dist = 40 + Math.random() * 60;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 3 + Math.random() * 4;
        p.style.cssText = `
          position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;
          border-radius:50%;pointer-events:none;z-index:99991;
          background:var(--c-accent);box-shadow:0 0 6px var(--c-accent);
          transition:all 0.6s cubic-bezier(0.22,1,0.36,1);opacity:1;
          transform:translate(-50%,-50%) scale(1);
        `;
        document.body.appendChild(p);
        requestAnimationFrame(() => {
          p.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`;
          p.style.opacity = '0';
        });
        sparkleTimers.current.push(setTimeout(() => p.remove(), 700));
      }
    }

    setTheme(prev => prev === 'cyber' ? 'green' : 'cyber');
  }, []);

  const sectionsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Cache section elements on first scroll
      if (!sectionsRef.current) {
        sectionsRef.current = Array.from(document.querySelectorAll('section[id]'));
      }
      const y = window.scrollY + 140;
      const seen = viewedRef.current;
      let changed = false;
      for (const s of sectionsRef.current) {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
          setActive(s.id);
          if (!seen.has(s.id)) {
            seen.add(s.id);
            changed = true;
          }
        }
      }
      if (changed) {
        setViewedCount(seen.size);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on Escape key or outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onClickOutside = (e) => {
      if (!e.target.closest('.header__nav') && !e.target.closest('.header__menu-btn')) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClickOutside);
    };
  }, [menuOpen]);

  const handleClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.header
      className={`header ${scrolled ? 'header--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="header__inner">
        <a href="#top" className="header__logo" onClick={(e) => handleClick(e, '#top')}>
          <span className="header__logo-mark" aria-hidden="true">&lt;/&gt;</span>
          <span className="header__logo-text">prokyi</span>
        </a>

        {/* Current section indicator */}
        <AnimatePresence mode="wait">
          {active && scrolled && (
            <motion.span
              key={active}
              className="header__section-label"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              / {navItems.find(n => n.href === `#${active}`)?.label || active}
            </motion.span>
          )}
        </AnimatePresence>

        {viewedCount > 0 && (
          <motion.span
            className="header__viewed"
            key={viewedCount}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            aria-label={`${viewedCount}/${navItems.length}セクション閲覧済み`}
          >
            {viewedCount}/{navItems.length}
          </motion.span>
        )}

        <button
          className="header__theme-btn"
          aria-label={`テーマ切替: ${theme === 'cyber' ? 'Cyber Blue' : 'Hacker Green'}`}
          onClick={toggleTheme}
          title={theme === 'cyber' ? '🟢 Hacker Green' : '🔵 Cyber Blue'}
        >
          <motion.span
            key={theme}
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {theme === 'cyber' ? '🔵' : '🟢'}
          </motion.span>
        </button>

        <ShareButton />

        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`header__link ${active === item.href.slice(1) ? 'is-active' : ''}`}
              onClick={(e) => handleClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          className="header__menu-btn"
          aria-label="メニュー"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </div>
    </motion.header>
  );
}
