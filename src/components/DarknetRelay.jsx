import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './DarknetRelay.css';

const CIPHERS = ['AES-256-GCM', 'ChaCha20-Poly1305', 'Camellia-256-CBC', 'Twofish-256'];
const randIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
const randLatency = () => Math.floor(30 + Math.random() * 200);

function generateCircuit() {
  return [
    { type: 'entry', label: 'ENTRY', ip: randIP(), cipher: CIPHERS[Math.floor(Math.random() * CIPHERS.length)], latency: randLatency() },
    { type: 'middle', label: 'RELAY-1', ip: randIP(), cipher: CIPHERS[Math.floor(Math.random() * CIPHERS.length)], latency: randLatency() },
    { type: 'middle', label: 'RELAY-2', ip: randIP(), cipher: CIPHERS[Math.floor(Math.random() * CIPHERS.length)], latency: randLatency() },
    { type: 'exit', label: 'EXIT', ip: randIP(), cipher: CIPHERS[Math.floor(Math.random() * CIPHERS.length)], latency: randLatency() },
  ];
}

function DarknetRelay() {
  const [open, setOpen] = useState(false);
  const [circuit, setCircuit] = useState(() => generateCircuit());
  const [selected, setSelected] = useState(null);
  const [alert, setAlert] = useState(false);
  const [packetCount, setPacketCount] = useState(0);
  const exitClicks = useRef(0);
  const exitTimer = useRef(null);
  const alertTimer = useRef(null);

  // Toggle + Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-darknet-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-darknet-toggle', handler);
    };
  }, [open]);

  // Packet counter
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => setPacketCount((p) => p + Math.floor(1 + Math.random() * 5)), 800);
    return () => clearInterval(iv);
  }, [open]);

  // Cleanup
  useEffect(() => () => { clearTimeout(exitTimer.current); clearTimeout(alertTimer.current); }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCircuit(generateCircuit());
      setSelected(null);
      setAlert(false);
      setPacketCount(0);
      exitClicks.current = 0;
    }
  }, [open]);

  const handleNodeClick = useCallback((idx) => {
    const node = circuit[idx];
    setSelected(idx === selected ? null : idx);
    // Easter egg: 3 rapid clicks on exit node
    if (node.type === 'exit') {
      exitClicks.current++;
      clearTimeout(exitTimer.current);
      exitTimer.current = setTimeout(() => { exitClicks.current = 0; }, 2000);
      if (exitClicks.current >= 3) {
        exitClicks.current = 0;
        setAlert(true);
        clearTimeout(alertTimer.current);
        alertTimer.current = setTimeout(() => {
          setCircuit(generateCircuit());
          setAlert(false);
          setSelected(null);
        }, 3000);
      }
    }
  }, [circuit, selected]);

  const newCircuit = useCallback(() => {
    setCircuit(generateCircuit());
    setSelected(null);
  }, []);

  if (!open) return null;

  const sel = selected !== null ? circuit[selected] : null;

  return (
    <motion.div
      className="darknet-relay"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Darknet Relay"
      aria-modal="true"
    >
      <div className="darknet-relay__header">
        <span>🧅 DARKNET RELAY — TOR CIRCUIT</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="darknet-relay__btn" onClick={newCircuit}>⟳ NEW CIRCUIT</button>
          <button className="darknet-relay__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>

      <div className="darknet-relay__chain">
        {circuit.map((node, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              className={`darknet-relay__node darknet-relay__node--${node.type}${alert ? ' darknet-relay__node--alert' : ''}`}
              onClick={() => handleNodeClick(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(i); } }}
              role="button"
              tabIndex={0}
              aria-label={`${node.label} node`}
            >
              <div style={{ fontSize: '0.7rem' }}>{node.type === 'entry' ? '🟢' : node.type === 'exit' ? '🔴' : '🟡'}</div>
              <div>{node.label}</div>
            </div>
            {i < circuit.length - 1 && <span className="darknet-relay__arrow">→</span>}
          </div>
        ))}
      </div>

      {sel && (
        <div className="darknet-relay__detail">
          IP: {sel.ip} | Cipher: {sel.cipher} | Latency: {sel.latency}ms | Type: {sel.type.toUpperCase()}
        </div>
      )}

      <div className={`darknet-relay__status${alert ? ' darknet-relay__status--alert' : ''}`}>
        {alert ? '⚠ IDENTITY EXPOSED — REBUILDING CIRCUIT...' : 'CIRCUIT ESTABLISHED — ALL LAYERS ENCRYPTED'}
      </div>
      <div className="darknet-relay__counter">
        Packets relayed: {packetCount} | Bandwidth: {(packetCount * 0.42).toFixed(1)} KB
      </div>
    </motion.div>
  );
}

export default memo(DarknetRelay);
