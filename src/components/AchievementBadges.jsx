import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AchievementBadges.css';

const ACHIEVEMENTS = [
  { id: 'first_visit', icon: '🌟', title: 'FIRST CONNECT', desc: '初回アクセス', condition: () => true },
  { id: 'scroll_bottom', icon: '🏁', title: 'DEEP DIVER', desc: 'ページ最下部まで到達', condition: null },
  { id: 'night_owl', icon: '🦉', title: 'NIGHT OWL', desc: '深夜にアクセス (0-5時)', condition: () => { const h = new Date().getHours(); return h >= 0 && h < 5; } },
  { id: 'returner', icon: '🔄', title: 'RETURNER', desc: '3回以上訪問', condition: () => parseInt(localStorage.getItem('prokyi_visits') || '0') >= 3 },
  { id: 'theme_switch', icon: '🎨', title: 'STYLE HACKER', desc: 'テーマを切り替えた', condition: null },
];

function AchievementBadges() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('prokyi_achievements') || '[]'); } catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const toastQueueRef = useRef([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const prevUnlockedRef = useRef(unlocked);

  const unlock = (id) => {
    setUnlocked(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  // Side effects when unlocked changes — kept outside updater for purity
  useEffect(() => {
    const prev = prevUnlockedRef.current;
    prevUnlockedRef.current = unlocked;
    localStorage.setItem('prokyi_achievements', JSON.stringify(unlocked));
    const newIds = unlocked.filter(id => !prev.includes(id));
    if (newIds.length > 0) {
      const newAchievements = newIds
        .map(id => ACHIEVEMENTS.find(a => a.id === id))
        .filter(Boolean);
      toastQueueRef.current.push(...newAchievements);
      // Start showing queue if not already showing
      if (!toast && toastQueueRef.current.length > 0) {
        const next = toastQueueRef.current.shift();
        setToast(next);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
      }
    }
  }, [unlocked]);

  // Check condition-based achievements on mount
  useEffect(() => {
    const timers = [];
    ACHIEVEMENTS.forEach(a => {
      if (a.condition && a.condition()) {
        // Delay so toast appears after page loads
        timers.push(setTimeout(() => unlock(a.id), 2000 + Math.random() * 1000));
      }
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Scroll to bottom detection
  useEffect(() => {
    const onScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      if (scrollBottom >= document.documentElement.scrollHeight - 50) {
        unlock('scroll_bottom');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Theme switch detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      unlock('theme_switch');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Show next toast from queue when current toast disappears
  useEffect(() => {
    if (!toast && toastQueueRef.current.length > 0) {
      const next = toastQueueRef.current.shift();
      const timer = setTimeout(() => {
        setToast(next);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Escape key closes panel
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setPanelOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen]);

  // Cleanup
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  return (
    <>
      {/* Trophy button */}
      <motion.button
        className="achievement-btn"
        onClick={() => setPanelOpen(p => !p)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`実績 (${unlocked.length}/${ACHIEVEMENTS.length})`}
        title={`${unlocked.length}/${ACHIEVEMENTS.length} Achievements`}
      >
        🏆
        {unlocked.length > 0 && (
          <span className="achievement-btn__count">{unlocked.length}</span>
        )}
      </motion.button>

      {/* Achievement toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="achievement-toast"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="achievement-toast__icon">{toast.icon}</span>
            <div>
              <p className="achievement-toast__title">ACHIEVEMENT UNLOCKED</p>
              <p className="achievement-toast__name">{toast.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            className="achievement-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="achievement-panel__header">
              <span>🏆 ACHIEVEMENTS</span>
              <span className="achievement-panel__progress">
                {unlocked.length}/{ACHIEVEMENTS.length}
              </span>
            </div>
            <div className="achievement-panel__list">
              {ACHIEVEMENTS.map(a => {
                const isUnlocked = unlocked.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`achievement-item ${isUnlocked ? 'achievement-item--unlocked' : ''}`}
                  >
                    <span className="achievement-item__icon">{isUnlocked ? a.icon : '🔒'}</span>
                    <div>
                      <p className="achievement-item__title">{isUnlocked ? a.title : '???'}</p>
                      <p className="achievement-item__desc">{isUnlocked ? a.desc : '未解放'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(AchievementBadges);
