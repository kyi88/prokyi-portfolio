import { useEffect, useState, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
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

export default function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
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
  );
}
