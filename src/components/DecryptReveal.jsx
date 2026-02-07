import { useState, useEffect, useRef, memo } from 'react';
import './DecryptReveal.css';

const CIPHER_CHARS = '▓█▒░ΨΔΩ∑λΞΠ₿⌐¥£€∞≈♦◊◄►▲▼ABCDEF0123456789';
const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * DecryptReveal — text starts as cipher glyphs and "decrypts" char-by-char
 * Uses IntersectionObserver to trigger on viewport entry (once).
 */
function DecryptReveal({ text, speed = 50, cycles = 4 }) {
  const wrapRef = useRef(null);
  const [chars, setChars] = useState(() =>
    text.split('').map((ch) => ({
      target: ch,
      display: ch === ' ' ? ' ' : CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)],
      settled: ch === ' ',
    }))
  );
  const [started, setStarted] = useState(false);
  const rafRef = useRef(null);

  /* Sync with text prop changes */
  useEffect(() => {
    setChars(
      text.split('').map((ch) => ({
        target: ch,
        display: ch === ' ' ? ' ' : CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)],
        settled: ch === ' ',
      }))
    );
    setStarted(false);
  }, [text]);

  /* IntersectionObserver — fire once */
  useEffect(() => {
    if (REDUCED_MOTION) {
      setChars((prev) => prev.map((c) => ({ ...c, display: c.target, settled: true })));
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [text]);

  /* Decrypt animation loop */
  useEffect(() => {
    if (!started) return;
    const totalChars = text.length;
    let frame = 0;
    const charDelay = speed; // ms between each char settling
    const totalCycles = cycles;

    const iv = setInterval(() => {
      frame++;
      setChars((prev) => {
        const next = prev.map((c, i) => {
          if (c.settled) return c;
          const settleFrame = (i + 1) * totalCycles;
          if (frame >= settleFrame) {
            return { ...c, display: c.target, settled: true };
          }
          // Still scrambling
          return {
            ...c,
            display: CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)],
          };
        });
        // Stop when all settled
        if (next.every((c) => c.settled)) {
          clearInterval(iv);
        }
        return next;
      });
      // Safety cap
      if (frame > totalChars * totalCycles + 5) clearInterval(iv);
    }, charDelay);

    rafRef.current = iv;
    return () => clearInterval(iv);
  }, [started, text, speed, cycles]);

  return (
    <span className="decrypt-reveal" ref={wrapRef} aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={i}
          className={`decrypt-reveal__char${
            c.settled
              ? ' decrypt-reveal__char--settled'
              : ' decrypt-reveal__char--scrambling'
          }`}
          aria-hidden="true"
        >
          {c.display}
        </span>
      ))}
    </span>
  );
}

export default memo(DecryptReveal);
