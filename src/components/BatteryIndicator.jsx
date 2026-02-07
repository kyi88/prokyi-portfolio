import { useState, useEffect, memo } from 'react';
import './BatteryIndicator.css';

/**
 * BatteryIndicator — shows device battery level using Battery API.
 * Falls back gracefully when API is unavailable.
 */
const BatteryIndicator = memo(function BatteryIndicator() {
  const [level, setLevel] = useState(null);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    if (!navigator.getBattery) return;
    let battery = null;
    let cancelled = false;
    const update = () => {
      if (!battery || cancelled) return;
      setLevel(Math.round(battery.level * 100));
      setCharging(battery.charging);
    };
    navigator.getBattery().then(b => {
      if (cancelled) return;
      battery = b;
      update();
      b.addEventListener('levelchange', update);
      b.addEventListener('chargingchange', update);
    });
    return () => {
      cancelled = true;
      if (battery) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    };
  }, []);

  if (level === null) return null;

  const color = level > 50 ? 'var(--c-green, #22d3a7)' : level > 20 ? '#f59e0b' : '#ff5f56';

  return (
    <div className="battery-indicator" aria-label={`バッテリー ${level}%${charging ? ' (充電中)' : ''}`}>
      <div className="battery-indicator__wrap">
        <div className="battery-indicator__shell">
          <div className="battery-indicator__fill" style={{ width: `${level}%`, background: color }} />
        </div>
        <div className="battery-indicator__cap" />
      </div>
      <span className="battery-indicator__text">
        {charging && '⚡'}{level}%
      </span>
    </div>
  );
});

export default BatteryIndicator;
