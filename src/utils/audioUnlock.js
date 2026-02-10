/**
 * audioUnlock.js — Force-unlock AudioContext as early as possible.
 *
 * Chrome requires a user activation (pointerdown/keydown/touchend etc.)
 * before AudioContext.resume() will succeed.
 *
 * Strategy:
 *  1. Silent <audio autoplay> — works on some desktop browsers.
 *  2. pointerdown / mousedown / keydown / touchstart / touchend —
 *     the lightest real user gestures that grant user activation.
 *  3. Poll + statechange event for immediate flush on unlock.
 */

// Tiny silent WAV
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

const _ctxSet = new Set();
let _unlockBound = false;
let _unlocked = false;

/** Register an AudioContext to be auto-unlocked. */
export function registerCtx(ctx) {
  if (!ctx) return;
  _ctxSet.add(ctx);
  _ensureUnlockListeners();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  if (ctx.state === 'running') _unlocked = true;
}

export function isUnlocked() { return _unlocked; }

/** Resume ALL registered AudioContexts. */
function _resumeAll() {
  _ctxSet.forEach(ctx => {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => { _unlocked = true; }).catch(() => {});
    }
    if (ctx.state === 'running') _unlocked = true;
  });
}

function _ensureUnlockListeners() {
  if (_unlockBound) return;
  _unlockBound = true;

  // Strategy 1: Silent autoplay
  try {
    const audio = document.createElement('audio');
    audio.src = SILENT_WAV;
    audio.volume = 0.01;
    audio.setAttribute('autoplay', '');
    audio.setAttribute('playsinline', '');
    audio.style.display = 'none';
    document.body?.appendChild(audio);
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        _resumeAll();
        setTimeout(() => { try { audio.remove(); } catch {} }, 500);
      }).catch(() => {
        try { audio.remove(); } catch {}
      });
    }
  } catch {}

  // Strategy 2: User activation events (these actually unlock AudioContext)
  const gestureEvents = [
    'pointerdown', 'pointerup', 'mousedown',
    'keydown', 'touchstart', 'touchend',
  ];
  const handler = () => {
    _resumeAll();
    // Once unlocked, remove all listeners
    if (_unlocked) {
      gestureEvents.forEach(e => document.removeEventListener(e, handler));
    }
  };
  gestureEvents.forEach(e =>
    document.addEventListener(e, handler, { passive: true })
  );
}

// Auto-init on import
if (typeof document !== 'undefined') {
  if (document.body) {
    _ensureUnlockListeners();
  } else {
    document.addEventListener('DOMContentLoaded', _ensureUnlockListeners, { once: true });
  }
}
