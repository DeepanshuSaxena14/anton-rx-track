import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CHAPTERS = [
  {
    tag: 'Chapter I · Origin',
    bgText: 'COVERAGE',
    title: 'Stop reading PDFs.\nStart making decisions.',
    body: 'CoverageIQ is an AI-powered platform that instantly answers any question about medical benefit drug policies across health plans.',
    cta: '↓ scroll to explore',
    ctaAction: null,
    align: 'left'
  },
  {
    tag: 'Chapter II · Intelligence',
    bgText: 'SEARCH',
    title: 'Which plans cover Drug X?',
    body: 'Instant cross-payer coverage lookup. PA requirements, step therapy, site of care — surfaced in seconds. No PDF required.',
    cta: '→ Open Search',
    ctaAction: '/search',
    align: 'right'
  },
  {
    tag: 'Chapter III · Extraction',
    bgText: 'INGEST',
    title: 'Drop a PDF. Get structured data.',
    body: 'AI extracts all 12 fields from any payer policy document — drug name, HCPCS code, PA criteria, step therapy, site of care, effective date.',
    cta: '→ Upload Policy',
    ctaAction: '/upload',
    align: 'center'
  },
  {
    tag: 'Chapter IV · Normalization',
    bgText: 'COMPARE',
    title: 'Aetna vs UHC. Same drug. Real diff.',
    body: 'Every payer policy normalized to the same 12-field schema. Differing fields highlighted automatically. Apples to apples, finally.',
    cta: '→ Compare Payers',
    ctaAction: '/compare',
    align: 'right'
  },
  {
    tag: 'Chapter V · Intelligence',
    bgText: 'CHANGES',
    title: 'What changed this quarter?',
    body: 'Color-coded change log across all payers. Coverage added, restrictions tightened, criteria updated — tracked automatically so you don\'t have to.',
    cta: '→ View Changes',
    ctaAction: '/changes',
    align: 'center'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeLayer, setActiveLayer] = useState('ORIGIN');
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
      const LERP = 0.08;

      if (isTouch) {
        currentY = targetY;
      } else {
        currentY += (targetY - currentY) * LERP;
      }

      if (trackRef.current) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let p = 0;
        if (maxScroll > 0) {
          p = Math.max(0, Math.min(1, currentY / maxScroll));
        }

        setProgress(p);

        const pIndex = Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length));
        setActiveIndex(pIndex);

        const labels = ['ORIGIN', 'SEARCH', 'INGEST', 'COMPARE', 'CHANGES'];
        setActiveLayer(labels[pIndex] || labels[0]);

        document.documentElement.style.setProperty('--scroll-progress', p);
      }

      if (Math.abs(targetY - currentY) > 0.5) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToChapter = (idx) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const target = (maxScroll / (CHAPTERS.length - 1)) * idx;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div className="-mt-14 relative w-full h-full">
      <div className="scene" />

      {/* Light/Dark Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-[60] font-mono text-[10px] tracking-widest uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors bg-transparent border-none cursor-pointer"
      >
        {isLight ? '◑ LIGHT' : '◐ DARK'}
      </button>

      {/* Side Dots Nav */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-4">
        {CHAPTERS.map((p, i) => (
          <button
            key={i}
            onClick={() => scrollToChapter(i)}
            title={p.tag}
            className="group flex flex-col items-center justify-center p-2 cursor-pointer border-none bg-transparent"
          >
            <div className={`transition-all duration-300 ${activeIndex === i ? 'w-1 h-4 rounded-sm bg-[var(--accent)]' : 'w-1 h-1 rounded-full bg-[var(--muted)] opacity-40 group-hover:opacity-100 group-hover:bg-[var(--accent-2)]'}`} />
          </button>
        ))}
      </div>

      {/* HUD (Top Left) */}
      <div className="fixed top-6 left-6 z-[60] flex flex-col items-start gap-1 pointer-events-none">
        <h1 className="font-display italic font-semibold text-[1.1rem] text-[var(--accent)] m-0 leading-none opacity-90">
          CoverageIQ
        </h1>
        <div className="w-[4rem] h-px bg-[var(--border)] overflow-hidden mt-1">
          <div
            className="h-full bg-[var(--accent)] transition-transform duration-75"
            style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }}
          />
        </div>
        <div className="font-mono text-[8px] uppercase tracking-[0.28em] text-[var(--accent)] mt-1 whitespace-nowrap">
          {activeLayer}
        </div>
      </div>

      {/* Chapters Track */}
      <div className="scroll-track" ref={trackRef}>
        {CHAPTERS.map((chapter, index) => (
          <section key={chapter.bgText} className="chapter">
            <div className={`chapter-inner flex-col justify-end ${chapter.align === 'center' ? 'items-center text-center' : chapter.align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
              <div className="ghost-text">{chapter.bgText}</div>

              <div className={`relative z-10 max-w-[700px] flex flex-col ${chapter.align === 'center' ? 'items-center' : chapter.align === 'right' ? 'items-end' : 'items-start'}`}>
                <span className="chapter-tag">{chapter.tag}</span>
                <h2 className="whitespace-pre-line break-words">{chapter.title}</h2>
                <p className="chapter-body">{chapter.body}</p>

                {chapter.ctaAction ? (
                  <button
                    onClick={() => navigate(chapter.ctaAction)}
                    className="cta-link mt-2"
                  >
                    {chapter.cta}
                  </button>
                ) : (
                  <div className="font-mono text-[10px] text-[var(--accent)] opacity-60 tracking-[0.2em] animate-pulse mt-2 pb-1">
                    {chapter.cta}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Footer Text on last chapter */}
      <div className="absolute bottom-4 w-full text-center z-10 pointer-events-none">
        <span className="font-mono text-[8px] text-[var(--muted)] opacity-50 tracking-widest uppercase">
          CoverageIQ | Team Error 404 | Built at Innovation Hacks 2.0 | ASU 2026
        </span>
      </div>
    </div>
  );
}
