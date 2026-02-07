import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import './App.css';

const CyberBackground = lazy(() => import('./components/CyberBackground'));
const StatusScreen = lazy(() => import('./components/StatusScreen'));

function BootScreen({ onDone }) {
  const [lines, setLines] = useState([]);
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
    const iv = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]]);
        playBeep(freqs[i] || 600);
        i++;
      } else {
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 180);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      className="boot-screen"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <div className="boot-screen__inner">
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
              className={line.includes('[OK]') ? 'boot-ok' : line.includes('[INIT]') ? 'boot-init' : 'boot-sys'}
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
      <div className={`page ${loaded ? 'page--loaded' : ''}`}>
        <Header />
        <Hero />

        <main id="main" className="main">
          <div className="layout">
            <div className="layout__content">
              <Section id="profile" num="01" title="基本情報">
                <Profile />
              </Section>
              <Section id="career" num="02" title="学歴・経歴">
                <Career />
              </Section>
              <Section id="goals" num="03" title="今後の目標・技術的関心">
                <Goals />
              </Section>
              <Section id="status" num="04" title="プレイヤーステータス">
                <Suspense fallback={<div style={{textAlign:'center',padding:'40px',fontFamily:'var(--font-mono)',color:'var(--c-text-dim)',fontSize:'0.8rem'}}>Loading status...</div>}>
                  <StatusScreen />
                </Suspense>
              </Section>
              <Section id="gadgets" num="05" title="ガジェット">
                <Gadgets />
              </Section>
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
        </>
      )}
    </>
  );
}
