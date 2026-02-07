import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FPSMonitor.css';

function FPSMonitor() {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [mem, setMem] = useState(null);
  const rafRef = useRef(null);
  const framesRef = useRef(0);
  const lastRef = useRef(performance.now());

  // Toggle with 'F' key
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // FPS loop
  useEffect(() => {
    if (!visible) return;
    framesRef.current = 0;
    lastRef.current = performance.now();
    const tick = () => {
      framesRef.current++;
      const now = performance.now();
      const elapsed = now - lastRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((framesRef.current * 1000) / elapsed));
        framesRef.current = 0;
        lastRef.current = now;
        // Memory (Chrome only)
        if (performance.memory) {
          setMem(Math.round(performance.memory.usedJSHeapSize / 1048576));
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fps-monitor"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          aria-label="パフォーマンスモニター"
        >
          <span className={`fps-monitor__fps ${fps < 30 ? 'fps-monitor__fps--low' : ''}`}>
            {fps} FPS
          </span>
          {mem !== null && (
            <span className="fps-monitor__mem">{mem} MB</span>
          )}
          <span className="fps-monitor__hint">Press F to close</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(FPSMonitor);
