import { useEffect, useRef, useCallback, memo } from 'react';
import { useSoundMuted } from '../contexts/SoundContext';

/* ═══════════════════════════════════════════════════════════════
   ProceduralBGM — Generative cyberpunk ambient soundtrack
   ───────────────────────────────────────────────────────────────
   Every visit produces a unique, evolving soundscape:
   • Pad:   slow-evolving filtered chords (warmth layer)
   • Bass:  deep sub-bass drone (foundation)
   • Arp:   randomised arpeggiated patterns (movement layer)
   • Perc:  subtle hi-hat / noise ticks (rhythm)
   • FX:    sweep risers on section scroll
   ═══════════════════════════════════════════════════════════════ */

/* ── Note data ── */
const SCALES = {
  minor:     ['C3','D3','Eb3','F3','G3','Ab3','Bb3','C4','D4','Eb4','F4','G4'],
  phrygian:  ['C3','Db3','Eb3','F3','G3','Ab3','Bb3','C4','Db4','Eb4','F4','G4'],
  dorian:    ['C3','D3','Eb3','F3','G3','A3','Bb3','C4','D4','Eb4','F4','G4'],
};
const CHORD_PROG = [
  ['C3','Eb3','G3','Bb3'],
  ['Ab2','C3','Eb3','G3'],
  ['F2','Ab2','C3','Eb3'],
  ['G2','Bb2','D3','F3'],
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randRange = (a, b) => a + Math.random() * (b - a);

/* ── Lazy-load Tone.js ── */
let ToneModule = null;
const loadTone = () => {
  if (ToneModule) return Promise.resolve(ToneModule);
  return import('tone').then(m => { ToneModule = m; return m; });
};

function ProceduralBGM() {
  const muted = useSoundMuted();
  const engineRef = useRef(null);
  const startedRef = useRef(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  /* ── Build audio engine ── */
  const buildEngine = useCallback(async () => {
    const Tone = await loadTone();
    if (engineRef.current) return engineRef.current;

    /* Master chain */
    const masterVol = new Tone.Volume(-14).toDestination();
    const reverb = new Tone.Reverb({ decay: 6, wet: 0.4 }).connect(masterVol);
    const compressor = new Tone.Compressor(-24, 4).connect(reverb);

    /* ── PAD: filtered poly synth ── */
    const padFilter = new Tone.AutoFilter({
      frequency: 0.08,
      depth: 0.6,
      baseFrequency: 200,
      octaves: 2.5,
    }).connect(compressor).start();

    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine4' },
      envelope: { attack: 3, decay: 2, sustain: 0.7, release: 5 },
      volume: -18,
    }).connect(padFilter);

    /* ── BASS: deep sub drone ── */
    const bassFilter = new Tone.Filter(120, 'lowpass').connect(compressor);
    const bass = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 1, sustain: 0.9, release: 4 },
      volume: -20,
    }).connect(bassFilter);

    /* ── ARP: metallic pluck arpeggios ── */
    const arpDelay = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.3, wet: 0.25 }).connect(compressor);
    const arp = new Tone.Synth({
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.05, release: 0.8 },
      volume: -24,
    }).connect(arpDelay);

    /* ── PERC: hi-hat noise ticks ── */
    const percVol = new Tone.Volume(-28).connect(compressor);
    const perc = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
    }).connect(percVol);

    /* ── FX: sweep riser ── */
    const sweepFilter = new Tone.Filter(400, 'bandpass', -12).connect(compressor);
    const sweep = new Tone.Noise({ type: 'pink', volume: -30 }).connect(sweepFilter);

    /* ── Sequencing ── */
    let chordIdx = 0;
    const scaleKey = pick(Object.keys(SCALES));
    const scale = SCALES[scaleKey];

    // Pad: change chord every 8 bars
    const padLoop = new Tone.Loop((time) => {
      if (mutedRef.current) return;
      const chord = CHORD_PROG[chordIdx % CHORD_PROG.length];
      pad.releaseAll(time);
      pad.triggerAttackRelease(chord, '4m', time, randRange(0.3, 0.5));
      chordIdx++;
    }, '4m');

    // Bass: follows root of current chord
    const bassLoop = new Tone.Loop((time) => {
      if (mutedRef.current) return;
      const root = CHORD_PROG[chordIdx % CHORD_PROG.length][0];
      bass.triggerAttackRelease(root, '2m', time, randRange(0.4, 0.6));
    }, '2m');

    // Arp: randomised notes from current scale
    const arpLoop = new Tone.Loop((time) => {
      if (mutedRef.current) return;
      if (Math.random() > 0.6) return; // 40% silence for breathing room
      const note = pick(scale);
      arp.triggerAttackRelease(note, '16n', time, randRange(0.15, 0.35));
    }, '8n');

    // Perc: subtle tick pattern
    const percLoop = new Tone.Loop((time) => {
      if (mutedRef.current) return;
      if (Math.random() > 0.35) return;
      perc.triggerAttackRelease('32n', time, randRange(0.1, 0.3));
    }, '16n');

    /* ── Sweep trigger (called on section scroll) ── */
    const triggerSweep = () => {
      if (mutedRef.current) return;
      sweep.start();
      sweepFilter.frequency.rampTo(randRange(800, 3000), 1.5);
      setTimeout(() => {
        sweepFilter.frequency.rampTo(400, 2);
        setTimeout(() => sweep.stop(), 2200);
      }, 1600);
    };

    const engine = {
      Tone,
      masterVol,
      pad, bass, arp, perc, sweep,
      padLoop, bassLoop, arpLoop, percLoop,
      triggerSweep,
      started: false,
      disposed: false,
    };
    engineRef.current = engine;
    return engine;
  }, []);

  /* ── Start / Resume ── */
  const startBGM = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const engine = await buildEngine();
    if (engine.disposed) return;

    const { Tone, padLoop, bassLoop, arpLoop, percLoop } = engine;

    await Tone.start();
    Tone.getTransport().bpm.value = pick([72, 80, 85, 90]);
    padLoop.start(0);
    bassLoop.start(0);
    arpLoop.start('1m');   // delayed entry
    percLoop.start('2m');  // even later
    Tone.getTransport().start('+0.1');
    engine.started = true;
  }, [buildEngine]);

  /* ── Volume control from muted state ── */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !engine.started) return;
    engine.masterVol.volume.rampTo(muted ? -Infinity : -14, 0.8);
  }, [muted]);

  /* ── User interaction to unlock AudioContext ── */
  useEffect(() => {
    if (muted) return; // don't auto-start if muted

    const unlock = () => {
      startBGM();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [muted, startBGM]);

  /* ── Scroll-triggered sweep FX ── */
  useEffect(() => {
    let lastSection = '';
    const onScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const y = window.scrollY + window.innerHeight * 0.4;
      for (const s of sections) {
        if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
          if (s.id !== lastSection) {
            lastSection = s.id;
            engineRef.current?.triggerSweep?.();
          }
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.disposed = true;
      try {
        engine.Tone.getTransport().stop();
        engine.padLoop.dispose();
        engine.bassLoop.dispose();
        engine.arpLoop.dispose();
        engine.percLoop.dispose();
        engine.pad.dispose();
        engine.bass.dispose();
        engine.arp.dispose();
        engine.perc.dispose();
        engine.sweep.dispose();
        engine.masterVol.dispose();
      } catch { /* swallow disposal errors */ }
    };
  }, []);

  return null; // no visual output
}

export default memo(ProceduralBGM);
