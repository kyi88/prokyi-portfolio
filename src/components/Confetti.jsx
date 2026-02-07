import { useEffect, memo } from 'react';
import './Confetti.css';

/**
 * Confetti — burst of celebratory particles.
 * Rendered once, auto-removes after animation.
 */
const COLORS = ['#4facfe', '#00f2fe', '#a855f7', '#f59e0b', '#22d3a7', '#ff2d87'];
const PARTICLE_COUNT = 50;

const Confetti = memo(function Confetti() {
  useEffect(() => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const x = 50 + (Math.random() - 0.5) * 40; // vw
      const delay = Math.random() * 0.5;
      const dur = 1.5 + Math.random() * 1.5;
      const drift = (Math.random() - 0.5) * 200;
      const rot = Math.random() * 720 - 360;
      const size = 4 + Math.random() * 6;
      p.style.cssText = `
        left:${x}vw;
        width:${size}px;height:${size * 0.6}px;
        background:${color};
        animation-delay:${delay}s;
        animation-duration:${dur}s;
        --drift:${drift}px;
        --rot:${rot}deg;
      `;
      container.appendChild(p);
    }

    const cleanup = setTimeout(() => container.remove(), 4000);
    return () => { clearTimeout(cleanup); container.remove(); };
  }, []);

  return null;
});

export default Confetti;
