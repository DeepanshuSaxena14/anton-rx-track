import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { CoverageBadge, ScoreDots, HcpcsPill, SiteOfCareTags } from './ui';

export default function DrugCard({ policy, index }) {
  const [expanded, setExpanded] = useState(false);
  
  // Cap the delay class at 6 (1 to 6)
  const delayNum = Math.min(index + 1, 6);
  const delayClass = `fade-up-delay-${delayNum}`;

  return (
    <div className={`bg-surface-2 border border-surface-border rounded-xl overflow-hidden fade-up ${delayClass}`}>
      <div className="p-4 sm:p-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-medium text-brand-400 mb-1">{policy.payer}</div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold text-white">{policy.drug_name}</h2>
              <span className="text-slate-400 font-medium">{policy.brand_name}</span>
              <HcpcsPill code={policy.hcpcs_code} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CoverageBadge status={policy.coverage_status} />
            <ScoreDots score={policy.score} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-3 bg-surface-1 rounded-lg border border-surface-border">
          <div className="flex items-center gap-2">
            {policy.pa_required ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            <div className="text-sm">
              <span className="text-slate-400 block text-xs">PA Required</span>
              <span className="font-medium text-slate-200">{policy.pa_required ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {policy.step_therapy_required ? (
              <FileText className="h-4 w-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            <div className="text-sm">
              <span className="text-slate-400 block text-xs">Step Therapy</span>
              <span className="font-medium text-slate-200">
                {policy.step_therapy_required ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <span className="text-slate-400 block text-xs">Effective Date</span>
            <span className="font-medium text-slate-200 text-sm">
              {new Date(policy.effective_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Site of Care Row */}
        <div>
          <span className="text-slate-400 block text-xs mb-1.5">Site of Care</span>
          {policy.site_of_care && policy.site_of_care.length > 0 ? (
            <SiteOfCareTags sites={policy.site_of_care} />
          ) : (
            <span className="text-sm text-slate-500">Not specified</span>
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-surface-border space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1.5">Covered Indications</h4>
              {policy.covered_indications && policy.covered_indications.length > 0 ? (
                <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                  {policy.covered_indications.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">None specified.</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1.5">PA Criteria</h4>
              {policy.pa_criteria && policy.pa_criteria.length > 0 ? (
                <ul className="list-disc pl-4 text-sm text-slate-300 space-y-1">
                  {policy.pa_criteria.map((crit, i) => (
                    <li key={i}>{crit}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">None specified.</p>
              )}
            </div>

            {policy.step_therapy_required && policy.step_therapy_details && (
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1.5">Step Therapy Details</h4>
                <p className="text-sm text-slate-300 bg-surface-3 p-2.5 rounded border border-surface-border">
                  {policy.step_therapy_details}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-surface-1 border-t border-surface-border text-sm font-medium text-brand-400 hover:text-brand-300 hover:bg-surface-3 transition-colors"
      >
        {expanded ? (
          <>Hide Details <ChevronUp className="h-4 w-4" /></>
        ) : (
          <>Show Details <ChevronDown className="h-4 w-4" /></>
        )}
      </button>
    </div>
  );
}
