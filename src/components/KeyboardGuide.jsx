import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './KeyboardGuide.css';

const shortcuts = [
  { keys: ['`'], desc: 'サイバーターミナルを開く' },
  { keys: ['↑↑↓↓←→←→BA'], desc: 'レトロモード(5秒)' },
  { keys: ['?'], desc: 'このヘルプを表示' },
  { keys: ['Esc'], desc: '閉じる' },
];

export default function KeyboardGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="kb-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="kb-panel"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="kb-panel__title">⌨️ Keyboard Shortcuts</h3>
            <ul className="kb-panel__list">
              {shortcuts.map((s, i) => (
                <li key={i} className="kb-panel__item">
                  <span className="kb-panel__keys">
                    {s.keys.map((k, ki) => (
                      <kbd key={ki} className="kb-panel__kbd">{k}</kbd>
                    ))}
                  </span>
                  <span className="kb-panel__desc">{s.desc}</span>
                </li>
              ))}
            </ul>
            <p className="kb-panel__hint">Press ? or Esc to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
