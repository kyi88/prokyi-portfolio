import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Section from './components/Section';
import Profile from './components/Profile';
import Career from './components/Career';
import Goals from './components/Goals';
import StatusScreen from './components/StatusScreen';
import Gadgets from './components/Gadgets';
import Links from './components/Links';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import EasterEggFab from './components/EasterEggFab';
import './App.css';

const CyberBackground = lazy(() => import('./components/CyberBackground'));

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

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]]);
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

  return (
    <>
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
                <StatusScreen />
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
