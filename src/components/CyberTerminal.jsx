import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CyberTerminal.css';

const HELP_TEXT = [
  'Available commands:',
  '  help     — Show this message',
  '  whoami   — About prokyi',
  '  stats    — Character stats',
  '  skills   — Skill levels',
  '  tree     — Skill dependency tree',
  '  gadgets  — Inventory list',
  '  goals    — Current objectives',
  '  projects — Project list',
  '  theme    — Toggle color theme',
  '  uptime   — Session uptime',
  '  random   — Random cyber fact',
  '  secret   — ???',
  '  matrix   — Enter the matrix',
  '  clear    — Clear terminal',
  '  exit     — Close terminal',
];

const COMMANDS = {
  help: () => HELP_TEXT,
  whoami: () => [
    '┌──────────────────────────────────┐',
    '│  USER: ぷろきぃ (prokyi)         │',
    '│  ROLE: AI/DS Engineer Candidate  │',
    '│  BASE: Chiba, Japan             │',
    '│  ORG:  ZEN University           │',
    '│  LV:   19                       │',
    '│  STATUS: ONLINE                 │',
    '└──────────────────────────────────┘',
  ],
  stats: () => [
    '[PLAYER STATS]',
    '  視力      : 0.1 (DEBUFF: メガネ必須)',
    '  身長      : 163 cm',
    '  体重      : 49 kg',
    '  50m走    : 7.8 sec',
    '  ロマンス  : N/A (未実装)',
    '  持ち家    : あり',
    '  家族      : 父 / 母 / 弟',
  ],
  skills: () => [
    '[SKILL MODULES]',
    '  Python      ████████████░░░░░░░░  55%',
    '  Linux       ██████████░░░░░░░░░░  50%',
    '  JavaScript  █████████░░░░░░░░░░░  45%',
    '  React       ████████░░░░░░░░░░░░  40%',
    '  Docker      ███████░░░░░░░░░░░░░  35%',
    '  AI / ML     ██████░░░░░░░░░░░░░░  30%',
  ],
  gadgets: () => [
    '[INVENTORY]',
    '  PC > MacBook Pro M3 Pro',
    '  PC > Mac Mini M4 Pro',
    '  PC > 自作PC (Ryzen 7 5700X / RTX 4060)',
    '  PC > ThinkPad T14 Gen 5 (Ultra 5 125U)',
    '  MOB > Galaxy S25+ / Pixel 9',
    '  AUDIO > Soundcore Space One Pro',
    '  AUDIO > JBL Tour Pro 3',
    '  AUDIO > Edifier MR3',
    '  GAME > AYN Thor [MAX] (SD 8 Gen 2)',
  ],
  goals: () => [
    '[CURRENT OBJECTIVES]',
    '  ► LLMアプリケーション開発   [████░░░░░░░░░] 20%',
    '  ► サーバー管理・構築        [███░░░░░░░░░░] 15%',
    '  ► 動画制作スキル            [██░░░░░░░░░░░] 10%',
    '  ► 3Dモデリング              [█░░░░░░░░░░░░]  5%',
  ],
  secret: () => [
    '╔══════════════════════════════════╗',
    '║  ▓▓ CLASSIFIED INFORMATION ▓▓   ║',
    '║                                 ║',
    '║  志村けんに会ったことがある。     ║',
    '║  Legend encounter at age ??.     ║',
    '║                                 ║',
    '║  乳糖不耐性 — 牛乳は敵          ║',
    '║  カフェイン不耐性 — コーヒー✕    ║',
    '║  排気機能不全 — ゲップできない    ║',
    '║                                 ║',
    '╚══════════════════════════════════╝',
  ],
  matrix: () => {
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789';
    return Array.from({ length: 8 }, () =>
      Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    );
  },
  projects: () => [
    '[PROJECTS]',
    '  ► prokyi-portfolio  — This cyberdeck portfolio (React + Three.js)',
    '  ► zenbukko          — Automated course downloader & transcriber',
    '  ► home-lab          — Self-hosted server infrastructure',
    '  ► ...more in development',
  ],
  tree: () => [
    '[SKILL DEPENDENCY TREE]',
    '  ┌─ Web Dev',
    '  │  ├─ HTML/CSS ···················· ✓ base',
    '  │  ├─ JavaScript (45%) ──┐',
    '  │  │                     ├─ React (40%)',
    '  │  │                     └─ Node.js (planned)',
    '  │  └─ TypeScript (planned)',
    '  │',
    '  ├─ Systems',
    '  │  ├─ Linux (50%) ───────┐',
    '  │  │                     ├─ Docker (35%)',
    '  │  │                     └─ Server Admin (15%)',
    '  │  └─ Networking (planned)',
    '  │',
    '  ├─ Data / AI',
    '  │  ├─ Python (55%) ──────┐',
    '  │  │                     ├─ AI/ML (30%)',
    '  │  │                     └─ LLM Apps (20%)',
    '  │  └─ Data Engineering (planned)',
    '  │',
    '  └─ Creative',
    '     ├─ Video Editing (10%)',
    '     └─ 3D Modeling (5%)',
  ],
  uptime: () => {
    const ms = Math.round(performance.now());
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);
    return [
      `[SESSION UPTIME]`,
      `  ${hrs}h ${min % 60}m ${sec % 60}s (${ms.toLocaleString()}ms)`,
      `  Page opened: ${new Date(Date.now() - ms).toLocaleTimeString('ja-JP')}`,
    ];
  },
  theme: () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'green') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('prokyi_theme', 'cyber');
      window.dispatchEvent(new CustomEvent('prokyi-theme-sync', { detail: 'cyber' }));
      return ['[THEME] Switched to 🔵 Cyber Blue'];
    } else {
      document.documentElement.setAttribute('data-theme', 'green');
      localStorage.setItem('prokyi_theme', 'green');
      window.dispatchEvent(new CustomEvent('prokyi-theme-sync', { detail: 'green' }));
      return ['[THEME] Switched to 🟢 Hacker Green'];
    }
  },
  random: () => {
    const facts = [
      '💡 このポートフォリオには10個のイースターエッグが隠されている。',
      '🎮 コナミコマンドを入力するとレトロモードが発動する。',
      '⌨️ バックティック(`)でこのターミナルが開く。',
      '🍣 prokyi は寿司屋のキッチンで働いた経験がある。',
      '🎧 prokyi の愛用ヘッドホンは Soundcore Space One Pro。',
      '📱 prokyi は Galaxy S25+ と Pixel 9 の二刀流。',
      '🖥️ prokyi の自作PCは Ryzen 7 5700X + RTX 4060。',
      '⚡ このサイトは34以上のループ改善を経て今の形になった。',
      '👁️ prokyi の視力は 0.1 — メガネ必須。',
      '🥛 乳糖不耐性: 牛乳を飲むと大変なことになる。',
    ];
    return [`[RANDOM FACT]`, `  ${facts[Math.floor(Math.random() * facts.length)]}`];
  },
};

