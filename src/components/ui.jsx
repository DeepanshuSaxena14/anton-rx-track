export const Spinner = ({ label, size = 24 }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 border-t-2 border-[var(--accent)] rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-b-2 border-[var(--fg)] opacity-40 rounded-full animate-spin reverse"></div>
    </div>
    {label && <p className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-[0.2em] animate-pulse">{label}</p>}
  </div>
);

export const EmptyState = ({ title, subtitle }) => (
  <div className="flex flex-col items-center text-center p-8 border border-[var(--border)] bg-[var(--bg-2)] rounded-lg">
    <div className="w-12 h-12 flex items-center justify-center border border-[var(--border)] bg-[var(--bg)] mb-6 rounded-sm">
      <span className="font-mono text-xl text-[var(--muted)] opacity-50">?</span>
    </div>
    <h3 className="font-mono text-sm tracking-widest text-[var(--fg)] uppercase font-semibold mb-2">{title}</h3>
    <p className="font-mono text-xs text-[var(--muted)] uppercase tracking-wider">{subtitle}</p>
  </div>
);

export const CoverageBadge = ({ status }) => {
  let styles = "bg-[var(--bg)] text-[var(--fg)] border-[var(--border)]";
  let label = String(status).toUpperCase();

  if (label === 'COVERED' || label === 'PREFERRED' || label === 'COVERED_PREFERRED') {
    styles = "bg-[color-mix(in_srgb,transparent_80%,#c4a8d4)] text-[var(--accent)] border-[var(--accent)]";
    label = "COVERED_PREFERRED";
  } else if (label === 'NOT_COVERED' || label === 'EXCLUDED') {
    styles = "bg-[color-mix(in_srgb,transparent_80%,#f43f5e)] text-rose-400 border-rose-400";
    label = "NOT_COVERED";
  } else if (label === 'RESTRICTED' || label === 'COVERED_WITH_RESTRICTIONS') {
    styles = "bg-[color-mix(in_srgb,transparent_80%,#facc15)] text-[#facc15] border-[#facc15]";
    label = "COVERED_WITH_RESTRICTIONS";
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 flex-shrink-0 text-[10px] font-mono font-bold tracking-widest border rounded shadow-sm ${styles}`}>
      {label}
    </span>
  );
};

export const ScoreDots = ({ score }) => {
  const max = 5;
  const s = Math.min(Math.max(0, score || 0), max);
  
  return (
    <div className="flex items-center gap-1.5 bg-[var(--bg-2)] px-2 py-1.5 border border-[var(--border)] rounded" title={`RESTRICTION_SCORE: ${s}/${max}`}>
      {[...Array(max)].map((_, i) => (
        <div 
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < s ? 'bg-[var(--accent)] shadow-[0_0_5px_var(--accent)]' : 'bg-[var(--muted)] opacity-30'} transition-opacity`}
        />
      ))}
    </div>
  );
};

export const HcpcsPill = ({ code }) => {
  if (!code) return null;
  return (
    <span className="font-mono text-[9px] uppercase tracking-widest border border-[var(--accent)] text-[var(--accent)] px-2 py-0.5 rounded shadow-sm">
      {code}
    </span>
  );
};

export const SiteOfCareTags = ({ sites }) => {
  if (!sites || sites.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {sites.map((site, i) => (
        <span key={i} className="font-mono text-[10px] uppercase tracking-wider text-[var(--bg)] bg-[var(--muted)] px-1.5 py-0.5 rounded">
          {site}
        </span>
      ))}
    </div>
  );
};
