/* eslint-disable no-unused-vars */
import { AlertCircle } from 'lucide-react';

export function CoverageBadge({ status }) {
  const styles = {
    covered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    not_covered: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    conditional: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  };
  
  const labels = {
    covered: 'Covered',
    not_covered: 'Not Covered',
    conditional: 'Conditional',
  };

  if (!status) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function ScoreDots({ score }) {
  let color = 'bg-rose-500'; // 7-10
  if (score <= 3) color = 'bg-emerald-500';
  else if (score <= 6) color = 'bg-amber-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${i < score ? color : 'bg-surface-4'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-300">{score}/10</span>
    </div>
  );
}

export function HcpcsPill({ code }) {
  if (!code) return null;
  return (
    <span className="font-mono text-xs font-medium bg-surface-3 text-slate-300 px-1.5 py-0.5 rounded border border-surface-border">
      {code}
    </span>
  );
}

export function SiteOfCareTags({ sites }) {
  if (!sites || sites.length === 0) return null;
  
  const labels = {
    hospital_outpatient: 'Hospital OP',
    physician_office: 'Physician Office',
    home_infusion: 'Home Infusion',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {sites.map((s) => (
        <span
          key={s}
          className="px-2 py-1 text-xs font-medium bg-surface-3 text-slate-300 rounded border border-surface-border"
        >
          {labels[s] || s}
        </span>
      ))}
    </div>
  );
}

export function Spinner({ label, size = 20 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className="animate-spin border-2 border-brand-500/30 border-t-brand-500 rounded-full"
        style={{ width: size, height: size }}
      />
      {label && <span className="text-sm text-slate-400">{label}</span>}
    </div>
  );
}

export function EmptyState({ icon: Icon = AlertCircle, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-1 border border-surface-border rounded-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-3 border border-surface-border mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 max-w-sm">{subtitle}</p>}
    </div>
  );
}
