import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommandPalette.css';

const commands = [
  { id: 'profile', label: '01 — 基本情報', target: '#profile' },
  { id: 'career', label: '02 — 学歴・経歴', target: '#career' },
  { id: 'goals', label: '03 — 今後の目標', target: '#goals' },
  { id: 'status', label: '04 — プレイヤーステータス', target: '#status' },
  { id: 'gadgets', label: '05 — ガジェット', target: '#gadgets' },
  { id: 'links', label: '06 — リンク / SNS', target: '#links' },
  { id: 'top', label: '▲  トップへ戻る', target: '#top' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.id.includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (target) => {
    setOpen(false);
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0].target);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="cmd-panel"
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmd-panel__input-wrap">
              <span className="cmd-panel__icon">▸</span>
              <input
                ref={inputRef}
                className="cmd-panel__input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="セクションへジャンプ..."
                autoComplete="off"
                spellCheck="false"
              />
              <kbd className="cmd-panel__kbd">Esc</kbd>
            </div>
            <ul className="cmd-panel__list">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    className="cmd-panel__item"
                    onClick={() => handleSelect(c.target)}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="cmd-panel__empty">一致するセクションがありません</li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
