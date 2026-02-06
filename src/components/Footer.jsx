import { motion } from 'framer-motion';
import './Footer.css';

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer__inner">
        <p className="footer__copy">&copy; 2026 ぷろきぃ (prokyi) &mdash; 技術と創造の交差点</p>
        <p className="footer__update">Last updated: 2026/02/07</p>
      </div>
    </motion.footer>
  );
}
