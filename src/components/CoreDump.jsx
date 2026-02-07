import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CoreDump.css';

const SECRET_ADDRS = {
  '0x0539': 'ぷろきぃの好きな数字は539',
  '0xDEAD': 'ゲップができない体質',
  '0xCAFE': 'コーヒー飲めない（カフェイン不耐性）',
  '0xBEEF': '牛乳も飲めない（乳糖不耐性）',
};

function textToHexRows(text) {
  const bytes = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code <= 0xff) {
      bytes.push(code);
    } else {
      // Multi-byte: push 2 bytes
      bytes.push((code >> 8) & 0xff, code & 0xff);
    }
  }
  const rows = [];
  for (let i = 0; i < bytes.length; i += 12) {
    const chunk = bytes.slice(i, i + 12);
    const addr = `0x${(i).toString(16).toUpperCase().padStart(4, '0')}`;
    const hex = chunk.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    const ascii = chunk.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    rows.push({ addr, hex, ascii });
  }
  return rows;
}

function gatherPageText() {
  if (!document.body) return '';
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    { acceptNode: (node) => {
      const el = node.parentElement;
      if (!el || el.closest('.coredump-overlay') || el.closest('script') || el.closest('style')) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }}
  );
  let text = '';
  while (walker.nextNode()) {
    text += walker.currentNode.textContent.trim() + ' ';
    if (text.length > 2000) break; // cap for performance
  }
  return text;
}

function injectSecrets(rows) {
  const secretAddrs = Object.keys(SECRET_ADDRS);
  const result = [...rows];
  // Replace specific addresses with secret content
  secretAddrs.forEach((addr) => {
    const msg = SECRET_ADDRS[addr];
    const fakeHex = Array.from(msg).map((_, i) => ((i * 7 + 0x41) % 0xff).toString(16).toUpperCase().padStart(2, '0')).join(' ').slice(0, 35);
    result.push({ addr, hex: fakeHex, ascii: msg.slice(0, 12), isSecret: true, fullMsg: msg });
  });
  // Sort by address
  result.sort((a, b) => parseInt(a.addr, 16) - parseInt(b.addr, 16));
  return result;
}

function CoreDump() {
  const [active, setActive] = useState(false);
  const [revealed, setRevealed] = useState(new Set());

  // Keyboard shortcut: Ctrl+Shift+D + ESC to close
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setActive((prev) => !prev);
      }
      if (e.key === 'Escape' && active) {
        e.preventDefault();
        setActive(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  // Terminal command toggle
  useEffect(() => {
    const handler = () => setActive((prev) => !prev);
    window.addEventListener('prokyi-coredump-toggle', handler);
    return () => window.removeEventListener('prokyi-coredump-toggle', handler);
  }, []);

  const rows = useMemo(() => {
    if (!active) return [];
    const text = gatherPageText();
    const baseRows = textToHexRows(text);
    return injectSecrets(baseRows);
  }, [active]);

  const handleSecretClick = useCallback((addr) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(addr);
      return next;
    });
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="coredump-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Core Dump Hex Viewer"
        >
          <div className="coredump-overlay__scanline" />
          <div className="coredump-overlay__header">
            <span>*** CORE DUMP — MEMORY SNAPSHOT @ {new Date().toLocaleTimeString('ja-JP')} ***</span>
            <button className="coredump-overlay__close" onClick={() => setActive(false)}>
              [ESC] CLOSE
            </button>
          </div>
          <div className="coredump-overlay__row" style={{ color: '#555', marginBottom: 8 }}>
            <span className="coredump-overlay__addr">OFFSET</span>
            <span className="coredump-overlay__hex">HEX DUMP</span>
            <span className="coredump-overlay__ascii">ASCII</span>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className={`coredump-overlay__row${row.isSecret ? ' coredump-overlay__row--secret' : ''}`}
              onClick={row.isSecret ? () => handleSecretClick(row.addr) : undefined}
              onKeyDown={row.isSecret ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSecretClick(row.addr); } } : undefined}
              role={row.isSecret ? 'button' : undefined}
              tabIndex={row.isSecret ? 0 : undefined}
              aria-label={row.isSecret ? `Secret address ${row.addr}` : undefined}
            >
              <span className="coredump-overlay__addr">{row.addr}</span>
              <span className="coredump-overlay__hex">{row.hex}</span>
              <span className="coredump-overlay__ascii">
                {row.isSecret && revealed.has(row.addr) ? row.fullMsg : row.ascii}
              </span>
            </div>
          ))}
          <div style={{ color: '#555', marginTop: 16 }}>
            --- END OF DUMP --- {rows.length} rows, {rows.length * 12} bytes analyzed
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(CoreDump);
