import { useCallback, useRef } from 'react';
import { getGlobalCtx } from '../utils/audioUnlock';

/**
 * UI効果音フック
 * @param {'click'|'hover'|'success'|'warning'} soundType 
 * @returns {object} { play: () => void }
 */
export function useEffectSound(soundType = 'click') {
  const audioCtxRef = useRef(null);

  const play = useCallback(() => {
    try {
      if (localStorage.getItem('prokyi_muted') === 'true') return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = getGlobalCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state !== 'running') return;

      switch (soundType) {
        case 'click': playClickSound(ctx); break;
        case 'hover': playHoverSound(ctx); break;
        case 'success': playSuccessSound(ctx); break;
        case 'warning': playWarningSound(ctx); break;
        default: playClickSound(ctx);
      }
    } catch (_) {}
  }, [soundType]);

  return { play };
}

function playClickSound(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 600;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.stop(ctx.currentTime + 0.08);
}

function playHoverSound(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(550, ctx.currentTime + 0.06);
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.stop(ctx.currentTime + 0.06);
}

function playSuccessSound(ctx) {
  const freqs = [523, 659, 784]; // C5, E5, G5
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const delay = i * 0.03;
    gain.gain.setValueAtTime(0.05, ctx.currentTime + delay);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
    osc.stop(ctx.currentTime + delay + 0.12);
  });
}

function playWarningSound(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);
  gain.gain.value = 0.04;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.stop(ctx.currentTime + 0.1);
}
