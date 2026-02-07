import { useState, useEffect, useRef, memo } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコ01#$@%&*!?';

function TextScramble({ text, active, className = '' }) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const totalFrames = 30;
    const len = text.length;
    const tick = () => {
      const progress = frame / totalFrames;
      const settled = Math.floor(progress * len);
      let result = '';
      for (let i = 0; i < len; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < settled) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(result);
      frame++;
      if (frame <= totalFrames) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, text]);

  return <span className={className}>{display}</span>;
}

export default memo(TextScramble);
