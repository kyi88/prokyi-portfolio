import { useEffect, useRef, memo } from 'react';
import './NetworkGraph.css';

/**
 * NetworkGraph — animated skill relationship graph on <canvas>.
 * Nodes float gently and connected lines pulse with accent color.
 */

const NODES = [
  { id: 'python',     label: 'Python',     x: 0.25, y: 0.25 },
  { id: 'javascript', label: 'JS',         x: 0.75, y: 0.20 },
  { id: 'react',      label: 'React',      x: 0.60, y: 0.55 },
  { id: 'linux',      label: 'Linux',      x: 0.20, y: 0.70 },
  { id: 'docker',     label: 'Docker',     x: 0.45, y: 0.80 },
  { id: 'ai',         label: 'AI/ML',      x: 0.15, y: 0.45 },
  { id: 'node',       label: 'Node',       x: 0.80, y: 0.50 },
  { id: 'git',        label: 'Git',        x: 0.50, y: 0.35 },
];

const EDGES = [
  ['python', 'ai'],
  ['python', 'linux'],
  ['javascript', 'react'],
  ['javascript', 'node'],
  ['react', 'node'],
  ['linux', 'docker'],
  ['docker', 'node'],
  ['git', 'python'],
  ['git', 'javascript'],
  ['git', 'react'],
  ['ai', 'docker'],
];

const NetworkGraph = memo(function NetworkGraph() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;

    // Build mutable node positions
    const nodes = NODES.map(n => ({
      ...n,
      px: 0, py: 0,
      ox: n.x, oy: n.y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      amp: 4 + Math.random() * 6,
    }));

    const edgeIdx = EDGES.map(([a, b]) => [
      nodes.findIndex(n => n.id === a),
      nodes.findIndex(n => n.id === b),
    ]);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Update pixel positions
      for (const n of nodes) {
        n.px = n.ox * w;
        n.py = n.oy * h;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let accentCache = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe';
    const onTheme = () => { accentCache = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#4facfe'; };
    window.addEventListener('prokyi-theme-sync', onTheme);

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !raf) raf = requestAnimationFrame(draw);
    }, { threshold: 0 });
    observer.observe(canvas);

    const draw = (time) => {
      if (!isVisible) { raf = null; return; }
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.001;
      const col = accentCache;

      // Update positions
      for (const n of nodes) {
        n.px = n.ox * w + Math.sin(t * n.speed + n.phase) * n.amp;
        n.py = n.oy * h + Math.cos(t * n.speed * 0.7 + n.phase) * n.amp;
      }

      // Draw edges
      for (const [ai, bi] of edgeIdx) {
        const a = nodes[ai];
        const b = nodes[bi];
        const pulse = 0.15 + 0.1 * Math.sin(t * 2 + ai + bi);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.strokeStyle = col;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw nodes
      ctx.globalAlpha = 1;
      for (const n of nodes) {
        // Glow
        ctx.beginPath();
        ctx.arc(n.px, n.py, 8, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.15;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(n.px, n.py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        // Label
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.7;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.px, n.py - 12);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('prokyi-theme-sync', onTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="network-graph">
      <span className="network-graph__label">SKILL NETWORK</span>
      <canvas ref={canvasRef} className="network-graph__canvas" aria-hidden="true" />
    </div>
  );
});

export default NetworkGraph;
