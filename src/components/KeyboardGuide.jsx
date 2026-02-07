import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './KeyboardGuide.css';

const shortcuts = [
  { keys: ['Ctrl+K'], desc: 'クイックジャンプパレット' },
  { keys: ['`'], desc: 'サイバーターミナルを開く' },
  { keys: ['M'], desc: 'ミニマップ表示切替' },
  { keys: ['G'], desc: 'Ghost Protocol (UV スキャン)' },
  { keys: ['R'], desc: 'マトリックスレイン切替' },
  { keys: ['F'], desc: 'FPSモニター切替' },
  { keys: ['S'], desc: 'シグナルインターセプター切替' },
  { keys: ['Ctrl+Shift+D'], desc: 'コアダンプHexビューア' },
  { keys: ['Ctrl+Shift+S'], desc: 'CRTスキャンライン切替' },
  { keys: ['↑↑↓↓←→←→BA'], desc: 'レトロモード(5秒)' },
  { keys: ['?'], desc: 'このヘルプを表示' },
  { keys: ['Esc'], desc: '閉じる' },
];

export default function KeyboardGuide() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName;
        if (['INPUT', 'TEXTAREA'].includes(tag) || document.activeElement?.isContentEditable) return;
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

  // Focus management: save previous focus, focus panel on open, restore on close
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement;
      requestAnimationFrame(() => panelRef.current?.focus());
    } else if (prevFocusRef.current) {
      prevFocusRef.current.focus();
      prevFocusRef.current = null;
    }
  }, [open]);

  // Trap focus within the dialog
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Tab') {
        // Keep focus within the panel
        e.preventDefault();
        panelRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="キーボードショートカット"
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
