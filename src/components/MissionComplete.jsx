import { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import './MissionComplete.css';

const ASCII_TROPHY = `
    ___________
   '._==_==_=_.'
   .-\\:      /-.
  | (|:.     |) |
   '-|:.     |-'
     \\::.    /
      '::. .'
        ) (
      _.' '._
     '-------'
`;

const STATS = [
  { value: '100', label: 'Loops Completed' },
  { value: '68', label: 'Components' },
  { value: '30', label: 'Easter Eggs' },
  { value: '50+', label: 'Terminal Commands' },
  { value: '8', label: 'Chunks' },
  { value: '∞', label: 'Lines of Code' },
];

function MissionComplete() {
  const [open, setOpen] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);
  const confettiRef = useRef(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-mission-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-mission-toggle', handler);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      confettiRef.current = false;
      setConfettiFired(false);
    }
  }, [open]);

  // Fire confetti once when opened
  useEffect(() => {
    if (open && !confettiRef.current) {
      confettiRef.current = true;
      setConfettiFired(true);
      window.dispatchEvent(new CustomEvent('prokyi-confetti'));
      // Easter egg #31: achievement for reaching Loop 100
      window.dispatchEvent(new CustomEvent('prokyi-achievement', {
        detail: { id: 'loop100', title: 'MISSION COMPLETE', desc: '100ループ達成おめでとう！' },
      }));
    }
  }, [open]);

  if (!open) return null;

  return (
    <motion.div
      className="mission-complete"
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      role="dialog"
      aria-label="Mission Complete — Loop 100"
      aria-modal="true"
    >
      <div className="mission-complete__golden-overlay" aria-hidden="true" />

      <div className="mission-complete__header">
        <span className="mission-complete__title">🏆 MISSION COMPLETE</span>
        <button className="mission-complete__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>

      <div className="mission-complete__loop-counter">100</div>
      <div className="mission-complete__subtitle">ALL LOOPS EXECUTED SUCCESSFULLY</div>

      <div className="mission-complete__sushi" aria-hidden="true">🍣🎉🍣</div>

      <div className="mission-complete__ascii" aria-hidden="true">{ASCII_TROPHY}</div>

      <div className="mission-complete__badge">LEGENDARY DEVELOPER ACHIEVEMENT UNLOCKED</div>

      <div className="mission-complete__stats">
        {STATS.map((s) => (
          <div key={s.label} className="mission-complete__stat">
            <div className="mission-complete__stat-value">{s.value}</div>
            <div className="mission-complete__stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mission-complete__message">
        <strong>// SYSTEM LOG</strong><br /><br />
        ループ１から１００まで — 全ステップ完了。<br />
        サイバーパンクポートフォリオは最終形態に到達。<br /><br />
        68コンポーネント構築、30のイースターエッグ隠蔽、<br />
        50+ターミナルコマンド実装、バグ監査×複数回実施。<br /><br />
        <span style={{ color: '#ffd700' }}>
          「コードは永遠に、寿司も永遠に。」
        </span>
      </div>

      <div className="mission-complete__credits">
        Architected by <span>ぷろきぃ (prokyi)</span> ×{' '}
        <span>GitHub Copilot</span><br />
        Powered by React 19 · Vite 6 · Framer Motion · Three.js<br />
        © {new Date().getFullYear()} prokyi — All rights reserved.
      </div>
    </motion.div>
  );
}

export default memo(MissionComplete);
