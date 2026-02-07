import { useState, useEffect, useRef, useCallback, memo } from 'react';
import './SurveillanceFeed.css';

const CAMERAS = [
  { id: 'CAM-01', section: 'profile', label: 'PROFILE' },
  { id: 'CAM-02', section: 'career', label: 'CAREER' },
  { id: 'CAM-03', section: 'goals', label: 'GOALS' },
  { id: 'CAM-04', section: 'status', label: 'STATUS' },
  { id: 'CAM-05', section: 'gadgets', label: 'GADGETS' },
  { id: 'CAM-06', section: 'links', label: 'LINKS' },
];

const CYCLE_MS = 8000; // 8s per camera

/**
 * SurveillanceFeed — CCTV-style mini PiP showing section names,
 * auto-cycling through cameras with VHS effects.
 * Click to scroll to that section.
 */
function SurveillanceFeed() {
  const [camIdx, setCamIdx] = useState(0);
  const [noise, setNoise] = useState(false);
  const [time, setTime] = useState('');
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const cycleRef = useRef(null);
  const noiseRef = useRef(null);
  const listenersRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Auto-cycle cameras
  useEffect(() => {
    cycleRef.current = setInterval(() => {
      setNoise(true);
      clearTimeout(noiseRef.current);
      noiseRef.current = setTimeout(() => setNoise(false), 300);
      setCamIdx((prev) => (prev + 1) % CAMERAS.length);
    }, CYCLE_MS);
    return () => {
      clearInterval(cycleRef.current);
      clearTimeout(noiseRef.current);
    };
  }, []);

  // Timestamp update
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('ja-JP'));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  // Click to scroll to section (only if not dragging)
  const handleClick = useCallback(() => {
    if (isDragging.current) return;
    const cam = CAMERAS[camIdx];
    const el = document.getElementById(cam.section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [camIdx]);

  // Drag support — with unmount cleanup via listenersRef
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        window.removeEventListener('pointermove', listenersRef.current.onMove);
        window.removeEventListener('pointerup', listenersRef.current.onUp);
        listenersRef.current = null;
      }
    };
  }, []);

  const handlePointerDown = useCallback((e) => {
    const el = dragRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    isDragging.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };

    const onMove = (ev) => {
      const dx = ev.clientX - startPos.current.x;
      const dy = ev.clientY - startPos.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) isDragging.current = true;
      const x = ev.clientX - offsetRef.current.x;
      const y = ev.clientY - offsetRef.current.y;
      el.style.left = `${Math.max(0, Math.min(window.innerWidth - 180, x))}px`;
      el.style.top = `${Math.max(0, Math.min(window.innerHeight - 120, y))}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      listenersRef.current = null;
    };

    listenersRef.current = { onMove, onUp };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  const cam = CAMERAS[camIdx];

  return (
    <div
      ref={dragRef}
      className="surveillance-feed"
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
      onClick={handleClick}
      title={`Click to scroll to ${cam.label}`}
    >
      <div className="surveillance-feed__content">
        <div className="surveillance-feed__label">{cam.label}</div>
        <div className="surveillance-feed__crosshair" />
        <div className="surveillance-feed__scanlines" />
        <div className={`surveillance-feed__noise${noise ? ' surveillance-feed__noise--active' : ''}`} />
        <div className="surveillance-feed__hud">
          <span className="surveillance-feed__rec">
            <span className="surveillance-feed__rec-dot" />
            REC
          </span>
          <span>{time}</span>
        </div>
        <div className="surveillance-feed__sector">{cam.id}</div>
      </div>
    </div>
  );
}

export default memo(SurveillanceFeed);
