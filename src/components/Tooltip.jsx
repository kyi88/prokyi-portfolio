import { useState, useRef, useCallback, useEffect, useId, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Tooltip.css';

/**
 * Tooltip — cyberpunk-styled tooltip shown on hover.
 * Wraps children and shows `content` above on hover.
 */
const Tooltip = memo(function Tooltip({ content, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const showTimer = useRef(null);
  const tooltipId = useId();

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(showTimer.current), []);

  const show = useCallback(() => {
    clearTimeout(showTimer.current);
    showTimer.current = setTimeout(() => {
      if (wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: position === 'top' ? rect.top : rect.bottom,
        });
      }
      setVisible(true);
    }, 300);
  }, [position]);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    setVisible(false);
  }, []);

  return (
    <>
      <span
        ref={wrapRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="tooltip-trigger"
        aria-describedby={visible ? tooltipId : undefined}
      >
        {children}
      </span>
      <AnimatePresence>
        {visible && (
          <motion.div
            className={`tooltip tooltip--${position}`}
            style={{
              left: coords.x,
              top: position === 'top' ? coords.y : undefined,
              bottom: position === 'bottom' ? `calc(100vh - ${coords.y}px)` : undefined,
            }}
            initial={{ opacity: 0, y: position === 'top' ? 6 : -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'top' ? 6 : -6, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            role="tooltip"
            id={tooltipId}
          >
            <span className="tooltip__arrow" />
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default Tooltip;
