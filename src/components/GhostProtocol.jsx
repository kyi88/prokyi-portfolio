import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GhostProtocol.css';

const TOTAL_MESSAGES = 6;
const STORAGE_KEY = 'prokyi_ghost_found';

function loadFound() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFound(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

/**
 * GhostProtocol — UV scan mode. Toggle with 'G' key.
 * Hidden .ghost-text elements throughout sections become visible.
 * Click to "decode" them. Find all for an achievement.
 */
function GhostProtocol() {
  const [active, setActive] = useState(false);
  const [banner, setBanner] = useState(false);
  const [found, setFound] = useState(() => loadFound());

  // Toggle with G key
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setActive((prev) => {
          const next = !prev;
          if (next) {
            document.documentElement.classList.add('ghost-active');
            setBanner(true);
            setTimeout(() => setBanner(false), 3000);
          } else {
            document.documentElement.classList.remove('ghost-active');
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Terminal command toggle
  useEffect(() => {
    const handler = () => {
      setActive((prev) => {
        const next = !prev;
        if (next) {
          document.documentElement.classList.add('ghost-active');
          setBanner(true);
          setTimeout(() => setBanner(false), 3000);
        } else {
          document.documentElement.classList.remove('ghost-active');
        }
        return next;
      });
    };
    window.addEventListener('prokyi-ghost-toggle', handler);
    return () => window.removeEventListener('prokyi-ghost-toggle', handler);
  }, []);

  // Listen for ghost-text clicks
  useEffect(() => {
    const handler = (e) => {
      const target = e.target.closest('.ghost-text');
      if (!target || !active) return;
      const id = target.dataset.ghostId;
      if (!id || found.has(id)) return;
      target.classList.add('ghost-text--found');
      setFound((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveFound(next);
        // Check completion
        if (next.size >= TOTAL_MESSAGES) {
          window.dispatchEvent(new CustomEvent('prokyi-achievement', { detail: 'GHOST IN THE SHELL' }));
        }
        return next;
      });
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [active, found]);

  // Mark already-found ghost text on mount
  useEffect(() => {
    found.forEach((id) => {
      const el = document.querySelector(`[data-ghost-id="${id}"]`);
      if (el) el.classList.add('ghost-text--found');
    });
  }, [found]);

  // Cleanup class on unmount
  useEffect(() => {
    return () => document.documentElement.classList.remove('ghost-active');
  }, []);

  return (
    <>
      <AnimatePresence>
        {banner && (
          <motion.div
            className="ghost-protocol-banner"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
          >
            ▸ GHOST PROTOCOL INITIATED — UV SCAN ACTIVE
          </motion.div>
        )}
      </AnimatePresence>
      {active && (
        <div className="ghost-protocol-counter">
          {found.size}/{TOTAL_MESSAGES} DECODED
        </div>
      )}
    </>
  );
}

export default memo(GhostProtocol);
