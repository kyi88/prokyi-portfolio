import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeBanner.css';

export default function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('prokyi_visited');
    if (!visited) {
      setShow(true);
      sessionStorage.setItem('prokyi_visited', '1');
    }
  }, []);

  const dismiss = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="welcome-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="welcome-banner__text">
            🔮 <strong>prokyi のサイバーデッキへようこそ</strong> — ?,  `, Ctrl+K, コナミコマンド を試してみて！
          </span>
          <button className="welcome-banner__close" onClick={dismiss} aria-label="閉じる">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
