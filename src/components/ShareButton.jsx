import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ShareButton.css';

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const data = {
      title: 'prokyi — Cyberpunk Portfolio',
      text: 'ぷろきぃのサイバーパンクポートフォリオ ⚡',
      url: window.location.href,
    };

    if (navigator.share) {
      try { await navigator.share(data); } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = data.url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, []);

  return (
    <div className="share-wrap">
      <motion.button
        className="share-btn"
        onClick={handleShare}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="このサイトを共有する"
        title="Share"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </motion.button>
      <AnimatePresence>
        {copied && (
          <motion.span
            className="share-toast"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            📋 LINK COPIED
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ShareButton);
