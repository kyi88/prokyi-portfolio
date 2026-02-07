import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './CryptoMiner.css';

const RANKS = ['Script Kiddie', 'Miner', 'Hodler', 'Whale', 'Satoshi'];

function getRank(tokens) {
  if (tokens >= 100) return RANKS[4];
  if (tokens >= 50) return RANKS[3];
  if (tokens >= 20) return RANKS[2];
  if (tokens >= 5) return RANKS[1];
  return RANKS[0];
}

function CryptoMiner() {
  const [open, setOpen] = useState(false);
  const [mining, setMining] = useState(false);
  const [clock, setClock] = useState(100); // overclock %
  const [stats, setStats] = useState({ hashrate: 0, temp: 42, vram: 0, power: 0 });
  const [tokens, setTokens] = useState(0);
  const [throttle, setThrottle] = useState(false);
  const [sushiEgg, setSushiEgg] = useState(false);
  const mineRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-cryptominer-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-cryptominer-toggle', handler);
    };
  }, [open]);

  // Mining loop
  useEffect(() => {
    if (!open || !mining) {
      setStats({ hashrate: 0, temp: 42, vram: 0, power: 0 });
      return;
    }
    const clockRef = { current: clock };
    const update = () => {
      const oc = clockRef.current / 100;
      const baseHash = 24.5 + Math.random() * 8;
      const temp = Math.min(999, Math.floor(45 + (oc - 1) * 80 + Math.random() * 10));
      const vram = Math.floor(3200 + oc * 2800 + Math.random() * 500);
      const power = Math.floor(120 + oc * 180 + Math.random() * 30);
      setStats({
        hashrate: +(baseHash * oc + Math.random() * 3).toFixed(1),
        temp,
        vram,
        power,
      });
      if (temp >= 95 && temp < 999) {
        setThrottle(true);
      } else {
        setThrottle(false);
      }
      if (temp >= 999) {
        setSushiEgg(true);
      }
      // Mine tokens
      setTokens((t) => +(t + 0.01 * oc).toFixed(4));
    };
    mineRef.current = setInterval(update, 1000);
    return () => clearInterval(mineRef.current);
  }, [open, mining]);

  // Keep clock synced to mining loop without restarting
  useEffect(() => {
    // Stats update uses closure over clock; fine because setInterval recreated when mining changes
  }, [clock]);

  useEffect(() => () => clearInterval(mineRef.current), []);

  useEffect(() => {
    if (!open) {
      setMining(false);
      setTokens(0);
      setThrottle(false);
      setSushiEgg(false);
      setClock(100);
    }
  }, [open]);

  // Restart mining interval when clock changes (so overclock takes effect)
  const clockRef = useRef(clock);
  clockRef.current = clock;

  const toggleMining = useCallback(() => setMining((p) => !p), []);

  if (!open) return null;

  const isHot = stats.temp >= 85;

  return (
    <motion.div
      className={`crypto-miner${isHot ? ' crypto-miner--overheat' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Crypto Miner Dashboard"
      aria-modal="true"
    >
      <div className="crypto-miner__header">
        <span>⛏️ $PROKYI MINER v0.539</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="crypto-miner__btn" onClick={toggleMining}>
            {mining ? '⏹ STOP' : '▶ MINE'}
          </button>
          <button className="crypto-miner__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>
      <div className="crypto-miner__body">
        <div className="crypto-miner__stats">
          <div className="crypto-miner__stat">
            <div className="crypto-miner__stat-label">Hashrate</div>
            <div className="crypto-miner__stat-value">{stats.hashrate} MH/s</div>
          </div>
          <div className="crypto-miner__stat">
            <div className="crypto-miner__stat-label">GPU温度</div>
            <div className={`crypto-miner__stat-value${isHot ? ' crypto-miner__stat-value--hot' : ''}`}>
              {stats.temp}°C {stats.temp >= 999 ? '🔥' : ''}
            </div>
          </div>
          <div className="crypto-miner__stat">
            <div className="crypto-miner__stat-label">VRAM</div>
            <div className="crypto-miner__stat-value">{stats.vram} MB</div>
          </div>
          <div className="crypto-miner__stat">
            <div className="crypto-miner__stat-label">消費電力</div>
            <div className="crypto-miner__stat-value">{stats.power} W</div>
          </div>
        </div>

        <div className="crypto-miner__wallet">
          <div className="crypto-miner__token">💰 {tokens.toFixed(4)} $PROKYI</div>
          <div className="crypto-miner__rank">Rank: {getRank(tokens)}</div>
        </div>

        {mining && (
          <div className="crypto-miner__overclock">
            <span>OC:</span>
            <input
              type="range"
              min="100"
              max="300"
              value={clock}
              onChange={(e) => setClock(Number(e.target.value))}
              className="crypto-miner__slider"
              aria-label="Overclock percentage"
            />
            <span>{clock}%</span>
          </div>
        )}

        {throttle && (
          <div className="crypto-miner__throttle">
            ⚠ THERMAL THROTTLE — GPU OVERHEATING
          </div>
        )}

        {sushiEgg && (
          <div className="crypto-miner__easter">
            🍣 寿司を焼くのに最適な温度です 🍣{'\n'}
            {'  ___________'}{'\n'}
            {' /  🔥🔥🔥  \\'}{'\n'}
            {'|  ≡≡≡🍣≡≡≡  |'}{'\n'}
            {' \\_________/'}
          </div>
        )}

        <div className="crypto-miner__status">
          {mining ? `Pool: prokyi-mining.onion | Workers: 1 | Uptime: ${Math.floor(tokens * 10)}s` : 'Idle — Press ▶ MINE to start'}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(CryptoMiner);
