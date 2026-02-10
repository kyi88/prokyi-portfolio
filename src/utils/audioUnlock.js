/**
 * audioUnlock.js — Force-unlock AudioContext as early as possible.
 *
 * Strategy (in order of aggressiveness):
 *  1. Silent <audio autoplay> with a tiny WAV data URI.
 *     Many desktop browsers allow autoplay without user gesture.
 *     When the silent clip plays, we piggyback resume() on that.
 *  2. Resume on mousemove / scroll / pointermove (lighter than click).
 *  3. Resume on pointerdown / keydown / touchstart (standard gestures).
 */

// Tiny 44-byte silent WAV encoded as base64
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

const _ctxSet = new Set();
let _unlockBound = false;

/** Register an AudioContext to be auto-unlocked. */
export function registerCtx(ctx) {
  if (!ctx) return;
  _ctxSet.add(ctx);
  _ensureUnlockListeners();
  // Immediate attempt
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

/** Resume ALL registered AudioContexts. */
function _resumeAll() {
  _ctxSet.forEach(ctx => {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  });
}

/** Set up unlock listeners once. */
function _ensureUnlockListeners() {
  if (_unlockBound) return;
  _unlockBound = true;

  // ▸ Strategy 1: Silent autoplay audio element
  try {
    const audio = document.createElement('audio');
    audio.src = SILENT_WAV;
    audio.volume = 0.01;          // near-silent
    audio.setAttribute('autoplay', '');
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';
    document.body.appendChild(audio);
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        _resumeAll();
        // Clean up
        setTimeout(() => { try { audio.remove(); } catch {} }, 500);
      }).catch(() => {
        // Autoplay blocked — fall through to gesture-based unlock
        try { audio.remove(); } catch {}
      });
    }
  } catch {}

  // ▸ Strategy 2 + 3: User gesture listeners (including mousemove & scroll)
  const events = [
    'mousemove', 'scroll', 'pointermove',          // lightweight
    'pointerdown', 'mousedown', 'keydown',          // standard gestures
    'touchstart', 'touchend',                       // mobile
  ];
  const handler = () => _resumeAll();
  events.forEach(e =>
    document.addEventListener(e, handler, { passive: true })
  );
}

// Auto-init on import (runs before any component mounts)
_ensureUnlockListeners();
