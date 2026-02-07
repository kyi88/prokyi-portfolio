import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './SynapticFirewall.css';

const NODE_COUNT = 12;
const LABELS = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ'];

function initNodes() {
  return Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    label: LABELS[i],
    state: 'safe', // safe | blocked | infected
  }));
}

function SynapticFirewall() {
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState(initNodes);
  const [running, setRunning] = useState(false);
  const [blocked, setBlocked] = useState(0);
  const [infected, setInfected] = useState(0);
  const [targetNode, setTargetNode] = useState(null);
  const [compromised, setCompromised] = useState(false);
  const timerRef = useRef(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-firewall-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-firewall-toggle', handler);
    };
  }, [open]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    activeRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      activeRef.current = false;
      setNodes(initNodes());
      setRunning(false);
      setBlocked(0);
      setInfected(0);
      setTargetNode(null);
      setCompromised(false);
    }
  }, [open]);

  const handleNodeClick = useCallback((idx) => {
    if (!running) return;
    setNodes((prev) => {
      const next = [...prev];
      if (next[idx].state === 'safe' && idx === targetNode) {
        // Successfully blocked the attack
        next[idx] = { ...next[idx], state: 'blocked' };
        setBlocked((b) => b + 1);
        setTargetNode(null);
      }
      return next;
    });
  }, [running, targetNode]);

  const startDefense = useCallback(() => {
    if (running) return;
    setRunning(true);
    activeRef.current = true;
    setNodes(initNodes());
    setBlocked(0);
    setInfected(0);
    setTargetNode(null);
    setCompromised(false);

    let round = 0;
    timerRef.current = setInterval(() => {
      round++;
      setNodes((prev) => {
        const safeNodes = prev.map((n, i) => (n.state === 'safe' ? i : -1)).filter((i) => i >= 0);
        if (safeNodes.length === 0) {
          clearInterval(timerRef.current);
          setRunning(false);
          setCompromised(true);
          return prev;
        }

        // Pick a target
        const target = safeNodes[Math.floor(Math.random() * safeNodes.length)];
        setTargetNode(target);

        // After 1.5s, if not blocked, infect
        setTimeout(() => {
          if (!activeRef.current) return;
          setNodes((cur) => {
            if (cur[target].state === 'safe') {
              const updated = [...cur];
              updated[target] = { ...updated[target], state: 'infected' };
              setInfected((inf) => {
                const next = inf + 1;
                // Check if all infected
                const remaining = updated.filter((n) => n.state === 'safe').length;
                if (remaining === 0) {
                  clearInterval(timerRef.current);
                  setRunning(false);
                  setCompromised(true);
                }
                return next;
              });
              return updated;
            }
            return cur;
          });
          setTargetNode(null);
        }, 1500);

        return prev;
      });
    }, 2000);
  }, [running]);

  if (!open) return null;

  const total = NODE_COUNT;
  const safeCount = nodes.filter((n) => n.state === 'safe').length;
  const blockRate = blocked + infected > 0 ? Math.round((blocked / (blocked + infected)) * 100) : 100;

  return (
    <motion.div
      className="synaptic-firewall"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Synaptic Firewall"
      aria-modal="true"
    >
      <div className="synaptic-firewall__header">
        <span>🧠 SYNAPTIC FIREWALL</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {!running && !compromised && (
            <button className="synaptic-firewall__btn" onClick={startDefense}>▶ DEFEND</button>
          )}
          {(compromised || (!running && (blocked > 0 || infected > 0))) && (
            <button className="synaptic-firewall__btn" onClick={startDefense}>↻ RETRY</button>
          )}
          <button className="synaptic-firewall__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
      </div>

      <div className="synaptic-firewall__grid">
        {nodes.map((node, i) => (
          <div
            key={node.id}
            className={`synaptic-firewall__node synaptic-firewall__node--${node.state}${targetNode === i ? ' synaptic-firewall__node--target' : ''}`}
            onClick={() => handleNodeClick(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(i); } }}
            role="button"
            tabIndex={0}
            aria-label={`Node ${node.label}: ${node.state}${targetNode === i ? ' — under attack!' : ''}`}
          >
            {node.label}
          </div>
        ))}
      </div>

      <div className="synaptic-firewall__hud">
        <div className="synaptic-firewall__hud-item">
          <div className="synaptic-firewall__hud-label">Block Rate</div>
          <div className={`synaptic-firewall__hud-value ${blockRate >= 70 ? 'synaptic-firewall__hud-value--good' : blockRate >= 40 ? 'synaptic-firewall__hud-value--warn' : 'synaptic-firewall__hud-value--bad'}`}>
            {blockRate}%
          </div>
        </div>
        <div className="synaptic-firewall__hud-item">
          <div className="synaptic-firewall__hud-label">Safe Nodes</div>
          <div className={`synaptic-firewall__hud-value ${safeCount > 6 ? 'synaptic-firewall__hud-value--good' : safeCount > 3 ? 'synaptic-firewall__hud-value--warn' : 'synaptic-firewall__hud-value--bad'}`}>
            {safeCount}/{total}
          </div>
        </div>
        <div className="synaptic-firewall__hud-item">
          <div className="synaptic-firewall__hud-label">Blocked</div>
          <div className="synaptic-firewall__hud-value synaptic-firewall__hud-value--good">{blocked}</div>
        </div>
      </div>

      {compromised && (
        <div className="synaptic-firewall__compromised">
          ⚠ NEURAL FIREWALL COMPROMISED — INITIATING CONSCIOUSNESS BACKUP...
        </div>
      )}

      <div className="synaptic-firewall__status">
        {running ? 'Click glowing nodes to block incoming threats!' : compromised ? 'All nodes infected. Try again.' : 'Press ▶ DEFEND to start'}
      </div>
    </motion.div>
  );
}

export default memo(SynapticFirewall);
