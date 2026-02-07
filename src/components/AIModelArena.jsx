import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './AIModelArena.css';

const PROKYI_MOVES = [
  { name: 'sudo rm -rf doubt', dmg: 18, msg: 'prokyi-v2.6 が自信を root 権限で注入！' },
  { name: 'pip install victory', dmg: 15, msg: 'prokyi-v2.6 が勝利パッケージをインストール！' },
  { name: 'git push --force', dmg: 22, msg: 'prokyi-v2.6 が相手のコードベースを強制上書き！' },
  { name: 'import tensorflow', dmg: 20, msg: 'prokyi-v2.6 がニューラルネットビームを発射！' },
  { name: 'docker compose up', dmg: 12, msg: 'prokyi-v2.6 がコンテナ軍団を召喚！' },
  { name: 'omakase-ultimate', dmg: 99, msg: 'prokyi-v2.6 のおまかせ必殺技！🍣 寿司愛の波動！' },
];

const ENEMIES = [
  { name: 'CorporateDrone-3B', moves: ['TPS Report', 'Meeting Overhead', 'Synergy Buzzword'], weakness: 'Linux' },
  { name: 'NoTests-YOLO-7B', moves: ['Deploy to Prod', 'Skip CI/CD', 'Blame Others'], weakness: 'Docker' },
  { name: 'Legacy-COBOL-1B', moves: ['PERFORM ATTACK', 'GOTO DAMAGE', 'DIVISION BY ZERO'], weakness: 'Python' },
  { name: 'StackOverflow-13B', moves: ['Copy Paste', 'Duplicate Question', 'Reputation Farm'], weakness: 'Creativity' },
  { name: 'Buzzword-Enterprise-70B', moves: ['Paradigm Shift', 'Disruptive Innovation', 'Blockchain Everything'], weakness: 'Reality' },
];

const BOSS = { name: 'GPT-∞', moves: ['Infinite Context', 'Hallucination Beam', 'Token Overflow'], weakness: '寿司愛', hp: 150 };

