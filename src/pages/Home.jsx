import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PANELS = [
  {
    id: 'ORIGIN',
    tag: 'Layer I · Origin · ↓ Scroll to rise',
    bgText: 'COVERAGE',
    title: 'STOP READING PDFS.\nSTART MAKING DECISIONS.',
    body: 'CoverageIQ ingests insurance policy PDFs and instantly answers any question about medical benefit drug coverage across health plans.',
    cta: '↓ scroll down to ascend',
    ctaAction: null,
    align: 'left'
  },
  {
    id: 'SEARCH',
    tag: 'Layer II · Intelligence',
    bgText: 'SEARCH',
    title: 'WHICH PLANS COVER DRUG X?',
    body: 'Instant cross-payer coverage lookup. PA requirements, step therapy, site of care — all surfaced in seconds.',
    cta: '→ Open Search',
    ctaAction: '/search',
    align: 'right'
  },
  {
    id: 'INGEST',
    tag: 'Layer III · Extraction',
    bgText: 'INGEST',
    title: 'DROP A PDF. GET STRUCTURED DATA.',
    body: 'AI extracts all 12 fields from any payer policy — drug name, HCPCS code, PA criteria, step therapy, site of care, effective date — in seconds.',
    cta: '→ Upload Policy',
    ctaAction: '/upload',
    align: 'center'
  },
  {
    id: 'COMPARE',
    tag: 'Layer IV · Normalization',
    bgText: 'COMPARE',
    title: 'AETNA VS UHC. SAME DRUG. REAL DIFF.',
    body: 'Every payer policy normalized to the same 12-field schema. Differing fields highlighted automatically. Apples to apples, finally.',
    cta: '→ Compare Payers',
    ctaAction: '/compare',
    align: 'right'
  },
  {
    id: 'CHANGES',
    tag: 'Layer V · Intelligence',
    bgText: 'CHANGES',
    title: 'WHAT CHANGED THIS QUARTER?',
    body: 'Color-coded change log across all payers. Coverage added, restrictions tightened, criteria updated — tracked automatically.',
    cta: '→ View Changes',
    ctaAction: '/changes',
    align: 'center'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsLight(true);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    const isTouch = 'ontouchstart' in window;
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let rafId;

    const onScroll = () => {
      targetY = window.scrollY;
    };

    const tick = () => {
      const LERP = 0.1;

      if (isTouch) {
        currentY = targetY;
      } else {
        currentY += (targetY - currentY) * LERP;
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      let p = 0;
      if (maxScroll > 0) {
        p = Math.max(0, Math.min(1, currentY / maxScroll));
      }

      setProgress(p);
      const pIndex = Math.min(PANELS.length - 1, Math.floor(p * PANELS.length + 0.1));
      setActiveIndex(pIndex);

      document.documentElement.style.setProperty('--scroll-progress', p);

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToPanel = (idx) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const target = (maxScroll / (PANELS.length - 1)) * idx;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div className="-mt-14 relative w-full">
      <div className="scene" />

      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="top-nav-left">
          <button 
            onClick={() => scrollToPanel(0)} 
            className="hud-title bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            CoverageIQ
          </button>
        </div>

        <div className="top-nav-right">
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4">
              <div className="layer-label">{PANELS[activeIndex]?.id}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <button onClick={toggleTheme} className="theme-toggle">
              {isLight ? '◑ LIGHT' : '◐ DARK'}
            </button>
          </div>
        </div>
      </div>

      {/* Side Nav */}
      <div className="side-nav">
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => scrollToPanel(i)}
            className={`dot-btn ${activeIndex === i ? 'active' : ''}`}
          >
            <span className="dot-label">{p.id}</span>
          </button>
        ))}
      </div>

      {/* Panels Track */}
      <div className="scroll-track" ref={trackRef}>
        {PANELS.map((panel, index) => (
          <section key={panel.id} className="panel">
            <div className={`panel-inner ${
              panel.align === 'center' ? 'justify-center text-center' : 
              panel.align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
            }`}>
              <div className="layer-bg" style={{ 
                left: panel.align === 'right' ? 'auto' : '-0.05em',
                right: panel.align === 'right' ? '-0.05em' : 'auto'
              }}>
                {panel.bgText}
              </div>

              <div className={`relative z-10 flex flex-col ${
                panel.align === 'center' ? 'items-center' : 
                panel.align === 'right' ? 'items-end' : 'items-start'
              }`}>
                <span className="layer-tag">{panel.tag}</span>
                <h2 className="whitespace-pre-line">{panel.title}</h2>
                <p className="layer-line">{panel.body}</p>

                {panel.ctaAction ? (
                  <button
                    onClick={() => navigate(panel.ctaAction)}
                    className="cta-button"
                  >
                    {panel.cta}
                  </button>
                ) : (
                  <div className="font-mono text-[10px] text-[var(--accent)] opacity-60 tracking-[0.2em] animate-pulse uppercase">
                    {panel.cta}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
