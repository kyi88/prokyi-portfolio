import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import './WetwareCompiler.css';

const BASES = ['A', 'C', 'G', 'T'];
const MAX_SEQ = 16;

const CYBER_ABILITIES = [
  { pattern: /ACGT/i, name: 'Neural Overclock', desc: 'Synaptic processing speed +300%. Side effect: dreams in binary.' },
  { pattern: /GGGG/i, name: 'Infinite Memory', desc: 'RAM allocation: ∞. All Stack Overflow answers cached locally.' },
  { pattern: /TTTT/i, name: 'Temporal Shift', desc: 'Time perception slowed 10x. Deadlines feel like eternities.' },
  { pattern: /AAAA/i, name: 'Code Immunity', desc: 'All bugs repelled. NullPointerException extinct in host genome.' },
  { pattern: /CCCC/i, name: 'Crypto Vision', desc: 'Blockchain visible to naked eye. Can smell private keys.' },
  { pattern: /ACAC/i, name: 'Sushi Synthesis', desc: 'Body can now photosynthesize sushi from ambient WiFi signals.' },
  { pattern: /TGCA/i, name: 'Kernel Fusion', desc: 'Linux kernel merged with consciousness. Root access: permanent.' },
  { pattern: /GCAT/i, name: 'Docker Clone', desc: 'Can containerize own personality. Deploy copies across servers.' },
];

const ERRORS = [
  'MUTATION WARNING: Unstable codon detected at position {pos}.',
  'COMPILE ERROR: Ribosome overflow at block {pos}.',
  'WARNING: Genetic drift detected. Re-sequencing recommended.',
  'NOTICE: Telomere length insufficient. Consider TTAGGG extension.',
];

function compile(sequence) {
  if (sequence.length < 4) {
    return { type: 'error', text: '⚠ Minimum 4 base pairs required for compilation.' };
  }

  const seqStr = sequence.join('');

  // Check for known patterns
  const abilities = [];
  for (const a of CYBER_ABILITIES) {
    if (a.pattern.test(seqStr)) {
      abilities.push(a);
    }
  }

  // Random error chance (20%)
  if (abilities.length === 0 || Math.random() < 0.2) {
    const err = ERRORS[Math.floor(Math.random() * ERRORS.length)];
    const pos = Math.floor(Math.random() * sequence.length) + 1;
    const errText = err.replace('{pos}', String(pos));
    if (abilities.length === 0) {
      return { type: 'error', text: `${errText}\n\nNo valid cybernetic patterns detected.\nTry: ACGT, GGGG, TTTT, AAAA, CCCC, TGCA` };
    }
    // Has abilities but also a warning
    const abilityText = abilities.map((a) => `✅ ${a.name}\n   ${a.desc}`).join('\n\n');
    return { type: 'success', text: `${errText}\n\n--- COMPILED ABILITIES ---\n\n${abilityText}` };
  }

  const abilityText = abilities.map((a) => `✅ ${a.name}\n   ${a.desc}`).join('\n\n');
  return { type: 'success', text: `--- WETWARE COMPILATION SUCCESSFUL ---\nSequence: ${seqStr}\nLength: ${sequence.length} bp\n\n${abilityText}` };
}

function WetwareCompiler() {
  const [open, setOpen] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [output, setOutput] = useState({ type: '', text: '' });
  const [compiling, setCompiling] = useState(false);
  const [genome, setGenome] = useState(false);
  const compileTimerRef = useRef(null);
  const genomeTimerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) setOpen(false); };
    const handler = () => setOpen((p) => !p);
    window.addEventListener('keydown', onKey);
    window.addEventListener('prokyi-wetware-toggle', handler);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('prokyi-wetware-toggle', handler);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      clearTimeout(compileTimerRef.current);
      clearTimeout(genomeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSequence([]);
      setOutput({ type: '', text: '' });
      setCompiling(false);
      setGenome(false);
      clearTimeout(compileTimerRef.current);
      clearTimeout(genomeTimerRef.current);
    }
  }, [open]);

  const addBase = useCallback((base) => {
    setSequence((prev) => prev.length >= MAX_SEQ ? prev : [...prev, base]);
  }, []);

  const removeBase = useCallback((idx) => {
    setSequence((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearSequence = useCallback(() => {
    setSequence([]);
    setOutput({ type: '', text: '' });
  }, []);

  // Easter egg #30: check for GATTACA
  useEffect(() => {
    if (!open || genome) return;
    const seqStr = sequence.join('');
    if (seqStr.includes('GATTACA')) {
      setGenome(true);
      genomeTimerRef.current = setTimeout(() => setGenome(false), 4000);
    }
  }, [sequence, open, genome]);

  const handleCompile = useCallback(() => {
    if (sequence.length === 0 || compiling) return;
    setCompiling(true);
    setOutput({ type: '', text: 'Initializing ribosomes...\nTranslating codons...\nAssembling proteins...' });
    compileTimerRef.current = setTimeout(() => {
      const result = compile(sequence);
      setOutput(result);
      setCompiling(false);
    }, 1500);
  }, [sequence, compiling]);

  if (!open) return null;

  return (
    <motion.div
      className="wetware-compiler"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-label="Wetware Compiler"
      aria-modal="true"
    >
      <div className="wetware-compiler__header">
        <span>🧬 WETWARE COMPILER</span>
        <button className="wetware-compiler__btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
      </div>

      <div className="wetware-compiler__palette">
        {BASES.map((base) => (
          <div
            key={base}
            className={`wetware-compiler__base wetware-compiler__base--${base}`}
            onClick={() => addBase(base)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addBase(base); } }}
            role="button"
            tabIndex={0}
            aria-label={`Add base ${base}`}
          >
            {base}
          </div>
        ))}
      </div>

      <div className="wetware-compiler__sequence">
        {sequence.length === 0 ? (
          <span className="wetware-compiler__seq-placeholder">Click bases above to build your sequence (max {MAX_SEQ})</span>
        ) : (
          sequence.map((base, i) => (
            <div
              key={`${i}-${base}`}
              className={`wetware-compiler__seq-block wetware-compiler__seq-block--${base}`}
              onClick={() => removeBase(i)}
              title="Click to remove"
            >
              {base}
            </div>
          ))
        )}
      </div>

      <div className="wetware-compiler__actions">
        <button
          className="wetware-compiler__btn"
          onClick={handleCompile}
          disabled={compiling || sequence.length === 0}
        >
          {compiling ? '⏳ COMPILING...' : '▶ COMPILE'}
        </button>
        <button className="wetware-compiler__btn" onClick={clearSequence}>↻ CLEAR</button>
        <span style={{ fontSize: '.72rem', color: '#555', alignSelf: 'center', marginLeft: 'auto' }}>
          {sequence.length}/{MAX_SEQ} bp
        </span>
      </div>

      <div className={`wetware-compiler__output${output.type === 'success' ? ' wetware-compiler__output--success' : output.type === 'error' ? ' wetware-compiler__output--error' : ''}${compiling ? ' wetware-compiler__output--compiling' : ''}`}>
        {output.text || 'Awaiting genetic sequence input...'}
      </div>

      <div className="wetware-compiler__status">
        Try patterns: ACGT, GGGG, TGCA, GATTACA...
      </div>

      {genome && (
        <div className="wetware-compiler__genome">
          <h2>PERFECT GENOME DETECTED</h2>
          <p>遺伝子改造レベル: ∞<br />「完璧な遺伝子は完璧な寿司職人を生む」</p>
        </div>
      )}
    </motion.div>
  );
}

export default memo(WetwareCompiler);
