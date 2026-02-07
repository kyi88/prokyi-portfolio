import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './DeadDrop.css';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const CAPSULES = [
  { id: 0, icon: '📦', label: 'ALPHA', shift: [3, 7, 1], sender: 'NetRunner_0x7F', trust: 92, message: 'The payload is hidden in /dev/null.\nAccess code: prokyi-539.\nDo not trust the corporate nodes.' },
  { id: 1, icon: '💀', label: 'BRAVO', shift: [5, 2, 8], sender: 'GhostSec', trust: 67, message: 'Firewall breach at sector 7G.\nAll agents compromised.\nEvacuate to darknet relay #4.' },
  { id: 2, icon: '🔑', label: 'CHARLIE', shift: [9, 4, 6], sender: 'CipherPunk', trust: 88, message: 'Encryption keys rotated.\nNew hash: SHA-539.\nSushi is the universal password.' },
  { id: 3, icon: '📡', label: 'DELTA', shift: [2, 11, 3], sender: 'SatLink', trust: 45, message: 'Satellite uplink established.\nBandwidth: unlimited.\nStreaming prokyi consciousness to the cloud.' },
  { id: 4, icon: '🧬', label: 'ECHO', shift: [7, 0, 5], sender: 'BioHacker', trust: 78, message: 'DNA sequence modified.\nCybernetic implant v2.6 online.\nSide effect: craves sushi 24/7.' },
];

/* Simple Caesar cipher on 3 rings */
function encrypt(text, shifts) {
  return text.split('').map((ch) => {
    const idx = ALPHABET.indexOf(ch.toUpperCase());
    if (idx < 0) return ch;
    const ring = shifts[Math.abs(ch.charCodeAt(0)) % shifts.length];
    const shifted = ALPHABET[(idx + ring) % 26];
    return ch === ch.toLowerCase() ? shifted.toLowerCase() : shifted;
  }).join('');
}

function decrypt(text, shifts) {
  return text.split('').map((ch) => {
    const idx = ALPHABET.indexOf(ch.toUpperCase());
    if (idx < 0) return ch;
    const ring = shifts[Math.abs(ch.charCodeAt(0)) % shifts.length];
    const shifted = ALPHABET[(idx - ring + 26) % 26];
    return ch === ch.toLowerCase() ? shifted.toLowerCase() : shifted;
  }).join('');
}

const PROKYI_CODE = [15, 17, 14, 10, 24, 8]; // P R O K Y I (0-indexed)

function DeadDrop() {
  const [open, setOpen] = useState(false);
  const [rings, setRings] = useState([0, 0, 0]);
  const [activeCapsule, setActiveCapsule] = useState(null);
  const [decoded, setDecoded] = useState(new Set());
  const [omega, setOmega] = useState(false);
  const omegaTimerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) setOpen(false); };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-deaddrop-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-deaddrop-toggle', handler);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(omegaTimerRef.current), []);

  useEffect(() => {
    if (!open) {
      setRings([0, 0, 0]);
      setActiveCapsule(null);
      setDecoded(new Set());
      setOmega(false);
      clearTimeout(omegaTimerRef.current);
    }
  }, [open]);

  const rotateRing = useCallback((ringIdx, dir) => {
    setRings((prev) => {
      const next = [...prev];
      next[ringIdx] = (next[ringIdx] + dir + 26) % 26;
      return next;
    });
  }, []);

  const selectCapsule = useCallback((idx) => {
    setActiveCapsule(idx);
    setRings([0, 0, 0]);
  }, []);

  // Check if current rings match the capsule's shift to decode
  const handleDecode = useCallback(() => {
    if (activeCapsule === null) return;
    const capsule = CAPSULES[activeCapsule];
    const match = rings[0] === capsule.shift[0] && rings[1] === capsule.shift[1] && rings[2] === capsule.shift[2];
    if (match) {
      setDecoded((prev) => {
        if (prev.has(activeCapsule)) return prev;
        const next = new Set(prev);
        next.add(activeCapsule);
        return next;
      });
    }
  }, [activeCapsule, rings]);

  // Easter egg #29: check if rings spell P-R-O (first 3 letters of PROKYI mapped)
  useEffect(() => {
    if (!open || omega) return;
    // P=15, R=17, O=14
    if (rings[0] === PROKYI_CODE[0] && rings[1] === PROKYI_CODE[1] && rings[2] === PROKYI_CODE[2]) {
      setOmega(true);
      omegaTimerRef.current = setTimeout(() => setOmega(false), 5000);
    }
  }, [rings, open, omega]);

  if (!open) return null;

  const capsule = activeCapsule !== null ? CAPSULES[activeCapsule] : null;
  const isDecoded = activeCapsule !== null && decoded.has(activeCapsule);
  const currentText = capsule
    ? isDecoded ? capsule.message : encrypt(capsule.message, capsule.shift)
    : 'Select a capsule to begin decryption...';

  // Decode progress: how close the rings are
  let progress = 0;
  if (capsule) {
    const hits = capsule.shift.reduce((acc, s, i) => acc + (rings[i] === s ? 1 : 0), 0);
    progress = Math.round((hits / 3) * 100);
  }

  return (
    <motion.div
      className="dead-drop"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Dead Drop"
      aria-modal="true"
    >
      <div className="dead-drop__header">
        <span>📦 DEAD DROP</span>
        <button className="dead-drop__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>

      <div className="dead-drop__capsules">
        {CAPSULES.map((c, i) => (
          <div
            key={c.id}
            className={`dead-drop__capsule${activeCapsule === i ? ' dead-drop__capsule--active' : ''}${decoded.has(i) ? ' dead-drop__capsule--decoded' : ''}`}
            onClick={() => selectCapsule(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCapsule(i); } }}
            role="button"
            tabIndex={0}
          >
            {c.icon} {c.label}
          </div>
        ))}
      </div>

      <div className="dead-drop__cipher">
        {rings.map((val, i) => (
          <div key={i} className="dead-drop__ring">
            <button className="dead-drop__ring-btn" onClick={() => rotateRing(i, 1)} aria-label={`Ring ${i + 1} up`}>▲</button>
            <div className="dead-drop__ring-display">{ALPHABET[val]}</div>
            <button className="dead-drop__ring-btn" onClick={() => rotateRing(i, -1)} aria-label={`Ring ${i + 1} down`}>▼</button>
          </div>
        ))}
        <button className="dead-drop__btn" onClick={handleDecode} style={{ alignSelf: 'center', marginLeft: 8 }}>DECODE</button>
      </div>

      <div className="dead-drop__progress">
        <div className="dead-drop__progress-bar" style={{ width: `${isDecoded ? 100 : progress}%` }} />
      </div>

      <div className={`dead-drop__message${isDecoded ? ' dead-drop__message--decoded' : ''}`}>
        {currentText}
      </div>

      {isDecoded && capsule && (
        <div className="dead-drop__sender">
          FROM: {capsule.sender} | TRUST: {capsule.trust}% | DECODED: {decoded.size}/{CAPSULES.length}
        </div>
      )}

      <div className="dead-drop__status">
        {isDecoded ? '✅ Message decoded.' : capsule ? `Hint: set rings to correct shift values (0-25)` : 'Choose a capsule above'}
      </div>

      {omega && (
        <div className="dead-drop__omega">
          <h2>DEAD DROP OMEGA</h2>
          <p>ぷろきぃの遺言:<br />「コードは永遠に、寿司も永遠に。」</p>
        </div>
      )}
    </motion.div>
  );
}

export default memo(DeadDrop);
