import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PANELS = [
  {
    id: 'origin',
    label: 'ORIGIN',
    chapter: 'I',
    heading: 'Every payer. Every rule.\nOne place.',
    body: 'CoverageIQ normalizes insurance formulary data across all major payers — so your team stops digging through PDFs and starts making decisions.',
    cta: { label: 'Search policies', to: '/search' },
    bg: 'ORIGIN',
    align: 'left',
  },
  {
    id: 'intelligence',
    label: 'INTELLIGENCE',
    chapter: 'II',
    heading: 'Instant answers. No guesswork.',
    body: 'Ask in plain language. Get structured policy data back — coverage status, PA requirements, step therapy rules, and site of care — in under 200ms.',
    cta: { label: 'Try search', to: '/search' },
    bg: 'SEARCH',
    align: 'right',
  },
  {
    id: 'extraction',
    label: 'EXTRACTION',
    chapter: 'III',
    heading: 'Drop a PDF. Get structured data.',
    body: 'AI extracts all 12 fields from any payer policy — drug name, HCPCS code, PA criteria, step therapy, site of care, effective date — in seconds.',
    cta: { label: 'Upload policy', to: '/upload' },
    bg: 'INGEST',
    align: 'center',
  },
  {
    id: 'compare',
    label: 'COMPARE',
    chapter: 'IV',
    heading: 'Side by side. Line by line.',
    body: 'Compare two payers on any drug. Every field diff is highlighted. See exactly where coverage diverges — and why it matters for your patient.',
    cta: { label: 'Compare payers', to: '/compare' },
    bg: 'COMPARE',
    align: 'left',
  },
  {
    id: 'changes',
    label: 'CHANGES',
    chapter: 'V',
    heading: 'What changed. Since when.',
    body: 'Track every update to every policy. Coverage added or removed, PA criteria tightened, step therapy added — logged, timestamped, and auditable.',
    cta: { label: 'View changes', to: '/changes' },
    bg: 'CHANGES',
    align: 'right',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [progress, setProgress] = useState(0);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.style.setProperty('--bg', '#111214');
      document.documentElement.style.setProperty('--bg-2', '#18191c');
      document.documentElement.style.setProperty('--bg-3', '#222427');
      document.documentElement.style.setProperty('--bg-4', '#2e3035');
      document.documentElement.style.setProperty('--fg', '#e8eaf0');
      document.documentElement.style.setProperty('--fg-2', '#b0b3bc');
      document.documentElement.style.setProperty('--fg-3', '#7a7d88');
      document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.06)');
      document.documentElement.style.setProperty('--border-strong', 'rgba(255,255,255,0.12)');
      document.documentElement.style.setProperty('--border-hover', 'rgba(255,255,255,0.2)');
    } else {
      document.documentElement.style.setProperty('--bg', '#FFFFFF');
      document.documentElement.style.setProperty('--bg-2', '#F8F9FC');
      document.documentElement.style.setProperty('--bg-3', '#F0F1F5');
      document.documentElement.style.setProperty('--bg-4', '#E6EAF0');
      document.documentElement.style.setProperty('--fg', '#121317');
      document.documentElement.style.setProperty('--fg-2', '#45474D');
      document.documentElement.style.setProperty('--fg-3', '#6A6A71');
      document.documentElement.style.setProperty('--border', 'rgba(33,34,38,0.06)');
      document.documentElement.style.setProperty('--border-strong', 'rgba(33,34,38,0.12)');
      document.documentElement.style.setProperty('--border-hover', 'rgba(33,34,38,0.18)');
    }
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [isDark]);

  // Scroll tracking
  useEffect(() => {
    const isTouch = 'ontouchstart' in window;
    let targetY = window.pageYOffset || window.scrollY;
    let currentY = window.pageYOffset || window.scrollY;
    let rafId;

    const onScroll = () => { targetY = window.pageYOffset || window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      if (isTouch) {
        currentY = window.pageYOffset || window.scrollY;
      } else {
        currentY += (targetY - currentY) * 0.1;
      }

      const vh = window.innerHeight;
      const panels = trackRef.current?.querySelectorAll('.panel') || [];
      const totalPanels = panels.length;
      const rawProgress = currentY / vh;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), totalPanels - 1);
      const newIndex = Math.round(clampedProgress);

      setActiveIndex(Math.min(newIndex, totalPanels - 1));
      setProgress(clampedProgress / (totalPanels - 1));

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToPanel = (index) => {
    window.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>

      {/* Top navigation bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border-strong)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => scrollToPanel(0)}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          CoverageIQ
        </button>

        {/* HUD: chapter label + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--fg-3)',
            }}
          >
            {PANELS[activeIndex]?.label}
          </span>
          <div
            style={{
              width: '80px',
              height: '1px',
              background: 'var(--border-strong)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progress * 100}%`,
                background: 'var(--fg)',
              }}
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fg-3)',
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.3rem 0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--fg)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--fg-3)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>

      {/* Side navigation dots */}
      <div
        style={{
          position: 'fixed',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        {PANELS.map((panel, i) => (
          <button
            key={panel.id}
            onClick={() => scrollToPanel(i)}
            title={panel.label}
            style={{
              width: activeIndex === i ? '0.5rem' : '0.375rem',
              height: activeIndex === i ? '0.5rem' : '0.375rem',
              borderRadius: '50%',
              background: activeIndex === i ? 'var(--fg)' : 'var(--border-hover)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Scroll Track */}
      <div className="scroll-track" ref={trackRef}>
        {PANELS.map((panel, index) => (
          <section
            key={panel.id}
            className={`panel ${activeIndex === index ? 'active' : ''}`}
          >
            {/* Ghost big text */}
            <div className="layer-bg">{panel.bg}</div>

            {/* Panel content */}
            <div
              className="panel-inner"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems:
                  panel.align === 'center' ? 'center' :
                  panel.align === 'right' ? 'flex-end' : 'flex-start',
                textAlign:
                  panel.align === 'center' ? 'center' :
                  panel.align === 'right' ? 'right' : 'left',
                minHeight: '100lvh',
                paddingTop: '3.5rem',
              }}
            >
              {/* Chapter tag */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-3)',
                  marginBottom: '1.5rem',
                }}
              >
                Layer {panel.chapter} · {panel.label}
              </div>

              {/* Heading */}
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 300,
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                  color: 'var(--fg)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: '0 0 1.5rem',
                  maxWidth: '18ch',
                  whiteSpace: 'pre-line',
                }}
              >
                {panel.heading}
              </h2>

              {/* Body copy */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300,
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                  color: 'var(--fg-2)',
                  lineHeight: 1.7,
                  maxWidth: '46ch',
                  margin: '0 0 2.5rem',
                }}
              >
                {panel.body}
              </p>

              {/* CTA */}
              <button
                onClick={() => navigate(panel.cta.to)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: 'var(--bg)',
                  background: 'var(--fg)',
                  padding: '0.7rem 2rem',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--fg)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                → {panel.cta.label}
              </button>
            </div>
          </section>
        ))}
      </div>

    </div>
  );
}
