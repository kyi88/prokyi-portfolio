import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntrusionAlert.css';

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ALERTS = {
  bruteforce: {
    title: '⚠ BRUTE FORCE DETECTED',
    sub: 'Abnormal click frequency — countermeasures engaged',
    duration: 2500,
    clickable: false,
  },
  idle: {
    title: '⏳ SESSION TIMEOUT',
    sub: 'No activity detected — click to re-authenticate',
    duration: 0, // dismiss on click
    clickable: true,
  },
  devtools: {
    title: '🔓 UNAUTHORIZED ACCESS ATTEMPT',
    sub: 'Developer tools intrusion detected',
    duration: 3000,
    clickable: false,
  },
};

/** Security log stored in session for CyberTerminal */
const securityLog = [];
export function getSecurityLog() {
  return securityLog;
}

function logAlert(type) {
  securityLog.push({
    type,
    time: new Date().toLocaleTimeString('ja-JP'),
    ts: Date.now(),
  });
}

function IntrusionAlert() {
  const [active, setActive] = useState(null); // current alert key
  const clickTimesRef = useRef([]);
  const idleTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const devtoolsChecked = useRef(false);
  const alertCooldown = useRef(0); // prevent spam

  const showAlert = useCallback((type) => {
    if (REDUCED_MOTION) return;
    if (Date.now() - alertCooldown.current < 5000) return; // 5s cooldown
    alertCooldown.current = Date.now();
    logAlert(type);
    setActive(type);
    const cfg = ALERTS[type];
    if (cfg.duration > 0) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => setActive(null), cfg.duration);
    }
  }, []);

  /* Brute force detection — 8 clicks in 2 seconds */
  useEffect(() => {
    if (REDUCED_MOTION) return;
    const handler = () => {
      const now = Date.now();
      const times = clickTimesRef.current;
      times.push(now);
      // Keep only last 2 seconds
      while (times.length > 0 && now - times[0] > 2000) times.shift();
      if (times.length >= 8) {
        showAlert('bruteforce');
        // Fire confetti as "countermeasure"
        window.dispatchEvent(new CustomEvent('prokyi-confetti'));
        times.length = 0;
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showAlert]);

  /* Idle detection — 45 seconds no interaction */
  useEffect(() => {
    if (REDUCED_MOTION) return;
    const reset = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => showAlert('idle'), 45000);
    };
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(idleTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [showAlert]);

  /* DevTools detection (rough heuristic) — check once on mount */
  useEffect(() => {
    if (REDUCED_MOTION || devtoolsChecked.current) return;
    devtoolsChecked.current = true;
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 300;
      if (widthThreshold || heightThreshold) {
        showAlert('devtools');
      }
    };
    // Check after a short delay to let browser settle
    const t = setTimeout(check, 3000);
    return () => clearTimeout(t);
  }, [showAlert]);

  /* Click to dismiss idle alert */
  const handleClick = useCallback(() => {
    if (active && ALERTS[active]?.clickable) {
      setActive(null);
      // Reset idle timer
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => showAlert('idle'), 45000);
    }
  }, [active, showAlert]);

  /* Cleanup */
  useEffect(() => {
    return () => {
      clearTimeout(dismissTimerRef.current);
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  const cfg = active ? ALERTS[active] : null;

  return (
    <AnimatePresence>
      {cfg && (
        <motion.div
          className={`intrusion-overlay${cfg.clickable ? ' intrusion-overlay--clickable' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClick}
          role={cfg.clickable ? 'dialog' : 'alert'}
          aria-live="assertive"
        >
          <div className="intrusion-overlay__scanline" />
          <div className="intrusion-overlay__border" />
          <div className="intrusion-overlay__title">{cfg.title}</div>
          <div className="intrusion-overlay__sub">{cfg.sub}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(IntrusionAlert);