function AIModelArena() {
  const [open, setOpen] = useState(false);
  const [prokyiHp, setProkyiHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [enemy, setEnemy] = useState(() => ENEMIES[0]);
  const [log, setLog] = useState([]);
  const [fighting, setFighting] = useState(false);
  const [result, setResult] = useState(null); // 'win'|'lose'|null
  const [streak, setStreak] = useState(0);
  const [isBoss, setIsBoss] = useState(false);
  const timerRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-arena-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-arena-toggle', handler);
    };
  }, [open]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      setFighting(false);
      setResult(null);
      setStreak(0);
      setIsBoss(false);
      resetFight();
    }
  }, [open]);

  const resetFight = useCallback(() => {
    setProkyiHp(100);
    setEnemyHp(100);
    setLog([]);
    setResult(null);
    setFighting(false);
  }, []);

  const spawnEnemy = useCallback(() => {
    const e = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    setEnemy(e);
    setIsBoss(false);
    resetFight();
  }, [resetFight]);

  const spawnBoss = useCallback(() => {
    setEnemy(BOSS);
    setIsBoss(true);
    setProkyiHp(100);
    setEnemyHp(BOSS.hp);
    setLog([{ text: '⚠ 隠しボス GPT-∞ が出現！全ステータス999！', type: 'system' }]);
    setResult(null);
    setFighting(false);
  }, []);

  const startFight = useCallback(() => {
    if (fighting) return;
    setFighting(true);
    setLog([{ text: '--- ROUND START ---', type: 'system' }]);

    let pHp = 100;
    let eHp = isBoss ? BOSS.hp : 100;
    let turn = 0;

    timerRef.current = setInterval(() => {
      turn++;
      if (turn % 2 === 1) {
        // Prokyi attacks
        const isLastResort = isBoss && eHp < 50;
        const move = isLastResort
          ? PROKYI_MOVES[5] // omakase-ultimate
          : PROKYI_MOVES[Math.floor(Math.random() * 5)];
        const dmg = Math.floor(move.dmg * (0.8 + Math.random() * 0.4));
        eHp = Math.max(0, eHp - dmg);
        setEnemyHp(eHp);
        setLog((l) => [...l, { text: `${move.msg} (-${dmg}HP)`, type: 'prokyi' }]);
      } else {
        // Enemy attacks
        const moveIdx = Math.floor(Math.random() * enemy.moves.length);
        const dmg = Math.floor((8 + Math.random() * 14) * (isBoss ? 1.5 : 1));
        pHp = Math.max(0, pHp - dmg);
        setProkyiHp(pHp);
        setLog((l) => [...l, { text: `${enemy.name} の ${enemy.moves[moveIdx]}! (-${dmg}HP)`, type: 'enemy' }]);
      }

      if (eHp <= 0) {
        clearInterval(timerRef.current);
        setFighting(false);
        setResult('win');
        setStreak((s) => {
          const next = s + 1;
          if (next >= 10 && !isBoss) {
            // Trigger boss after 10 wins
            setTimeout(() => spawnBoss(), 2000);
          }
          return next;
        });
        if (isBoss) {
          setLog((l) => [...l, { text: '🎉 人類の勝利！GPT-∞ を倒した！🍣', type: 'system' }]);
          window.dispatchEvent(new CustomEvent('prokyi-confetti'));
        } else {
          setLog((l) => [...l, { text: `${enemy.name} を撃破！`, type: 'system' }]);
        }
      } else if (pHp <= 0) {
        clearInterval(timerRef.current);
        setFighting(false);
        setResult('lose');
        setStreak(0);
        setLog((l) => [...l, { text: 'prokyi-v2.6 ダウン… 再起動中…', type: 'system' }]);
      }
    }, 800);
  }, [fighting, enemy, isBoss, spawnBoss]);

  if (!open) return null;

  const maxEnemyHp = isBoss ? BOSS.hp : 100;

  return (
    <motion.div
      className="ai-arena"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="AI Model Arena"
      aria-modal="true"
    >
      <div className="ai-arena__header">
        <span>⚔️ AI MODEL ARENA</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {!fighting && result && !isBoss && (
            <button className="ai-arena__btn" onClick={spawnEnemy}>NEXT ▶</button>
          )}
          {!fighting && !result && (
            <button className="ai-arena__btn ai-arena__btn--fight" onClick={startFight}>⚔ FIGHT</button>
          )}
          <button className="ai-arena__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>

      <div className="ai-arena__fighters">
        <div className="ai-arena__fighter">
          <div className="ai-arena__fighter-name ai-arena__fighter-name--prokyi">prokyi-v2.6</div>
          <div className="ai-arena__hp-bar">
            <div className="ai-arena__hp-fill ai-arena__hp-fill--prokyi" style={{ width: `${prokyiHp}%` }} />
          </div>
          <div className="ai-arena__stats">
            HP: {prokyiHp}/100 | Python:95 | Linux:92 | AI:88
          </div>
        </div>
        <div className="ai-arena__vs">VS</div>
        <div className="ai-arena__fighter">
          <div className="ai-arena__fighter-name ai-arena__fighter-name--enemy">{enemy.name}</div>
          <div className="ai-arena__hp-bar">
            <div className="ai-arena__hp-fill ai-arena__hp-fill--enemy" style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }} />
          </div>
          <div className="ai-arena__stats">
            HP: {enemyHp}/{maxEnemyHp} | 弱点: {enemy.weakness}
          </div>
        </div>
      </div>

      <div className="ai-arena__log" ref={logRef}>
        {log.map((line, i) => (
          <div key={i} className={`ai-arena__log-line ai-arena__log-line--${line.type}`}>{line.text}</div>
        ))}
        {log.length === 0 && <div style={{ color: '#555', textAlign: 'center' }}>⚔ FIGHT を押してバトル開始</div>}
      </div>

      {result && (
        <div className={`ai-arena__result ai-arena__result--${result}`}>
          {result === 'win' ? '🏆 VICTORY!!' : '💀 DEFEAT...'}
        </div>
      )}

      <div className="ai-arena__status">
        {streak > 0 && <span className="ai-arena__streak">{streak}連勝中！</span>}
        {streak >= 10 && !isBoss && ' 👀 何かが近づいてくる…'}
        {' '}Wins trigger boss at 10 streak
      </div>
    </motion.div>
  );
}

export default memo(AIModelArena);
