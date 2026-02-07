import { useRef, useCallback, memo } from 'react';
import './GlowCard.css';

/**
 * GlowCard — a card wrapper with a mouse-following spotlight glow.
 * Uses CSS custom properties for smooth spotlight positioning.
 */
function GlowCard({ children, className = '' }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--gx', `${x}%`);
    el.style.setProperty('--gy', `${y}%`);
    el.style.setProperty('--glow-opacity', '1');
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--glow-opacity', '0');
  }, []);

  return (
    <div
      ref={ref}
      className={`glow-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="glow-card__spot" aria-hidden="true" />
      {children}
    </div>
  );
}

export default memo(GlowCard);
