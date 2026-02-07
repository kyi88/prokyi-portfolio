import { useState, useEffect, useCallback, memo } from 'react';
import './ScanLine.css';

/**
 * ScanLine — CRT scanline + VHS noise overlay easter egg.
 * Toggle via Ctrl+Shift+S or CyberTerminal "crt" command.
 */
const ScanLine = memo(function ScanLine() {
  const [active, setActive] = useState(false);

  const toggle = useCallback(() => setActive(p => !p), []);

  // Keyboard shortcut: Ctrl+Shift+S
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  // Listen for CyberTerminal "crt" command
  useEffect(() => {
    const onCrt = () => toggle();
    window.addEventListener('prokyi-crt-toggle', onCrt);
    return () => window.removeEventListener('prokyi-crt-toggle', onCrt);
  }, [toggle]);

  if (!active) return null;

  return (
    <div className="scanline-overlay" aria-hidden="true">
      <div className="scanline-overlay__lines" />
      <div className="scanline-overlay__noise" />
      <div className="scanline-overlay__flicker" />
    </div>
  );
});

export default ScanLine;
