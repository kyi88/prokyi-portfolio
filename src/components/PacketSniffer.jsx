import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './PacketSniffer.css';

const PROTO_MAP = {
  click: 'TCP/CLICK',
  scroll: 'UDP/SCROLL',
  mousemove: 'ICMP/HOVER',
  keydown: 'SSH/KEY',
};

const MAX_PACKETS = 80;

function randHex(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')).join('');
}

function PacketSniffer() {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [packets, setPackets] = useState([]);
  const [filter, setFilter] = useState(null);
  const bodyRef = useRef(null);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  // Toggle: Ctrl+Shift+W or event
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    const onEvent = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-sniff-toggle', onEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-sniff-toggle', onEvent);
    };
  }, []);

  // Capture events
  useEffect(() => {
    if (!open) return;
    const capture = (type) => (e) => {
      if (pausedRef.current) return;
      const proto = PROTO_MAP[type];
      const time = new Date().toLocaleTimeString('ja-JP', { hour12: false });
      let payload = '';
      if (type === 'click') {
        const tag = e.target?.tagName || '?';
        payload = `Target: <${tag.toLowerCase()}> pos(${e.clientX},${e.clientY})`;
      } else if (type === 'scroll') {
        payload = `scrollY=${Math.round(window.scrollY)} delta=${e.deltaY || 0}`;
      } else if (type === 'mousemove') {
        payload = `pos(${e.clientX},${e.clientY}) CRC:${randHex(2)}`;
      } else if (type === 'keydown') {
        payload = `key=${e.key} code=${e.code}`;
      }
      const pkt = {
        id: Date.now() + Math.random(),
        time,
        proto,
        src: `USR:0x${randHex(2)}`,
        dst: `DOM:0x${randHex(2)}`,
        payload,
      };
      setPackets((prev) => {
        const next = [...prev, pkt];
        return next.length > MAX_PACKETS ? next.slice(-MAX_PACKETS) : next;
      });
    };

    const handlers = Object.keys(PROTO_MAP).map((type) => {
      const fn = capture(type);
      // Throttle mousemove
      if (type === 'mousemove') {
        let last = 0;
        const throttled = (e) => {
          const now = Date.now();
          if (now - last > 300) { last = now; fn(e); }
        };
        window.addEventListener(type, throttled, { passive: true });
        return [type, throttled];
      }
      window.addEventListener(type, fn, { passive: true });
      return [type, fn];
    });
    return () => handlers.forEach(([type, fn]) => window.removeEventListener(type, fn));
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current && !paused) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [packets, paused]);

  // Reset on close
  useEffect(() => {
    if (!open) { setPackets([]); setPaused(false); setFilter(null); }
  }, [open]);

  const filtered = filter ? packets.filter((p) => p.proto === filter) : packets;

  if (!open) return null;

  return (
    <motion.div
      className="packet-sniffer"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="packet-sniffer__header">
        <span>🦈 PACKET SNIFFER — eth0 promisc</span>
        <div className="packet-sniffer__controls">
          <button className="packet-sniffer__btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume' : 'Pause'}>
            {paused ? '▶' : '⏸'}
          </button>
          <button className="packet-sniffer__btn" onClick={() => setPackets([])} aria-label="Clear">CLR</button>
          <button className="packet-sniffer__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>
      <div className="packet-sniffer__stats">
        <span>PKT: {packets.length}</span>
        {Object.values(PROTO_MAP).map((p) => (
          <button
            key={p}
            className={`packet-sniffer__btn${filter === p ? ' packet-sniffer__btn--active' : ''}`}
            onClick={() => setFilter((prev) => prev === p ? null : p)}
          >{p.split('/')[1]}</button>
        ))}
      </div>
      <div className="packet-sniffer__body" ref={bodyRef}>
        {filtered.map((pkt) => (
          <div key={pkt.id} className="packet-sniffer__row">
            <span className="packet-sniffer__col packet-sniffer__col--time">{pkt.time}</span>
            <span className="packet-sniffer__col packet-sniffer__col--proto" data-proto={pkt.proto}>{pkt.proto}</span>
            <span className="packet-sniffer__col packet-sniffer__col--payload">{pkt.src} → {pkt.dst} | {pkt.payload}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: '#555', padding: '12px', textAlign: 'center' }}>
            {packets.length === 0 ? 'Waiting for packets...' : 'No packets match filter.'}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(PacketSniffer);
