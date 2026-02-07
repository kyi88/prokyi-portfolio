import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './ZeroDayVault.css';

const CVES = [
  {
    id: 'CVE-2026-PROKYI-001', severity: 'critical', cvss: 9.8,
    title: 'Critical Python Proficiency Detected',
    desc: '対象者はPythonでほぼ全てを構築可能。データ分析からWebまで侵食範囲が広い。',
    poc: '$ python3 -c "import prokyi; prokyi.build_anything()"',
    vector: 'Network / Low / None',
  },
  {
    id: 'CVE-2026-PROKYI-002', severity: 'critical', cvss: 9.5,
    title: 'Linux Root Access Persistence',
    desc: 'WSL2 Ubuntu環境を完全に掌握。zsh + starshipでシェル環境を最適化済み。',
    poc: '$ sudo prokyi --privilege-escalation\n[✓] Root obtained. System compromised.',
    vector: 'Local / Low / Required',
  },
  {
    id: 'CVE-2026-PROKYI-003', severity: 'critical', cvss: 9.2,
    title: 'AI/ML Neural Network Weaponization',
    desc: 'TensorFlow/PyTorchによる機械学習モデルの構築能力。ZEN大学でさらに強化中。',
    poc: '$ import tensorflow as tf\n$ model = prokyi.deploy_neural_weapon()',
    vector: 'Network / Medium / None',
  },
  {
    id: 'CVE-2026-PROKYI-004', severity: 'high', cvss: 8.1,
    title: 'React Frontend Injection',
    desc: 'React 19 + Vite 6でサイバーパンクUIを構築。60以上のコンポーネントが稼働中。',
    poc: '$ npx create-prokyi-app --template cyberpunk\n[✓] 62 components deployed',
    vector: 'Network / Low / None',
  },
  {
    id: 'CVE-2026-PROKYI-005', severity: 'high', cvss: 7.8,
    title: 'Docker Container Escape Capability',
    desc: 'Dockerコンテナのビルド・デプロイ能力。マルチステージビルドも対応。',
    poc: '$ docker run --rm prokyi/portfolio\n[✓] Running on port 539',
    vector: 'Local / Low / Required',
  },
  {
    id: 'CVE-2026-PROKYI-006', severity: 'high', cvss: 7.5,
    title: 'Git Version Control Exploitation',
    desc: '1日30コミット以上の異常なgit活動。force-pushも躊躇なく実行する。',
    poc: '$ git log --oneline | wc -l\n539',
    vector: 'Network / Low / None',
  },
  {
    id: 'CVE-2026-PROKYI-007', severity: 'medium', cvss: 6.5,
    title: 'Sushi Addiction Side Channel',
    desc: '寿司屋バイト経験により、寿司関連のあらゆる話題で集中力が低下する脆弱性。',
    poc: '$ echo "寿司" | prokyi --stdin\n[!] Focus lost. Craving activated. 🍣',
    vector: 'Network / Low / None',
  },
  {
    id: 'CVE-2026-PROKYI-008', severity: 'medium', cvss: 5.9,
    title: 'Gaming Peripheral DDoS',
    desc: 'AYN Thor MAXによる通学時間の100%消費。生産性に対するDDoS攻撃。',
    poc: '$ prokyi --mode gaming\n[!] Productivity: 0%. Fun: MAX.',
    vector: 'Physical / Low / Required',
  },
];

function ZeroDayVault() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [viewed, setViewed] = useState(new Set());
  const [alertMode, setAlertMode] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-exploit-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-exploit-toggle', handler);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setViewed(new Set());
      setAlertMode(false);
    }
  }, [open]);

  // Easter egg: all CVEs viewed
  useEffect(() => {
    if (viewed.size === CVES.length && viewed.size > 0) {
      setAlertMode(true);
    }
  }, [viewed]);

  const handleSelect = useCallback((idx) => {
    setSelected((prev) => (prev === idx ? null : idx));
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  if (!open) return null;

  return (
    <motion.div
      className="zeroday-vault"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Zero Day Vault"
      aria-modal="true"
    >
      <div className="zeroday-vault__header">
        <span>🛡️ ZERO-DAY EXPLOIT DATABASE</span>
        <button className="zeroday-vault__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>
      <div className="zeroday-vault__body">
        {alertMode && (
          <div className="zeroday-vault__alert">
            ⚠ THREAT LEVEL: PROKYI — No patch available. Hire immediately. ⚠
          </div>
        )}
        {CVES.map((cve, i) => (
          <div key={cve.id}>
            <div
              className={`zeroday-vault__cve zeroday-vault__cve--${cve.severity}`}
              onClick={() => handleSelect(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(i); } }}
              role="button"
              tabIndex={0}
              aria-expanded={selected === i}
            >
              <div className="zeroday-vault__cve-id">{cve.id}</div>
              <div className={`zeroday-vault__cve-title zeroday-vault__cve-title--${cve.severity}`}>{cve.title}</div>
              <div className="zeroday-vault__cve-desc">{cve.desc}</div>
              <div className="zeroday-vault__cve-meta">
                <span className="zeroday-vault__cvss">CVSS {cve.cvss}</span>
                <span>{cve.severity.toUpperCase()}</span>
                <span>Vector: {cve.vector}</span>
              </div>
            </div>
            {selected === i && (
              <div className="zeroday-vault__detail">
                <div style={{ color: '#888', fontSize: '0.45rem' }}>Proof of Concept:</div>
                <div className="zeroday-vault__poc">{cve.poc}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="zeroday-vault__status">
        {viewed.size}/{CVES.length} vulnerabilities reviewed | {alertMode ? '🔴 THREAT LEVEL: MAXIMUM' : 'Click to expand PoC'}
      </div>
    </motion.div>
  );
}

export default memo(ZeroDayVault);
