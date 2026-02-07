import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSecurityLog } from './IntrusionAlert';
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
  '  date     — Show current date/time',
  '  neofetch — System info',
  '  ping     — Ping the matrix',
  '  fortune  — Random fortune cookie',
  '  crt      — Toggle CRT scanline overlay',
  '  cursor   — Toggle custom cursor',
  '  decrypt  — Decrypt animation on text',
  '  security-log — View intrusion log',
  '  phantom  — Toggle ghost cursor',
  '  ghost    — Toggle UV scan mode',
  '  surveillance — View camera grid',
  '  coredump — Toggle hex memory viewer',
  '  scan     — Scan radio frequencies',
  '  tune     — Toggle radio tuner (S key)',
  '  nmap     — Port scan prokyi.local',
  '  clamscan — Malware threat scanner',
  '  sniff    — Packet sniffer (Wireshark)',
  '  defrag   — Memory defragmenter',
  '  neurallink — Neural link sync monitor',
  '  darknet  — Tor circuit relay viewer',
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
    '  住居      : 公営住宅 (Public Sector Dwelling)',
    '  家族      : 母子家庭 / 一人っ子 (Lone Wolf Origin)',
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
    '  PC    > メインPC (Ryzen 7 5700X / RTX 4070 Ti SUPER)',
    '  PC    > サブPC (Ryzen 9 PRO 6950H)',
    '  NOTE  > MacBook Air (M1)',
    '  NOTE  > ASUS VivoBook 15 X1504ZA',
    '  TAB   > OnePlus Pad 3 / iPad Air (M2)',
    '  MOB   > iPhone 13 Pro Max / Galaxy Z Fold4',
    '  MOB   > HUAWEI P50 Pro / Nothing CMF Phone 1',
    '  AUDIO > Soundcore Space One Pro / JBL Tour Pro 3',
    '  AUDIO > Edifier MR3',
    '  GAME  > AYN Thor [MAX] (SD 8 Gen 2)',
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
      '📱 prokyi は iPhone 13 Pro Max と Galaxy Z Fold4 の二刀流。',
      '🖥️ prokyi の自作PCは Ryzen 7 5700X + RTX 4070 Ti SUPER。',
      '⚡ このサイトは40以上のループ改善を経て今の形になった。',
      '👁️ prokyi の視力は 0.1 — メガネ必須。',
      '🥛 乳糖不耐性: 牛乳を飲むと大変なことになる。',
    ];
    return [`[RANDOM FACT]`, `  ${facts[Math.floor(Math.random() * facts.length)]}`];
  },
  date: () => {
    const now = new Date();
    return [
      `[DATE/TIME]`,
      `  ${now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}`,
      `  ${now.toLocaleTimeString('ja-JP')}`,
      `  Unix: ${Math.floor(now.getTime() / 1000)}`,
    ];
  },
  neofetch: () => [
    '  ┌─────────────────────────────────┐',
    '  │  ██████╗ ██╗  ██╗██╗   ██╗     │',
    '  │  ██╔══██╗██║ ██╔╝╚██╗ ██╔╝     │',
    '  │  ██████╔╝█████╔╝  ╚████╔╝      │',
    '  │  ██╔═══╝ ██╔═██╗   ╚██╔╝       │',
    '  │  ██║     ██║  ██╗   ██║        │',
    '  │  ╚═╝     ╚═╝  ╚═╝   ╚═╝        │',
    '  └─────────────────────────────────┘',
    `  OS: CyberDeck OS v2.0`,
    `  Host: prokyi-portfolio`,
    `  Kernel: React 19.x`,
    `  Shell: CyberTerminal v1.0`,
    `  DE: Framer Motion 11`,
    `  WM: Vite 6.4.1`,
    `  GPU: Three.js r${typeof window !== 'undefined' ? '170' : '???'}`,
    `  Memory: ${typeof performance !== 'undefined' && performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'N/A'}`,
    `  Uptime: ${Math.floor(performance.now() / 1000)}s`,
  ],
  ping: () => {
    const latency = Math.floor(Math.random() * 30 + 5);
    return [
      `PING matrix.cyber (127.0.0.1): 56 data bytes`,
      `64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=${latency}ms`,
      `64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=${latency + Math.floor(Math.random() * 10)}ms`,
      `64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=${latency + Math.floor(Math.random() * 5)}ms`,
      `--- matrix.cyber ping statistics ---`,
      `3 packets transmitted, 3 packets received, 0% packet loss`,
    ];
  },
  fortune: () => {
    const fortunes = [
      '🥠 今日のバグは明日のフィーチャーになる',
      '🥠 コードを書く者、コードに語られる',
      '🥠 sudo rm -rf / はジョークであり、実行してはいけない',
      '🥠 コミットメッセージに「fix」だけ書く者に幸あれ',
      '🥠 Stack Overflow は盲目の巨人の肩の上に立つことである',
      '🥠 バックアップを取らぬ者は、バックアップの大切さを知ることになる',
      '🥠 「undefined is not a function」— JavaScript の詩',
      '🥠 完璧なコードは存在しない。しかし完璧を目指す過程に意味がある',
    ];
    return [fortunes[Math.floor(Math.random() * fortunes.length)]];
  },
  crt: () => {
    window.dispatchEvent(new CustomEvent('prokyi-crt-toggle'));
    return ['📺 CRT scanline overlay toggled.'];
  },
  phantom: () => {
    window.dispatchEvent(new CustomEvent('prokyi-phantom-toggle'));
    return ['👻 Phantom cursor toggled.'];
  },
  ghost: () => {
    window.dispatchEvent(new CustomEvent('prokyi-ghost-toggle'));
    return ['👻 Ghost Protocol UV scan toggled. Press G to toggle manually.'];
  },
  surveillance: () => [
    '┌────────────────────────────────┐',
    '│  SURVEILLANCE GRID — 6 FEEDS  │',
    '├────────┬────────┬─────────────┤',
    '│ CAM-01 │ CAM-02 │ CAM-03      │',
    '│PROFILE │CAREER  │ GOALS       │',
    '├────────┼────────┼─────────────┤',
    '│ CAM-04 │ CAM-05 │ CAM-06      │',
    '│STATUS  │GADGETS │ LINKS       │',
    '└────────┴────────┴─────────────┘',
    '  All feeds ONLINE. Drag the PiP widget to reposition.',
  ],
  ps: () => [
    '[PROCESS TABLE]',
    '  PID  NAME            CPU%  MEM    STATUS',
    '  ───  ──────────────  ────  ─────  ──────',
    '  1    CyberBG         2.1   2048K  RUN',
    '  2    Vite/React      0.8   4096K  RUN',
    '  1001 MatrixRain      1.3   128K   RUN',
    '  1002 ScanLine        0.2   32K    RUN',
    '  1003 ParallaxStars   0.9   64K    RUN',
    '  1004 ClickSpark      0.1   16K    RUN',
    '  1005 DataStream      0.4   48K    RUN',
    '',
    '  Use ProcessMonitor in sidebar to kill/start processes.',
  ],
  coredump: () => {
    window.dispatchEvent(new CustomEvent('prokyi-coredump-toggle'));
    return ['💀 Core dump hex viewer toggled. (Ctrl+Shift+D)'];
  },
  scan: () => [
    '[FREQUENCY SCAN]',
    '  88.1 MHz ████████░░ SIGNAL — Station detected',
    '  91.7 MHz ██████░░░░ SIGNAL — Station detected',
    '  96.3 MHz █████░░░░░ SIGNAL — Station detected',
    ' 100.5 MHz ███████░░░ SIGNAL — Station detected',
    ' 103.5 MHz ████░░░░░░ SIGNAL — Station detected',
    '',
    '  5 stations found. Use "tune" to open the radio tuner.',
  ],
  tune: () => {
    window.dispatchEvent(new CustomEvent('prokyi-signal-toggle'));
    return ['📡 Signal Interceptor toggled. Press S to toggle manually.'];
  },
  nmap: () => {
    window.dispatchEvent(new CustomEvent('prokyi-portscan-toggle'));
    return ['🔍 Port Scanner opened. Scanning prokyi.local...'];
  },
  portscan: () => {
    window.dispatchEvent(new CustomEvent('prokyi-portscan-toggle'));
    return ['🔍 Port Scanner opened. Scanning prokyi.local...'];
  },
  clamscan: () => {
    window.dispatchEvent(new CustomEvent('prokyi-quarantine-toggle'));
    return ['🛡️ ClamAV Malware Scanner activated.'];
  },
  quarantine: () => {
    window.dispatchEvent(new CustomEvent('prokyi-quarantine-toggle'));
    return ['🛡️ ClamAV Malware Scanner activated.'];
  },
  sniff: () => {
    window.dispatchEvent(new CustomEvent('prokyi-sniff-toggle'));
    return ['🦈 Packet Sniffer activated. Capturing on eth0...'];
  },
  defrag: () => {
    window.dispatchEvent(new CustomEvent('prokyi-defrag-toggle'));
    return ['💾 Memory Defragmenter opened. Press ▶ DEFRAG to optimize.'];
  },
  neurallink: () => {
    window.dispatchEvent(new CustomEvent('prokyi-neurallink-toggle'));
    return ['🧠 Neural Link Sync Monitor activated.'];
  },
  darknet: () => {
    window.dispatchEvent(new CustomEvent('prokyi-darknet-toggle'));
    return ['🧅 Darknet Relay — Tor Circuit viewer opened.'];
  },
  cursor: () => {
    const doc = document.documentElement;
    const current = doc.style.cursor;
    if (current === 'none') {
      doc.style.cursor = '';
      const dot = document.getElementById('cyber-cursor');
      if (dot) dot.style.display = 'none';
      return ['🖱️ Custom cursor OFF — default cursor restored.'];
    } else {
      doc.style.cursor = 'none';
      const dot = document.getElementById('cyber-cursor');
      if (dot) dot.style.display = '';
      return ['🖱️ Custom cursor ON — cyber cursor active.'];
    }
  },
};

