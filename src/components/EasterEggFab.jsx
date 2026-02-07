import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StomachGame from './StomachGame';
import TypingGame from './TypingGame';
import './EasterEggFab.css';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export default function EasterEggFab() {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(null); // null | 'stomach' | 'typing'
  const [konami, setKonami] = useState(false);
  const [konamiIdx, setKonamiIdx] = useState(0);
  const konamiTimerRef = useRef(null);

  // Konami code listener
  useEffect(() => {
    const handler = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[konamiIdx]) {
        const next = konamiIdx + 1;
        if (next === KONAMI.length) {
          setKonami(true);
          setKonamiIdx(0);
          document.documentElement.classList.add('retro-mode');
          clearTimeout(konamiTimerRef.current);
          konamiTimerRef.current = setTimeout(() => {
            document.documentElement.classList.remove('retro-mode');
            setKonami(false);
          }, 5000);
        } else {
          setKonamiIdx(next);
        }
      } else {
        setKonamiIdx(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [konamiIdx]);

  // Cleanup konami timer on unmount
  useEffect(() => () => {
    clearTimeout(konamiTimerRef.current);
    document.documentElement.classList.remove('retro-mode');
  }, []);

  return (
    <>
      <motion.button className="ee-fab" onClick={() => setOpen(p => !p)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        aria-label="イースターエッグメニュー" aria-expanded={open}>
        🎮
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div className="ee-menu" role="menu"
            initial={{ opacity: 0, y: 16, scale: .85 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: .85 }}>
            <button className="ee-menu__btn" role="menuitem"
              onClick={() => { setGame('stomach'); setOpen(false); }}>
              🚨 STOMACH DEFENSE
            </button>
            <button className="ee-menu__btn" role="menuitem"
              onClick={() => { setGame('typing'); setOpen(false); }}>
              ⌨️ HACK_TYPING
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {game === 'stomach' && <StomachGame onClose={() => setGame(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {game === 'typing' && <TypingGame onClose={() => setGame(null)} />}
      </AnimatePresence>

      {/* Konami code activation flash */}
      <AnimatePresence>
        {konami && (
          <motion.div className="konami-flash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            aria-live="polite">
            <span className="konami-flash__text">⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️</span>
            <span className="konami-flash__sub">RETRO MODE ACTIVATED</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
