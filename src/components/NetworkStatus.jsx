import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NetworkStatus.css';

function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setRestored(true);
      setShowToast(true);
      const t = setTimeout(() => { setShowToast(false); setRestored(false); }, 3000);
      return () => clearTimeout(t);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowToast(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          className={`net-toast ${online ? 'net-toast--online' : 'net-toast--offline'}`}
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          role="status"
          aria-live="polite"
        >
          <span className="net-toast__led" />
          <span className="net-toast__text">
            {online ? '📡 CONNECTION RESTORED' : '⚠ SIGNAL LOST — OFFLINE MODE'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(NetworkStatus);
