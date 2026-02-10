/**
 * audioUnlock.js — Global shared AudioContext singleton.
 *
 * Creates AudioContext at the EARLIEST possible moment (script load)
 * to catch the brief user-activation window from page navigation.
 * Also installs gesture listeners to unlock it on first interaction.
 *
 * All sound code should use getGlobalCtx() instead of creating its own.
 */

let _ctx = null;
let _unlocked = false;
const _onUnlockCallbacks = [];

/** Get the global shared AudioContext. Created on first call. */
export function getGlobalCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Immediately try resume — may succeed if navigation provides activation
    _ctx.resume().then(() => {
      _unlocked = true;
      _fireCallbacks();
    }).catch(() => {});
    if (_ctx.state === 'running') {
      _unlocked = true;
    }
    // Watch for external resume
    _ctx.addEventListener('statechange', () => {
      if (_ctx.state === 'running' && !_unlocked) {
        _unlocked = true;
        _fireCallbacks();
      }
    });
  }
  return _ctx;
}

export function isUnlocked() { return _unlocked; }

/** Register a callback to be fired once when AudioContext is unlocked. */
export function onUnlock(cb) {
  if (_unlocked) { cb(); return; }
  _onUnlockCallbacks.push(cb);
}

function _fireCallbacks() {
  while (_onUnlockCallbacks.length) {
    try { _onUnlockCallbacks.shift()(); } catch {}
  }
}

/** Legacy compat — registers external AudioContext for unlock. */
export function registerCtx(ctx) {
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  // Install gesture handler for this ctx too
  const resume = () => { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); };
  _gestureHandlers.push(resume);
}

const _gestureHandlers = [];

function _installGestureListeners() {
  const events = [
    'pointerdown', 'pointerup', 'mousedown',
    'keydown', 'touchstart', 'touchend',
  ];
  const handler = () => {
    // Resume global ctx
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume().then(() => {
        _unlocked = true;
        _fireCallbacks();
      }).catch(() => {});
    }
    if (_ctx && _ctx.state === 'running') {
      _unlocked = true;
      _fireCallbacks();
    }
    // Resume any registered external contexts
    _gestureHandlers.forEach(fn => fn());
    // Cleanup once unlocked
    if (_unlocked) {
      events.forEach(e => document.removeEventListener(e, handler));
    }
  };
  events.forEach(e =>
    document.addEventListener(e, handler, { passive: true })
  );
}

// ═══ Auto-init: create ctx + install listeners ASAP ═══
getGlobalCtx();
_installGestureListeners();
