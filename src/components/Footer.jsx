import { motion } from 'framer-motion';
import './Footer.css';

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="footer__inner">
        <motion.p
          className="footer__copy"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          &copy; 2026 ぷろきぃ (prokyi) &mdash; <span className="gradient-text">技術と創造の交差点</span>
        </motion.p>
        <motion.p
          className="footer__update"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Last updated: 2026/02/07
        </motion.p>
        <motion.p
          className="footer__system"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          SYSTEM: React 19 + Vite 6 + Three.js + Framer Motion
        </motion.p>
      </div>
    </motion.footer>
  );
}
