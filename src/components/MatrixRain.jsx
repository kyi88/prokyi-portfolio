import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MatrixRain.css';

const CHARS = 'アイウエオカキクケコサシスセソタチツテト01234567890#$%&@ぷろきぃ';

function MatrixRain() {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // Toggle with 'R' key
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setVisible(prev => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Canvas rain effect
  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const fontSize = 14;
    let columns, drops;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    };
    resize();
    window.addEventListener('resize', resize);

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--c-accent').trim() || '#4facfe';

    const draw = () => {
      ctx.fillStyle = 'rgba(6, 8, 15, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i] * fontSize;

        // Lead character brighter
        if (Math.random() > 0.3) {
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = accentColor;
          ctx.globalAlpha = 0.3;
        }

        ctx.fillText(char, i * fontSize, y);
        ctx.globalAlpha = 1;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // Slow down to ~20fps for authentic Matrix feel
    let lastTime = 0;
    const targetInterval = 50; // ms
    const throttledDraw = (time) => {
      if (time - lastTime >= targetInterval) {
        lastTime = time;
        ctx.fillStyle = 'rgba(6, 8, 15, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < columns; i++) {
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          const y = drops[i] * fontSize;

          ctx.fillStyle = accentColor;
          ctx.globalAlpha = Math.random() > 0.3 ? 0.9 : 0.3;
          ctx.fillText(char, i * fontSize, y);
          ctx.globalAlpha = 1;

          if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      rafRef.current = requestAnimationFrame(throttledDraw);
    };

    rafRef.current = requestAnimationFrame(throttledDraw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="matrix-rain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <canvas ref={canvasRef} className="matrix-rain__canvas" />
          <div className="matrix-rain__hint">Press R to exit</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(MatrixRain);
