import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
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
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Apply theme with flash transition
  useEffect(() => {
    if (theme === 'green') {
      document.documentElement.setAttribute('data-theme', 'green');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('prokyi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Flash effect on toggle
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;background:var(--c-accent);opacity:0.08;transition:opacity 0.4s;';
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '0'; });
    setTimeout(() => flash.remove(), 500);
    setTheme(prev => prev === 'cyber' ? 'green' : 'cyber');
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      const sections = document.querySelectorAll('section[id]');
      const y = window.scrollY + 140;
      const seen = new Set(viewedRef.current);
      for (const s of sections) {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
          setActive(s.id);
          seen.add(s.id);
        }
      }
      if (seen.size !== viewedRef.current.size) {
        viewedRef.current = seen;
        setViewedCount(seen.size);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

      {/* Scroll progress bar */}
      <motion.div
        className="header__progress"
        style={{ scaleX, transformOrigin: '0%' }}
        aria-hidden="true"
      />
    </motion.header>
  );
}
