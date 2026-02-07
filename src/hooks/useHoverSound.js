import { useCallback, useRef, useContext } from 'react';
import { SoundContext } from '../App';

/**
 * useHoverSound — plays a tiny blip on hover via Web Audio API.
 * Respects global mute from SoundContext.
 * Returns { onMouseEnter } to spread onto the target element.
 */
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export default function useHoverSound(freq = 880, duration = 0.04, volume = 0.08) {
  const { muted } = useContext(SoundContext);
  const lastPlay = useRef(0);

  const onMouseEnter = useCallback(() => {
    if (muted) return;
    // Throttle: at most once per 100ms
    const now = Date.now();
    if (now - lastPlay.current < 100) return;
    lastPlay.current = now;

    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors (autoplay policy etc)
    }
  }, [muted, freq, duration, volume]);

  return { onMouseEnter };
}
