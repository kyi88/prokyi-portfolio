import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ThemePreview.css';

/**
 * ThemePreview — shows a brief toast when the theme changes.
 * Listens for 'prokyi-theme-sync' events.
 */
const ThemePreview = memo(function ThemePreview() {
  const [preview, setPreview] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onChange = (e) => {
      const theme = e.detail;
      setPreview(theme === 'green' ? 'Hacker Green 🟢' : 'Cyber Blue 🔵');
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPreview(null), 2000);
    };
    window.addEventListener('prokyi-theme-sync', onChange);
    return () => {
      window.removeEventListener('prokyi-theme-sync', onChange);
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          className="theme-preview"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
        >
          <span className="theme-preview__label">THEME:</span> {preview}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ThemePreview;
