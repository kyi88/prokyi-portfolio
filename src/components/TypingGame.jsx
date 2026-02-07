import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TypingGame.css';

/* ── Sound effects via Web Audio API ── */
const makeBeep = (freq, dur = 0.04, vol = 0.04) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.stop(ctx.currentTime + dur + 0.01);
  } catch (_) {}
};
const sfx = {
  key:   () => makeBeep(800 + Math.random() * 200, 0.02, 0.02),
  ok:    () => makeBeep(1200, 0.06, 0.04),
  miss:  () => makeBeep(200, 0.08, 0.04),
  start: () => { makeBeep(600, 0.05); setTimeout(() => makeBeep(900, 0.05), 60); },
  done:  () => { makeBeep(800, 0.06); setTimeout(() => makeBeep(1000, 0.06), 80); setTimeout(() => makeBeep(1300, 0.08), 160); },
};

const WORDS = [
  'cyberdeck', 'neural', 'proxy', 'encrypt', 'kernel',
  'daemon', 'socket', 'buffer', 'malloc', 'thread',
  'docker', 'deploy', 'branch', 'commit', 'rebase',
  'pipeline', 'lambda', 'vector', 'matrix', 'binary',
  'quantum', 'async', 'await', 'class', 'import',
  'render', 'state', 'props', 'react', 'vite',
];

const DURATION = 20; // seconds

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TypingGame({ onClose }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | done
  const [words, setWords] = useState([]);
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState(null);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('prokyi_typing_best') || '0', 10));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const inputRef = useRef(null);

  // Start
  const start = useCallback(() => {
    setWords(shuffle(WORDS));
    setWordIdx(0);
    setInput('');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(DURATION);
    setMistakes(0);
    setIsNewRecord(false);
    setPhase('playing');
    sfx.start();
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('done');
      sfx.done();
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Focus input
  useEffect(() => {
    if (phase === 'playing' && inputRef.current) inputRef.current.focus();
  }, [phase]);

  const currentWord = words[wordIdx] || '';

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val === currentWord) {
      const points = currentWord.length * (1 + combo * 0.2);
      setScore(prev => prev + Math.round(points));
      setCombo(prev => {
        const next = prev + 1;
        setMaxCombo(m => Math.max(m, next));
        return next;
      });
      setFlash('correct');
      sfx.ok();
      setTimeout(() => setFlash(null), 300);
      setInput('');

      if (wordIdx + 1 >= words.length) {
        setWords(shuffle(WORDS));
        setWordIdx(0);
      } else {
        setWordIdx(prev => prev + 1);
      }
    } else if (currentWord.startsWith(val)) {
      // partial correct — key sound
      sfx.key();
    } else {
      setMistakes(prev => prev + 1);
      setCombo(0);
      setFlash('miss');
      sfx.miss();
      setTimeout(() => setFlash(null), 200);
    }
  };

  // Render current word with highlighting
  const renderWord = () => {
    return currentWord.split('').map((ch, i) => {
      let cls = 'tg-char';
      if (i < input.length) {
        cls += input[i] === ch ? ' tg-char--ok' : ' tg-char--err';
      } else if (i === input.length) {
        cls += ' tg-char--cursor';
      }
      return <span key={i} className={cls}>{ch}</span>;
    });
  };

  const wpm = phase === 'done'
    ? Math.round((score / Math.max(DURATION - timeLeft, 1)) * 12)
    : 0;

  // Save best score
  useEffect(() => {
    if (phase === 'done' && score > bestScore) {
      setBestScore(score);
      setIsNewRecord(true);
      localStorage.setItem('prokyi_typing_best', String(score));
    }
  }, [phase, score]);

  return (
    <motion.div className="tg-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div className="tg-panel"
        initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
      >
        <button className="tg-close" onClick={onClose} aria-label="閉じる">✕</button>

        <h2 className="tg-title">
          <span className="tg-title__icon">⌨️</span> HACK_TYPING
        </h2>

        {phase === 'ready' && (
          <motion.div className="tg-ready"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="tg-ready__desc">
              表示される単語をできるだけ速くタイプせよ。<br />
              制限時間 <strong>{DURATION}秒</strong>。コンボでスコア倍率UP。
            </p>
            {bestScore > 0 && (
              <p className="tg-ready__best">🏆 BEST: {bestScore}</p>
            )}
            <button className="tg-start-btn" onClick={start}>
              &gt; START HACK_
            </button>
          </motion.div>
        )}

        {phase === 'playing' && (
          <div className={`tg-game ${flash === 'correct' ? 'tg-game--flash-ok' : ''} ${flash === 'miss' ? 'tg-game--flash-err' : ''}`}>
            <div className="tg-hud">
              <div className="tg-hud__item">
                <span className="tg-hud__label">TIME</span>
                <span className={`tg-hud__val ${timeLeft <= 5 ? 'tg-hud__val--danger' : ''}`}>
                  {timeLeft}
                </span>
              </div>
              <div className="tg-hud__item">
                <span className="tg-hud__label">SCORE</span>
                <span className="tg-hud__val">{score}</span>
              </div>
              <div className="tg-hud__item">
                <span className="tg-hud__label">COMBO</span>
                <span className="tg-hud__val tg-hud__val--combo">×{combo}</span>
              </div>
            </div>

            {/* Time bar */}
            <div className="tg-time-bar">
              <motion.div className="tg-time-bar__fill"
                animate={{ width: `${(timeLeft / DURATION) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="tg-word">{renderWord()}</div>

            <input
              ref={inputRef}
              className="tg-input"
              value={input}
              onChange={handleInput}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="type here..."
            />

            {/* Next words preview */}
            <div className="tg-next">
              {words.slice(wordIdx + 1, wordIdx + 4).map((w, i) => (
                <span key={i} className="tg-next__word">{w}</span>
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <motion.div className="tg-result"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="tg-result__title">HACK COMPLETE</p>
            <div className="tg-result__stats">
              <div><span>SCORE</span><strong>{score}</strong></div>
              <div><span>MAX COMBO</span><strong>×{maxCombo}</strong></div>
              <div><span>MISTAKES</span><strong>{mistakes}</strong></div>
              <div><span>SPEED</span><strong>~{wpm} WPM</strong></div>
            </div>
            <div className="tg-result__grade">
              {score >= 200 ? '🏆 S RANK' : score >= 120 ? '🥇 A RANK' : score >= 60 ? '🥈 B RANK' : '🥉 C RANK'}
            </div>
            {isNewRecord && (
              <motion.p
                className="tg-result__new-record"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
              >
                ⚡ NEW RECORD! ⚡
              </motion.p>
            )}
            {bestScore > 0 && !isNewRecord && (
              <p className="tg-result__best-ref">BEST: {bestScore}</p>
            )}
            <div className="tg-result__actions">
              <button className="tg-start-btn" onClick={start}>&gt; RETRY_</button>
              <button className="tg-start-btn tg-start-btn--ghost" onClick={onClose}>&gt; EXIT_</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
