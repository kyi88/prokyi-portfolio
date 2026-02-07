import { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import './CodeBlock.css';

const CODE_LINES = [
  { indent: 0, text: 'const prokyi = {', color: 'keyword' },
  { indent: 1, text: 'name: "ぷろきぃ",', color: 'string' },
  { indent: 1, text: 'university: "ZEN大学",', color: 'string' },
  { indent: 1, text: 'interests: ["AI", "Web", "Cyberpunk"],', color: 'string' },
  { indent: 1, text: 'languages: ["Python", "JavaScript", "TypeScript"],', color: 'string' },
  { indent: 1, text: 'os: "Arch Linux",', color: 'string' },
  { indent: 1, text: 'motto: "コードは詩、バグは散文",', color: 'comment' },
  { indent: 1, text: 'level: 19,', color: 'number' },
  { indent: 1, text: 'active: true,', color: 'boolean' },
  { indent: 0, text: '};', color: 'keyword' },
  { indent: 0, text: '', color: '' },
  { indent: 0, text: 'export default prokyi;', color: 'keyword' },
];

const CodeBlock = memo(function CodeBlock() {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect();
        let i = 0;
        const iv = setInterval(() => {
          i++;
          setVisibleLines(i);
          if (i >= CODE_LINES.length) clearInterval(iv);
        }, 120);
      }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="code-block" aria-label="プロフィールコード">
      <div className="code-block__header">
        <span className="code-block__dot code-block__dot--red" />
        <span className="code-block__dot code-block__dot--yellow" />
        <span className="code-block__dot code-block__dot--green" />
        <span className="code-block__filename">prokyi.config.ts</span>
      </div>
      <pre className="code-block__body">
        {CODE_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            className="code-block__line"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="code-block__ln">{String(i + 1).padStart(2, ' ')}</span>
            <span className={`code-block__code code-block__code--${line.color}`}>
              {'  '.repeat(line.indent)}{line.text}
            </span>
          </motion.div>
        ))}
        {visibleLines < CODE_LINES.length && (
          <span className="code-block__cursor" aria-hidden="true">▌</span>
        )}
      </pre>
    </div>
  );
});

export default CodeBlock;