/* Commands that need arguments (handled in processCommand) */
const ARG_COMMANDS = {
  decrypt: (args) => {
    if (!args.trim()) return ['Usage: decrypt <text>'];
    const cipher = '▓█▒░ΨΔΩ∑λΞΠ₿⌐¥£€∞≈♦◊◄►▲▼ABCDEF0123456789';
    const encrypted = args.split('').map((c) =>
      c === ' ' ? ' ' : cipher[Math.floor(Math.random() * cipher.length)]
    ).join('');
    return [
      `[ENCRYPTED] ${encrypted}`,
      `[DECRYPTING...]`,
      `[DECRYPTED] ${args}`,
    ];
  },
  'security-log': () => {
    const log = getSecurityLog();
    if (log.length === 0) return ['[SECURITY LOG] No intrusions detected this session.'];
    return [
      '[SECURITY LOG]',
      `  Total alerts: ${log.length}`,
      '  ─────────────────────────────',
      ...log.map((entry, i) =>
        `  ${String(i + 1).padStart(2, '0')}. [${entry.time}] ${entry.type.toUpperCase()}`
      ),
    ];
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

  // Escape key to close terminal
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

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
    const raw = cmd.trim();
    const trimmed = raw.toLowerCase();
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
      // Check arg commands (e.g. "decrypt hello world")
      const spaceIdx = trimmed.indexOf(' ');
      const cmdName = spaceIdx > -1 ? trimmed.slice(0, spaceIdx) : trimmed;
      const rawArgs = spaceIdx > -1 ? raw.slice(raw.indexOf(' ') + 1) : '';
      const argHandler = ARG_COMMANDS[cmdName];
      if (argHandler) {
        const result = argHandler(rawArgs);
        newLines.push(...result);
      } else {
        newLines.push(`  command not found: ${trimmed}`, '  Type "help" for available commands.');
      }
    }
    newLines.push('');
    setLines(prev => [...prev, ...newLines].slice(-500));
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
          initial={{ opacity: 0, y: -30, scaleY: 0.8, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scaleY: 1, x: '-50%' }}
          exit={{ opacity: 0, y: -30, scaleY: 0.8, x: '-50%' }}
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
