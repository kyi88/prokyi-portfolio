import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PortScanner.css';

const PORTS = [
  { port: 22, proto: 'tcp', service: 'ssh', info: 'Shell: zsh + starship — WSL2 Ubuntu' },
  { port: 80, proto: 'tcp', service: 'http', info: 'ポートフォリオ: React 19 + Vite 6' },
  { port: 443, proto: 'tcp', service: 'https', info: 'TLS証明書: GitHub Pages 発行' },
  { port: 539, proto: 'tcp', service: 'prokyi', info: '好きな数字。名前の由来にも関係' },
  { port: 3000, proto: 'tcp', service: 'dev-server', info: 'Vite HMR — 爆速ビルド中' },
  { port: 5432, proto: 'tcp', service: 'postgresql', info: 'データ分析用DB (学習中)' },
  { port: 8080, proto: 'tcp', service: 'proxy', info: '夢をコードに変換するプロキシ' },
  { port: 8888, proto: 'tcp', service: 'jupyter', info: 'AI/DS実験: Python + PyTorch' },
  { port: 1337, proto: 'tcp', service: 'leet', info: 'L33T_M0D3 4CT1V4T3D' },
  { port: 9090, proto: 'tcp', service: 'monitor', info: 'FPS & パフォーマンスモニタ稼働中' },
];

const SCAN_INTERVAL = 400; // ms between port discoveries

function PortScanner() {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lines, setLines] = useState([]);
  const [scanned, setScanned] = useState(0);
  const timerRef = useRef(null);
  const bodyRef = useRef(null);

  // Toggle: Ctrl+Shift+N or event
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    const onEvent = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-portscan-toggle', onEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-portscan-toggle', onEvent);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  // Start scan
  const startScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    setScanned(0);
    setLines([
      { text: `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleTimeString('ja-JP')}`, type: 'info' },
      { text: `Nmap scan report for prokyi.local (10.0.13.37)`, type: 'info' },
      { text: `Host is up (0.0015s latency).`, type: 'info' },
      { text: `PORT      STATE SERVICE       INFO`, type: 'info' },
    ]);
    let idx = 0;
    timerRef.current = setInterval(() => {
      if (idx >= PORTS.length) {
        clearInterval(timerRef.current);
        setScanning(false);
        setLines((prev) => [
          ...prev,
          { text: '', type: 'info' },
          { text: `Nmap done: 1 IP address (1 host up) scanned — ${PORTS.length} open ports`, type: 'info' },
        ]);
        return;
      }
      const p = PORTS[idx];
      const portStr = `${p.port}/${p.proto}`.padEnd(10);
      const serviceStr = p.service.padEnd(14);
      const isLeet = p.port === 1337;
      setLines((prev) => [
        ...prev,
        { text: `${portStr}open  ${serviceStr}${p.info}`, type: isLeet ? 'leet' : 'open' },
      ]);
      idx++;
      setScanned(idx);
    }, SCAN_INTERVAL);
  }, [scanning]);

  // Cleanup
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      setScanning(false);
      setLines([]);
      setScanned(0);
    }
  }, [open]);

  if (!open) return null;

  const progress = PORTS.length > 0 ? (scanned / PORTS.length) * 100 : 0;

  return (
    <motion.div
      className="port-scanner"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div className="port-scanner__header">
        <span>NMAP — PORT SCANNER v7.94</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!scanning && scanned === 0 && (
            <button className="port-scanner__close" onClick={startScan} aria-label="Scan">
              ▶ SCAN
            </button>
          )}
          <button className="port-scanner__close" onClick={() => setOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      {scanning && (
        <div className="port-scanner__progress">
          <div className="port-scanner__progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="port-scanner__body" ref={bodyRef}>
        {lines.map((line, i) => (
          <div key={i} className={`port-scanner__line port-scanner__line--${line.type}`}>
            {line.text}
          </div>
        ))}
        {!scanning && scanned === 0 && (
          <div className="port-scanner__line port-scanner__line--info">
            Press ▶ SCAN to begin port scanning prokyi.local...
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(PortScanner);
