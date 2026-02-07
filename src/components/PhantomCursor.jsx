import { useState, useEffect, useRef, memo, useCallback } from 'react';
import './PhantomCursor.css';

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const IDLE_TIMEOUT = 60000; // 60s (IntrusionAlert fires at 45s, this fires later)

/** Waypoints the phantom visits (section IDs or viewport coords) */
const SECTION_IDS = ['profile', 'career', 'goals', 'status', 'gadgets', 'links'];

function getWaypoints() {
  const pts = [];
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      pts.push({
        x: rect.left + rect.width * (0.2 + Math.random() * 0.6),
        y: rect.top + window.scrollY + rect.height * (0.2 + Math.random() * 0.6),
      });
    }
  }
  // Add some random spots
  pts.push(
    { x: window.innerWidth * 0.5, y: 200 },
    { x: window.innerWidth * 0.7, y: window.innerHeight * 0.5 },
  );
  return pts;
}

function PhantomCursor() {
  const [active, setActive] = useState(false);
  const cursorRef = useRef(null);
  const idleTimerRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const waypointIdx = useRef(0);
  const waypointsRef = useRef([]);
  const manualToggle = useRef(false);

  const resetIdleTimer = useCallback(() => {
    if (manualToggle.current) return;
    setActive(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setActive(true), IDLE_TIMEOUT);
  }, []);

  // Idle detection
  useEffect(() => {
    if (REDUCED_MOTION) return;
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'mousedown'];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    // Start initial timer
    idleTimerRef.current = setTimeout(() => setActive(true), IDLE_TIMEOUT);
    return () => {
      clearTimeout(idleTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, [resetIdleTimer]);

  // Manual toggle via CyberTerminal command
  useEffect(() => {
    const handler = () => {
      manualToggle.current = !manualToggle.current;
      setActive((prev) => !prev);
    };
    window.addEventListener('prokyi-phantom-toggle', handler);
    return () => window.removeEventListener('prokyi-phantom-toggle', handler);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!active || REDUCED_MOTION) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    waypointsRef.current = getWaypoints();
    if (waypointsRef.current.length === 0) return;
    waypointIdx.current = 0;
    const scrollY = window.scrollY;
    const firstWp = waypointsRef.current[0];
    posRef.current = { x: firstWp.x, y: firstWp.y - scrollY };
    targetRef.current = { ...posRef.current };
    pickNextTarget();

    function pickNextTarget() {
      waypointIdx.current = (waypointIdx.current + 1) % waypointsRef.current.length;
      const wp = waypointsRef.current[waypointIdx.current];
      targetRef.current = { x: wp.x, y: wp.y - window.scrollY };
    }

    let frameCount = 0;
    function animate() {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      const pos = posRef.current;
      const target = targetRef.current;
      const speed = 0.008;

      pos.x += (target.x - pos.x) * speed;
      pos.y += (target.y - pos.y) * speed;

      const el = cursorRef.current;
      if (el) {
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
      }

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        pickNextTarget();
      }

      frameCount++;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (REDUCED_MOTION) return null;

  return (
    <div
      ref={cursorRef}
      className={`phantom-cursor${active ? ' phantom-cursor--active' : ''}`}
      aria-hidden="true"
    />
  );
}

export default memo(PhantomCursor);
