import { useEffect, useState, lazy, Suspense } from 'react';
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
import './App.css';

const CyberBackground = lazy(() => import('./components/CyberBackground'));
const StatusScreen = lazy(() => import('./components/StatusScreen'));

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

/* Skeleton placeholder for StatusScreen lazy load */
function StatusSkeleton() {
  return (
    <div className="status-skeleton" aria-label="読み込み中">
      <div className="status-skeleton__tabs">
        {[1, 2, 3, 4].map(i => <div key={i} className="status-skeleton__tab" />)}
      </div>
      <div className="status-skeleton__body">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="status-skeleton__row" style={{ width: `${60 + Math.random() * 30}%` }} />
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

  // Animated favicon
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
    const iv = setInterval(draw, 100);
    draw();
    return () => clearInterval(iv);
  }, []);

  return (
    <>
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
        </>
      )}
    </>
  );
}
