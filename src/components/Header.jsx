import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import './Header.css';

const navItems = [
  { href: '#profile', label: 'Profile' },
  { href: '#career', label: 'Career' },
  { href: '#goals', label: 'Goals' },
  { href: '#gadgets', label: 'Gadgets' },
  { href: '#links', label: 'Links' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      const sections = document.querySelectorAll('section[id]');
      const y = window.scrollY + 140;
      for (const s of sections) {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
          setActive(s.id);
          break;
        }
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