export default function CyberTerminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState([
    '> PROKYI CYBERDECK v2.0',
    '> Type "help" for available commands.',
    '',
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Toggle with backtick
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
        // Don't trigger in input/textarea
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const exec = useCallback((cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines = [`prokyi@cyber:~$ ${cmd}`];

    if (trimmed === 'exit') {
      setOpen(false);
      return;
    }
    if (trimmed === 'clear') {
      setLines(['']);
      return;
    }
    if (trimmed === '') {
      setLines(prev => [...prev, ...newLines]);
      return;
    }

    const handler = COMMANDS[trimmed];
    if (handler) {
      const result = handler();
      newLines.push(...result);
    } else {
      newLines.push(`  command not found: ${trimmed}`, '  Type "help" for available commands.');
    }
    newLines.push('');
    setLines(prev => [...prev, ...newLines]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    exec(input);
    setInput('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cyber-terminal"
          initial={{ opacity: 0, y: -30, scaleY: 0.8 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -30, scaleY: 0.8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cyber-terminal__bar">
            <span className="cyber-terminal__dot cyber-terminal__dot--r" />
            <span className="cyber-terminal__dot cyber-terminal__dot--y" />
            <span className="cyber-terminal__dot cyber-terminal__dot--g" />
            <span className="cyber-terminal__bar-title">prokyi@cyberdeck:~</span>
            <button className="cyber-terminal__close" onClick={() => setOpen(false)} aria-label="Close terminal">✕</button>
          </div>
          <div className="cyber-terminal__body" ref={scrollRef}>
            {lines.map((line, i) => (
              <div key={i} className={`cyber-terminal__line ${line.startsWith('prokyi@') ? 'cyber-terminal__line--cmd' : ''}`}>
                {line}
              </div>
            ))}
            <form onSubmit={handleSubmit} className="cyber-terminal__prompt">
              <span className="cyber-terminal__prompt-prefix">prokyi@cyber:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="cyber-terminal__input"
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
