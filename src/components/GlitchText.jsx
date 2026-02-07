import { useState, useCallback, useRef, memo } from 'react';
import './GlitchText.css';

const GLITCH_CHARS = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾ01#$%&@';

/**
 * GlitchText — wraps text and applies a cyberpunk glitch scramble on hover.
 * Props: text (string), tag (element type, default 'span'), className, ariaLabel
 */
const GlitchText = memo(function GlitchText({ text, tag: Tag = 'span', className = '', ariaLabel }) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(null);
  const iterRef = useRef(0);

  const scramble = useCallback(() => {
    iterRef.current = 0;
    const maxIter = text.length;

    const tick = () => {
      iterRef.current += 1;
      const out = text
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iterRef.current) return text[i];
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        })
        .join('');
      setDisplay(out);
      if (iterRef.current < maxIter) {
        rafRef.current = setTimeout(tick, 30);
      }
    };
    tick();
  }, [text]);

  const reset = useCallback(() => {
    clearTimeout(rafRef.current);
    setDisplay(text);
  }, [text]);

  return (
    <Tag
      className={`glitch-text ${className}`}
      onMouseEnter={scramble}
      onMouseLeave={reset}
      aria-label={ariaLabel || text}
      data-text={text}
    >
      {display}
    </Tag>
  );
});

export default GlitchText;
