import { useEffect, useState, useRef, lazy, Suspense, createContext, useContext } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Section from './components/Section';
import Profile from './components/Profile';
import Career from './components/Career';
import Goals from './components/Goals';
import Gadgets from './components/Gadgets';
import Links from './components/Links';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import EasterEggFab from './components/EasterEggFab';
import CyberTerminal from './components/CyberTerminal';
import KeyboardGuide from './components/KeyboardGuide';
import ScrollToTop from './components/ScrollToTop';
import CommandPalette from './components/CommandPalette';
import Minimap from './components/Minimap';
import WelcomeBanner from './components/WelcomeBanner';
import './App.css';

const CyberBackground = lazy(() => import('./components/CyberBackground'));
const StatusScreen = lazy(() => import('./components/StatusScreen'));

/* Sound context — global mute toggle */
export const SoundContext = createContext({ muted: false });
export function useSoundMuted() { return useContext(SoundContext).muted; }

/* CRT Scanline overlay — cyberpunk monitor aesthetic */
function CRTOverlay() {
  return (
    <div className="crt-overlay" aria-hidden="true">
      <div className="crt-overlay__scanlines" />
      <div className="crt-overlay__flicker" />
    </div>
  );
}

/* Parallax fog layers */
function ParallaxFog() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.18, 0.08, 0.12, 0.06]);

  return (
    <div className="parallax-fog" aria-hidden="true">
      <motion.div className="parallax-fog__layer parallax-fog__layer--1" style={{ y: y1, opacity }} />
      <motion.div className="parallax-fog__layer parallax-fog__layer--2" style={{ y: y2, opacity }} />
    </div>
  );
}

