import { useEffect, memo } from 'react';
import './ClickSpark.css';

/**
 * ClickSpark — generates a burst of sparks on every click.
 * Purely decorative, respects prefers-reduced-motion.
 */
function ClickSpark() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers = new Set();

    const onClick = (e) => {
      const count = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'click-spark';
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const dist = 30 + Math.random() * 50;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = 2 + Math.random() * 3;
        spark.style.cssText = `
          left:${e.clientX}px;top:${e.clientY}px;
          width:${size}px;height:${size}px;
          --dx:${dx}px;--dy:${dy}px;
        `;
        document.body.appendChild(spark);
        const cleanup = () => { spark.remove(); timers.delete(tid); };
        spark.addEventListener('animationend', cleanup, { once: true });
        const tid = setTimeout(cleanup, 700);
        timers.add(tid);
      }
    };

    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
      timers.forEach(t => clearTimeout(t));
      document.querySelectorAll('.click-spark').forEach(el => el.remove());
    };
  }, []);

  return null;
}

export default memo(ClickSpark);
