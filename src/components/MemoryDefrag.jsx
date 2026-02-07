import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './MemoryDefrag.css';

const COLS = 16;
const ROWS = 10;
const TOTAL = COLS * ROWS;

const SECTIONS = ['profile', 'career', 'goals', 'gadgets', 'links', 'system'];
const SECTION_LABELS = { profile: 'Profile', career: 'Career', goals: 'Goals', gadgets: 'Gadgets', links: 'Links', system: 'System' };

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFragmented() {
  const blocks = [];
  // ~60% used, 40% free
  for (let i = 0; i < TOTAL; i++) {
    if (Math.random() < 0.6) {
      blocks.push(SECTIONS[Math.floor(Math.random() * SECTIONS.length)]);
    } else {
      blocks.push('free');
    }
  }
  return blocks;
}

function generateOptimized(fragmented) {
  // Group used blocks by section, then free
  const used = fragmented.filter((b) => b !== 'free');
  const freeCount = TOTAL - used.length;
  // Sort by section order
  used.sort((a, b) => SECTIONS.indexOf(a) - SECTIONS.indexOf(b));
  return [...used, ...Array(freeCount).fill('free')];
}

function MemoryDefrag() {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState(() => generateFragmented());
  const [defragging, setDefragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('FRAGMENTED — Ready to optimize');
  const timerRef = useRef(null);
  const targetRef = useRef([]);

  // Toggle: event
  useEffect(() => {
    const handler = () => setOpen((p) => !p);
    window.addEventListener('prokyi-defrag-toggle', handler);
    return () => window.removeEventListener('prokyi-defrag-toggle', handler);
  }, []);

  // Cleanup
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      setBlocks(generateFragmented());
      setDefragging(false);
      setProgress(0);
      setStatus('FRAGMENTED — Ready to optimize');
    }
  }, [open]);

  const startDefrag = useCallback(() => {
    if (defragging) return;
    const target = generateOptimized(blocks);
    targetRef.current = target;
    setDefragging(true);
    setStatus('DEFRAGMENTING...');
    let step = 0;
    const totalSteps = TOTAL;
    timerRef.current = setInterval(() => {
      if (step >= totalSteps) {
        clearInterval(timerRef.current);
        setDefragging(false);
        setProgress(100);
        setStatus('MEMORY OPTIMIZED — SYSTEM PERFORMANCE +42%');
        return;
      }
      setBlocks((prev) => {
        const next = [...prev];
        next[step] = targetRef.current[step];
        return next;
      });
      step++;
      setProgress(Math.round((step / totalSteps) * 100));
    }, 40);
  }, [defragging, blocks]);

  if (!open) return null;

  return (
    <motion.div
      className="memory-defrag"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Memory Defragmenter"
    >
      <div className="memory-defrag__header">
        <span>💾 DEFRAG /dev/sda1</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {!defragging && progress < 100 && (
            <button className="memory-defrag__btn" onClick={startDefrag}>▶ DEFRAG</button>
          )}
          <button className="memory-defrag__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>
      <div className="memory-defrag__grid">
        {blocks.map((b, i) => (
          <div
            key={i}
            className={`memory-defrag__block memory-defrag__block--${b}`}
            title={b === 'free' ? 'Free' : `${SECTION_LABELS[b] || b} @ 0x${(i * 4096).toString(16).toUpperCase()}`}
          />
        ))}
      </div>
      <div className="memory-defrag__progress">
        <div className="memory-defrag__progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="memory-defrag__status">{status} — {progress}%</div>
      <div className="memory-defrag__legend">
        {SECTIONS.map((s) => (
          <div key={s} className="memory-defrag__legend-item">
            <div className={`memory-defrag__legend-swatch memory-defrag__block--${s}`} />
            <span>{SECTION_LABELS[s]}</span>
          </div>
        ))}
        <div className="memory-defrag__legend-item">
          <div className="memory-defrag__legend-swatch memory-defrag__block--free" />
          <span>Free</span>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(MemoryDefrag);
