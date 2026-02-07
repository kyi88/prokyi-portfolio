import { useState, useEffect, useRef, memo, useCallback } from 'react';
import './ProcessMonitor.css';

const PROCESSES = [
  { name: 'MatrixRain', pid: 1001, mem: 128, killable: true, event: 'prokyi-process-matrixrain' },
  { name: 'ScanLine', pid: 1002, mem: 32, killable: true, event: 'prokyi-process-scanline' },
  { name: 'ParallaxStars', pid: 1003, mem: 64, killable: true, event: 'prokyi-process-parallaxstars' },
  { name: 'ClickSpark', pid: 1004, mem: 16, killable: true, event: 'prokyi-process-clickspark' },
  { name: 'DataStream', pid: 1005, mem: 48, killable: true, event: 'prokyi-process-datastream' },
  { name: 'CyberBG', pid: 1, mem: 2048, killable: false },   // kernel — unkillable
  { name: 'Vite/React', pid: 2, mem: 4096, killable: false },
];

/**
 * ProcessMonitor — Linux `top` style process table in Sidebar.
 * Toggle decorative components on/off via custom events.
 */
function ProcessMonitor() {
  const [open, setOpen] = useState(false);
  const [killed, setKilled] = useState(new Set());
  const [cpuTick, setCpuTick] = useState(0);
  const timerRef = useRef(null);

  // Fake CPU flicker every 2s
  useEffect(() => {
    if (!open) return;
    timerRef.current = setInterval(() => setCpuTick((t) => t + 1), 2000);
    return () => clearInterval(timerRef.current);
  }, [open]);

  const killProcess = useCallback((proc) => {
    if (!proc.killable) {
      // Easter egg: trying to kill PID 1
      window.dispatchEvent(new CustomEvent('prokyi-kernel-panic'));
      return;
    }
    setKilled((prev) => {
      const next = new Set(prev);
      if (next.has(proc.pid)) {
        next.delete(proc.pid);
        window.dispatchEvent(new CustomEvent(proc.event, { detail: { alive: true } }));
      } else {
        next.add(proc.pid);
        window.dispatchEvent(new CustomEvent(proc.event, { detail: { alive: false } }));
      }
      return next;
    });
  }, []);

  // Fake CPU percentage seeded by pid+tick
  const fakeCpu = (pid) => {
    const base = ((pid * 7 + cpuTick * 3) % 30) / 10;
    return base.toFixed(1);
  };

  return (
    <div className="process-monitor">
      <button className="process-monitor__header" onClick={() => setOpen((p) => !p)}>
        <span className={`process-monitor__toggle${open ? ' process-monitor__toggle--open' : ''}`}>▶</span>
        PROCESSES ({PROCESSES.length})
      </button>
      {open && (
        <table className="process-monitor__table">
          <thead>
            <tr>
              <th>PID</th>
              <th>NAME</th>
              <th>CPU%</th>
              <th>MEM</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {PROCESSES.map((p) => {
              const isKilled = killed.has(p.pid);
              return (
                <tr key={p.pid} className={isKilled ? 'process-monitor__row--killed' : ''}>
                  <td>{p.pid}</td>
                  <td>{p.name}</td>
                  <td>{isKilled ? '0.0' : fakeCpu(p.pid)}</td>
                  <td>{isKilled ? 0 : p.mem}K</td>
                  <td>
                    <span className={isKilled ? 'process-monitor__status--killed' : 'process-monitor__status--running'}>
                      {isKilled ? 'KILLED' : 'RUN'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="process-monitor__kill-btn"
                      onClick={() => killProcess(p)}
                      aria-label={isKilled ? `Start ${p.name}` : `Kill ${p.name}`}
                    >
                      {isKilled ? 'START' : 'KILL'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default memo(ProcessMonitor);
