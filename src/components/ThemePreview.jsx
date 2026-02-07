import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ThemePreview.css';

/**
 * ThemePreview — shows a brief toast when the theme changes.
 * Listens for 'prokyi-theme-sync' events.
 */
const ThemePreview = memo(function ThemePreview() {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const onChange = (e) => {
      const theme = e.detail;
      setPreview(theme === 'green' ? 'Hacker Green 🟢' : 'Cyber Blue 🔵');
      const t = setTimeout(() => setPreview(null), 2000);
      // Store timeout for cleanup
      onChange._timer = t;
    };
    window.addEventListener('prokyi-theme-sync', onChange);
    return () => {
      window.removeEventListener('prokyi-theme-sync', onChange);
      clearTimeout(onChange._timer);
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
