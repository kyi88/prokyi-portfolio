import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StomachGame from './StomachGame';
import './EasterEggFab.css';

export default function EasterEggFab() {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(false);

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
              onClick={() => { setGame(true); setOpen(false); }}>
              🚨 STOMACH DEFENSE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {game && <StomachGame onClose={() => setGame(false)} />}
      </AnimatePresence>
    </>
  );
}
