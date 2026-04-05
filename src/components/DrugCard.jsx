import { useState } from 'react';
import { CoverageBadge, ScoreDots, HcpcsPill, SiteOfCareTags } from './ui';

export default function DrugCard({ policy, index }) {
  const [expanded, setExpanded] = useState(false);
  const delayNum = Math.min(index + 1, 6);
  const delayClass = `fade-up-delay-${delayNum}`;

  return (
    <div className={`border border-[var(--border)] bg-[var(--bg-2)] p-1 fade-up ${delayClass} rounded-lg transition-colors hover:border-[var(--accent)] group`}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase mb-2">[{policy.payer}]</div>
            <div className="flex items-center gap-3">
              <h2 className="font-display font-light text-2xl text-[var(--fg)] m-0 leading-none">{policy.drug_name}</h2>
              <span className="font-mono text-xs text-[var(--muted)] uppercase tracking-wider">{policy.brand_name}</span>
              <HcpcsPill code={policy.hcpcs_code} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <CoverageBadge status={policy.coverage_status} />
            <ScoreDots score={policy.score} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8 mb-6 p-4 border border-[var(--border)] bg-[var(--bg)] rounded">
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] block mb-1">PA_REQUIRED</span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${policy.pa_required ? 'text-rose-400' : 'text-[var(--fg)]'}`}>{policy.pa_required ? 'TRUE' : 'FALSE'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] block mb-1">STEP_THERAPY</span>
              <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${policy.step_therapy_required ? 'text-rose-400' : 'text-[var(--fg)]'}`}>
                {policy.step_therapy_required ? 'REQUIRED' : 'NULL'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] block mb-1">EFFECTIVE_DATE</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--fg)] font-semibold">
              {new Date(policy.effective_date).toISOString().split('T')[0]}
            </span>
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] block mb-2">SITE_OF_CARE_MATRIX</span>
          {policy.site_of_care && policy.site_of_care.length > 0 ? (
            <SiteOfCareTags sites={policy.site_of_care} />
          ) : (
            <span className="font-mono text-xs text-[var(--muted)]">NULL</span>
          )}
        </div>

        {expanded && (
          <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-6 animate-in fade-in duration-200">
            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase mb-3"># INDICATIONS_ARRAY</h4>
              {policy.covered_indications && policy.covered_indications.length > 0 ? (
                <ul className="space-y-2">
                  {policy.covered_indications.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-[color-mix(in_srgb,var(--fg)_80%,transparent)] leading-relaxed uppercase">
                      <span className="text-[var(--accent)] opacity-70">{'>'}</span> {ind}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-xs text-[var(--muted)]">NULL</p>
              )}
            </div>

            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase mb-3"># PA_CRITERIA_MATRIX</h4>
              {policy.pa_criteria && policy.pa_criteria.length > 0 ? (
                <ul className="space-y-2">
                  {policy.pa_criteria.map((crit, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-[color-mix(in_srgb,var(--fg)_80%,transparent)] leading-relaxed uppercase">
                      <span className="text-[var(--accent)] opacity-70">{'>'}</span> {crit}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-xs text-[var(--muted)]">NULL</p>
              )}
            </div>

            {policy.step_therapy_required && policy.step_therapy_details && (
              <div>
                <h4 className="font-mono text-[10px] tracking-widest text-rose-400 uppercase mb-3"># STEP_THERAPY_OVERRIDE</h4>
                <p className="font-mono text-xs text-[var(--fg)] bg-[color-mix(in_srgb,transparent_90%,#f43f5e)] p-4 border border-[color-mix(in_srgb,transparent_70%,#f43f5e)] rounded uppercase">
                  {policy.step_therapy_details}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--bg)] border-t border-[var(--border)] text-xs font-mono tracking-widest text-[var(--accent)] hover:text-[var(--bg)] hover:bg-[var(--accent)] transition-colors uppercase rounded-b-md"
      >
        {expanded ? '[ COLLAPSE ]' : '[ EXPAND_DATA ]'}
      </button>
    </div>
  );
}
