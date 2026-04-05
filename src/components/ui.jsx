const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.2rem 0.75rem',
  borderRadius: 'var(--radius-pill)',
  fontSize: '0.7rem',
  fontFamily: 'var(--font-mono)',
  fontWeight: 400,
  letterSpacing: '0.04em',
  border: '1px solid var(--border-strong)',
  background: 'var(--bg-3)',
  color: 'var(--fg-2)',
};

export const Spinner = ({ label, size = 28 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--border-strong)',
        borderTopColor: 'var(--fg)',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    {label && (
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--fg-3)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
    )}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const EmptyState = ({ title, subtitle }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2.5rem',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
    }}
  >
    <div
      style={{
        width: '2.75rem',
        height: '2.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-3)',
        border: '1px solid var(--border-strong)',
        borderRadius: '0.75rem',
        marginBottom: '1.25rem',
      }}
    >
      <span style={{ fontSize: '1.1rem', color: 'var(--fg-3)', opacity: 0.7 }}>?</span>
    </div>
    <h3
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: '0.95rem',
        color: 'var(--fg)',
        margin: '0 0 0.4rem',
      }}
    >
      {title}
    </h3>
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-3)', margin: 0 }}>
      {subtitle}
    </p>
  </div>
);

export const CoverageBadge = ({ status }) => {
  const s = String(status || '').toUpperCase();

  let label = s;
  let bg, color, border;

  if (s === 'COVERED' || s === 'PREFERRED' || s === 'COVERED_PREFERRED') {
    label = 'Covered';
    bg = 'rgba(26,122,74,0.08)';
    color = 'var(--success)';
    border = 'rgba(26,122,74,0.25)';
  } else if (s === 'NOT_COVERED' || s === 'EXCLUDED') {
    label = 'Not Covered';
    bg = 'rgba(143,42,42,0.07)';
    color = 'var(--danger)';
    border = 'rgba(143,42,42,0.2)';
  } else if (s === 'RESTRICTED' || s === 'COVERED_WITH_RESTRICTIONS') {
    label = 'Restricted';
    bg = 'rgba(143,106,26,0.07)';
    color = 'var(--warning)';
    border = 'rgba(143,106,26,0.2)';
  } else {
    bg = 'var(--bg-3)';
    color = 'var(--fg-2)';
    border = 'var(--border-strong)';
  }

  return (
    <span
      style={{
        ...pill,
        background: bg,
        color,
        border: `1px solid ${border}`,
        padding: '0.25rem 0.8rem',
        fontSize: '0.72rem',
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
};

export const ScoreDots = ({ score }) => {
  const max = 5;
  const s = Math.min(Math.max(0, score || 0), max);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        background: 'var(--bg-2)',
        padding: '0.3rem 0.6rem',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border-strong)',
      }}
      title={`Restriction score: ${s}/${max}`}
    >
      {[...Array(max)].map((_, i) => (
        <div
          key={i}
          style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            background: i < s ? 'var(--fg)' : 'var(--bg-4)',
          }}
        />
      ))}
    </div>
  );
};

export const HcpcsPill = ({ code }) => {
  if (!code) return null;
  return <span style={pill}>{code}</span>;
};

export const SiteOfCareTags = ({ sites }) => {
  if (!sites || sites.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {sites.map((site, i) => (
        <span key={i} style={pill}>
          {site}
        </span>
      ))}
    </div>
  );
};
