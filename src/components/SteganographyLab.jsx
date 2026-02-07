import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './SteganographyLab.css';

const PRESETS = [
  { emoji: '🐧', hidden: 'I use Arch btw (嘘、Ubuntu派)' },
  { emoji: '🍣', hidden: "prokyi's secret sushi recipe: sudo rm -rf /hunger" },
  { emoji: '🎮', hidden: 'AYN Thor MAX > Nintendo Switch (個人の感想)' },
  { emoji: '🤖', hidden: 'AI will not replace prokyi. prokyi IS the AI.' },
];
const GRID_SIZE = 16 * 8; // 128 pixels

function textToBits(text) {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('');
}

function bitsToText(bits) {
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return '???';
  }
}

function genPixels(bits) {
  const px = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const base = Math.floor(Math.random() * 100 + 50);
    const bit = i < bits.length ? Number(bits[i]) : 0;
    // Embed bit in LSB → slight color shift
    const r = (base & 0xFE) | bit;
    const g = Math.floor(Math.random() * 60 + 100);
    const b2 = Math.floor(Math.random() * 80 + 60);
    px.push({ r, g, b: b2, hasBit: i < bits.length });
  }
  return px;
}

function SteganographyLab() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('encode'); // 'encode' | 'decode'
  const [input, setInput] = useState('');
  const [pixels, setPixels] = useState([]);
  const [decoded, setDecoded] = useState('');
  const [bits, setBits] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-stegano-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-stegano-toggle', handler);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setInput('');
      setPixels([]);
      setDecoded('');
      setBits('');
      setActivePreset(null);
      setMode('encode');
    }
  }, [open]);

  const handleEncode = useCallback(() => {
    if (!input.trim()) return;
    const b = textToBits(input);
    setBits(b);
    setPixels(genPixels(b));
    setDecoded('');
  }, [input]);

  const handlePreset = useCallback((idx) => {
    const p = PRESETS[idx];
    setActivePreset(idx);
    setMode('decode');
    const b = textToBits(p.hidden);
    setBits(b);
    setPixels(genPixels(b));
    // Animate decode
    setDecoded('');
    let i = 0;
    const iv = setInterval(() => {
      i += 2;
      if (i >= b.length) {
        clearInterval(iv);
        setDecoded(p.hidden);
        return;
      }
      setDecoded(bitsToText(b.slice(0, i)));
    }, 30);
  }, []);

  const handleDecode = useCallback(() => {
    if (pixels.length === 0) return;
    const extractedBits = pixels.map((p) => p.r & 1).join('');
    const filtered = extractedBits.slice(0, bits.length || extractedBits.length);
    setDecoded(bitsToText(filtered));
  }, [pixels, bits]);

  if (!open) return null;

  return (
    <motion.div
      className="stegano-lab"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Steganography Lab"
      aria-modal="true"
    >
      <div className="stegano-lab__header">
        <span>🔒 STEGANOGRAPHY LAB</span>
        <button className="stegano-lab__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <div className="stegano-lab__body">
        <div className="stegano-lab__modes">
          <button
            className={`stegano-lab__btn${mode === 'encode' ? ' stegano-lab__btn--active' : ''}`}
            onClick={() => setMode('encode')}
          >ENCODE</button>
          <button
            className={`stegano-lab__btn${mode === 'decode' ? ' stegano-lab__btn--active' : ''}`}
            onClick={() => setMode('decode')}
          >DECODE</button>
        </div>

        {mode === 'decode' && (
          <div className="stegano-lab__presets">
            {PRESETS.map((p, i) => (
              <span
                key={i}
                className="stegano-lab__preset"
                onClick={() => handlePreset(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreset(i); } }}
                aria-label={`Decode preset ${i + 1}`}
              >{p.emoji}</span>
            ))}
          </div>
        )}

        {mode === 'encode' && (
          <>
            <input
              className="stegano-lab__input"
              placeholder="メッセージを入力..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEncode()}
              aria-label="Message to encode"
            />
            <button className="stegano-lab__btn" onClick={handleEncode} style={{ marginBottom: 8 }}>
              ▶ EMBED IN PIXELS
            </button>
          </>
        )}

        {mode === 'decode' && pixels.length > 0 && !activePreset && activePreset !== 0 && (
          <button className="stegano-lab__btn" onClick={handleDecode} style={{ marginBottom: 8 }}>
            🔍 EXTRACT HIDDEN DATA
          </button>
        )}

        <div className="stegano-lab__grid">
          {(pixels.length > 0 ? pixels : Array.from({ length: GRID_SIZE }, () => ({ r: 30, g: 30, b: 30, hasBit: false }))).map((p, i) => (
            <div
              key={i}
              className="stegano-lab__pixel"
              style={{
                background: `rgb(${p.r},${p.g},${p.b})`,
                boxShadow: p.hasBit ? '0 0 2px rgba(0,229,255,0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {decoded && (
          <div className="stegano-lab__output">
            &gt; {decoded}
          </div>
        )}

        {bits && (
          <div className="stegano-lab__bits">
            LSB: {bits.slice(0, 64)}{bits.length > 64 ? '…' : ''}
          </div>
        )}

        <div className="stegano-lab__status">
          {pixels.length > 0 ? `${GRID_SIZE} pixels | ${bits.length} bits embedded` : 'Select a preset to decode or switch to ENCODE mode'}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(SteganographyLab);
