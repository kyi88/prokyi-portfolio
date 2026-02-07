import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NetworkStatus.css';

function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowToast(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowToast(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      clearTimeout(timerRef.current);
      setShowToast(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timerRef.current);
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