/* Random system glitch — brief full-screen distortion every ~25-40s */
function SystemGlitch() {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 150 + Math.random() * 200);
    };
    const schedule = () => {
      const delay = 25000 + Math.random() * 15000;
      return setTimeout(() => {
        trigger();
        timerId = schedule();
      }, delay);
    };
    let timerId = schedule();
    return () => clearTimeout(timerId);
  }, []);

  return (
    <AnimatePresence>
      {glitching && (
        <motion.div
          className="system-glitch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}

/* Section scroll SFX — subtle blip when a section enters viewport */
function useSectionSFX(mutedRef) {
  const playedRef = useRef(new Set());
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting && id && !playedRef.current.has(id)) {
            playedRef.current.add(id);
            if (mutedRef.current) return;
            try {
              if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
              }
              const ctx = audioCtxRef.current;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.value = 800 + Math.random() * 400;
              gain.gain.value = 0.015;
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
              osc.stop(ctx.currentTime + 0.08);
            } catch (_) {}
          }
        });
      },
      { threshold: 0.3 }
    );
    // Observe all sections
    document.querySelectorAll('.section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* System alert toasts — random cyber notifications */
function SystemAlerts() {
  const [alerts, setAlerts] = useState([]);
  const msgs = [
    '🔒 Firewall integrity: 98.7%',
    '📡 Neural link: stable',
    '⚡ Power cell: charging',
    '🛡️ Intrusion attempt blocked',
    '📊 Memory usage: optimal',
    '🔧 Self-repair subroutine active',
    '🌐 Network latency: 2ms',
    '🎯 Threat level: minimal',
  ];

  useEffect(() => {
    const spawn = () => {
      const id = Date.now();
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      setAlerts(prev => [...prev, { id, msg }]);
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }, 4000);
    };
    // Recursive setTimeout for truly random intervals
    let timerId = null;
    const schedule = () => {
      const delay = 30000 + Math.random() * 30000;
      timerId = setTimeout(() => {
        spawn();
        schedule();
      }, delay);
    };
    // First one after 15-30s
    timerId = setTimeout(() => {
      spawn();
      schedule();
    }, 15000 + Math.random() * 15000);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="system-alerts" aria-live="polite">
      <AnimatePresence>
        {alerts.map(a => (
          <motion.div
            key={a.id}
            className="system-alert"
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="system-alert__prefix">SYS</span>
            {a.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* Skeleton placeholder for StatusScreen lazy load */
const SKELETON_WIDTHS = [72, 85, 64, 91, 78];
function StatusSkeleton() {
  return (
    <div className="status-skeleton" aria-label="読み込み中">
      <div className="status-skeleton__tabs">
        {[1, 2, 3, 4].map(i => <div key={i} className="status-skeleton__tab" />)}
      </div>
      <div className="status-skeleton__body">
        {SKELETON_WIDTHS.map((w, i) => (
          <div key={i} className="status-skeleton__row" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function BootScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [showAscii, setShowAscii] = useState(true);
  const bootLines = [
    '[BOOT] Initializing prokyi.sys ...',
    '[OK]   Neural interface connected',
    '[OK]   Loading skill modules ...',
    '[OK]   Gadget inventory synced',
    '[OK]   Cyberdeck status: ONLINE',
    '[INIT] Rendering viewport ...',
  ];

  // Subtle boot beep via Web Audio API
  const playBeep = (freq = 440, dur = 0.04) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.stop(ctx.currentTime + dur + 0.01);
    } catch (_) {}
  };

  useEffect(() => {
    let i = 0;
    const freqs = [520, 600, 600, 600, 700, 880];
    // Hide ASCII art after first boot line
    const asciiTimer = setTimeout(() => setShowAscii(false), 600);
    const iv = setInterval(() => {
      if (i < bootLines.length) {
        const line = bootLines[i];
        const freq = freqs[i] || 600;
        i++;
        setLines(prev => [...prev, line]);
        playBeep(freq);
      } else {
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 180);
    return () => { clearInterval(iv); clearTimeout(asciiTimer); };
  }, []);

  const asciiArt = `
 ██████╗ ██████╗  ██████╗ ██╗  ██╗██╗   ██╗██╗
 ██╔══██╗██╔══██╗██╔═══██╗██║ ██╔╝╚██╗ ██╔╝██║
 ██████╔╝██████╔╝██║   ██║█████╔╝  ╚████╔╝ ██║
 ██╔═══╝ ██╔══██╗██║   ██║██╔═██╗   ╚██╔╝  ██║
 ██║     ██║  ██║╚██████╔╝██║  ██╗   ██║   ██║
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝`;

  return (
    <motion.div
      className="boot-screen"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <div className="boot-screen__inner">
        {/* ASCII art header */}
        <motion.pre
          className="boot-screen__ascii"
          initial={{ opacity: 0 }}
          animate={{ opacity: showAscii ? 1 : 0.15 }}
          transition={{ duration: 0.6 }}
          aria-hidden="true"
        >{asciiArt}</motion.pre>

        <div className="boot-screen__logo">
          <span className="boot-screen__bracket">&lt;/&gt;</span>
          <span className="boot-screen__name">prokyi</span>
        </div>
        <div className="boot-screen__lines">
          {lines.map((line, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={line?.includes('[OK]') ? 'boot-ok' : line?.includes('[INIT]') ? 'boot-init' : 'boot-sys'}
            >
              {line}
            </motion.p>
          ))}
          <span className="boot-screen__cursor">_</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem('prokyi_muted') === 'true');
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const toggleMute = () => {
    setMuted(prev => {
      localStorage.setItem('prokyi_muted', String(!prev));
      return !prev;
    });
  };

  // Section scroll sound effects
  useSectionSFX(mutedRef);

  useEffect(() => {
    if (!booting) {
      const t = setTimeout(() => setLoaded(true), 100);
      return () => clearTimeout(t);
    }
  }, [booting]);

  // Custom cursor tracking
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.documentElement.style.cursor = 'none';
    const dot = document.getElementById('cyber-cursor');
    if (!dot) return;
    const move = (e) => {
      dot.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.style.cursor = '';
    };
  }, []);

  // Tab title animation (focus / blur)
  useEffect(() => {
    const ORIGINAL = 'prokyi — Cyberdeck Portfolio';
    const AWAY_MSGS = ['🔒 SYSTEM IDLE ...', '👋 戻ってきて！', '⚠ CONNECTION LOST'];
    let idx = 0;
    let iv;
    const handleVisibility = () => {
      if (document.hidden) {
        document.title = AWAY_MSGS[0];
        idx = 0;
        iv = setInterval(() => {
          idx = (idx + 1) % AWAY_MSGS.length;
          document.title = AWAY_MSGS[idx];
        }, 2000);
      } else {
        clearInterval(iv);
        document.title = ORIGINAL;
      }
    };
    document.title = ORIGINAL;
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(iv);
    };
  }, []);

  // Console Easter Egg — fun messages for devtools inspectors
  useEffect(() => {
    console.log(
      '%c ╔══════════════════════════════════════╗\n' +
      ' ║   🔮 prokyi — Cyberdeck Portfolio 🔮  ║\n' +
      ' ╚══════════════════════════════════════╝',
      'color: #4facfe; font-size: 14px; font-weight: bold; text-shadow: 0 0 10px #4facfe;'
    );
    console.log(
      '%c👾 Hey hacker! ソースコード覗いてるの？\n' +
      '   気に入ったら GitHub で ⭐ してね！\n' +
      '   → https://github.com/kyi88/prokyi-portfolio',
      'color: #22d3a7; font-size: 12px;'
    );
    console.log(
      '%c🎮 隠しコマンド: Konami Code (↑↑↓↓←→←→BA), ` でターミナル, Ctrl+K でコマンドパレット, ? でヘルプ',
      'color: #a855f7; font-size: 11px;'
    );
  }, []);

  // Animated favicon — pause when tab is hidden
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    let frame = 0;
    let iv = null;
    const draw = () => {
      ctx.clearRect(0, 0, 32, 32);
      // Outer ring
      const hue = (frame * 2) % 360;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.strokeStyle = `hsl(${hue}, 85%, 60%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Inner pulsing dot
      const r = 5 + Math.sin(frame * 0.1) * 2;
      ctx.beginPath();
      ctx.arc(16, 16, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(hue + 120) % 360}, 90%, 65%)`;
      ctx.fill();
      // Rotating tick
      const angle = (frame * 0.05) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(16, 16, 11, angle, angle + 1.2);
      ctx.strokeStyle = `hsla(${(hue + 60) % 360}, 80%, 50%, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      link.href = canvas.toDataURL('image/png');
      frame++;
    };
    const start = () => { if (!iv) iv = setInterval(draw, 100); };
    const stop = () => { if (iv) { clearInterval(iv); iv = null; } };
    const onVisibility = () => { document.hidden ? stop() : start(); };
    document.addEventListener('visibilitychange', onVisibility);
    draw();
    start();
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <SoundContext.Provider value={{ muted }}>
      {/* Custom cursor dot (desktop only) */}
      <div id="cyber-cursor" className="cyber-cursor" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {booting && <BootScreen onDone={() => setBooting(false)} />}
      </AnimatePresence>

      {!booting && (
        <>
          <Suspense fallback={null}>
            <CyberBackground />
      </Suspense>
      <ParallaxFog />
      <CRTOverlay />
      <SystemGlitch />
      <SystemAlerts />

      {/* Sound toggle */}
      <button
        className="sound-toggle"
        onClick={toggleMute}
        aria-label={muted ? 'サウンドON' : 'サウンドOFF'}
        title={muted ? '🔇 Unmute' : '🔊 Mute'}
      >
        <motion.span
          key={String(muted)}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {muted ? '🔇' : '🔊'}
        </motion.span>
      </button>

      <div className={`page ${loaded ? 'page--loaded' : ''}`}>
        <Header />
        <Hero />

        <main id="main" className="main">
          <div className="layout">
            <div className="layout__content">
              <Section id="profile" num="01" title="基本情報">
                <Profile />
              </Section>
              <div className="section-divider" aria-hidden="true" />
              <Section id="career" num="02" title="学歴・経歴">
                <Career />
              </Section>
              <div className="section-divider" aria-hidden="true" />
              <Section id="goals" num="03" title="今後の目標・技術的関心">
                <Goals />
              </Section>
              <div className="section-divider" aria-hidden="true" />
              <Section id="status" num="04" title="プレイヤーステータス">
                <Suspense fallback={<StatusSkeleton />}>
                  <StatusScreen />
                </Suspense>
              </Section>
              <div className="section-divider" aria-hidden="true" />
              <Section id="gadgets" num="05" title="ガジェット">
                <Gadgets />
              </Section>
              <div className="section-divider" aria-hidden="true" />
              <Section id="links" num="06" title="リンク / SNS">
                <Links />
              </Section>
            </div>
            <Sidebar />
          </div>
        </main>

        <Footer />
      </div>
      <EasterEggFab />
      <CyberTerminal />
      <KeyboardGuide />
      <ScrollToTop />
      <CommandPalette />
      <Minimap />
      <WelcomeBanner />
        </>
      )}
    </SoundContext.Provider>
  );
}
