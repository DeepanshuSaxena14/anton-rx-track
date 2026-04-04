import { useState, useEffect, Fragment } from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { comparePolicies } from '../api/client';
import { DRUGS, PAYERS } from '../mocks/mockData';
import { Spinner, EmptyState, CoverageBadge, ScoreDots, HcpcsPill, SiteOfCareTags } from '../components/ui';

const valuesDiffer = (a, b) => {
  return JSON.stringify(a) !== JSON.stringify(b);
};

export default function Compare() {
  const [drug, setDrug] = useState(DRUGS[0]);
  const [payerA, setPayerA] = useState(PAYERS[0]);
  const [payerB, setPayerB] = useState(PAYERS[1] || PAYERS[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const result = await comparePolicies(drug, payerA, payerB);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [drug, payerA, payerB]);

  const fields = [
    { key: 'coverage_status', label: 'Coverage Status' },
    { key: 'hcpcs_code', label: 'HCPCS Code' },
    { key: 'pa_required', label: 'PA Required' },
    { key: 'pa_criteria', label: 'PA Criteria' },
    { key: 'step_therapy_required', label: 'Step Therapy Required' },
    { key: 'step_therapy_details', label: 'Step Therapy Details' },
    { key: 'site_of_care', label: 'Site of Care' },
    { key: 'effective_date', label: 'Effective Date' },
    { key: 'score', label: 'Restrictiveness Score' }
  ];

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="italic text-slate-500 text-sm">Not specified</span>;
    }
    
    if (key === 'coverage_status') return <CoverageBadge status={value} />;
    if (key === 'hcpcs_code') return <HcpcsPill code={value} />;
    if (key === 'score') return <ScoreDots score={value} />;
    if (key === 'site_of_care') return <SiteOfCareTags sites={value} />;
    
    if (key === 'pa_required' || key === 'step_therapy_required') {
      return (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          {value ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          <span className="font-medium">{value ? 'Yes' : 'No'}</span>
        </div>
      );
    }
    
    if (key === 'effective_date') {
      return <span className="text-sm font-medium text-slate-200">{new Date(value).toLocaleDateString()}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-sm text-slate-500 italic">None specified.</span>;
      return (
        <ul className="space-y-1.5">
          {value.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
               <span className="text-brand-500 font-bold mt-[-2px]">&rarr;</span>
               <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    return <span className="text-sm text-slate-300 bg-surface-3 p-2 rounded border border-surface-border block">{String(value)}</span>;
  };

  let diffCount = 0;
  if (data && data.policyA && data.policyB) {
    fields.forEach((f) => {
      if (valuesDiffer(data.policyA[f.key], data.policyB[f.key])) diffCount++;
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10 fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Payer Comparison
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Side-by-side view of two payers for the same drug — all fields normalized.
        </p>
      </div>

      {/* Normalization Banner */}
      <div className="max-w-4xl mx-auto flex items-start gap-3 p-4 mb-10 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-200 text-sm fade-up fade-up-delay-1">
        <Info className="h-5 w-5 shrink-0 text-brand-400" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-brand-100">Normalized schema</strong> — UHC's Clinical Policy Bulletin and Cigna's Drug and Biologic Coverage Policy are mapped to the same 12-field standard structure, enabling true apples-to-apples comparison.
        </p>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 fade-up fade-up-delay-2 p-4 bg-surface-1 border border-surface-border rounded-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Drug</label>
          <select 
            className="bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          >
            {DRUGS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payer A</label>
          <select 
            className="bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
            value={payerA}
            onChange={(e) => setPayerA(e.target.value)}
          >
            {PAYERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payer B</label>
          <select 
            className="bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2.5 px-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
            value={payerB}
            onChange={(e) => setPayerB(e.target.value)}
          >
            {PAYERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 fade-up">
          <Spinner label="Comparing normalized policies..." size={40} />
        </div>
      ) : data && (!data.policyA || !data.policyB) ? (
        <div className="max-w-xl mx-auto py-12 fade-up">
          <EmptyState 
            icon={AlertCircle} 
            title="Data Missing" 
            subtitle="One or both payers do not have data for the selected drug in the system. Select different payers or a different drug to compare." 
          />
        </div>
      ) : data && data.policyA && data.policyB ? (
        <div className="max-w-5xl mx-auto fade-up fade-up-delay-3">
          
          {diffCount > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{diffCount} fields differ between these payers</span>
            </div>
          )}

          <div className="grid grid-cols-[160px_1fr_1fr] gap-px bg-surface-border rounded-xl overflow-hidden border border-surface-border shadow-lg">
            {/* Header Row */}
            <div className="bg-surface-1 p-5 border-b border-surface-border"></div>
            <div className="bg-surface-1 p-5 border-b border-surface-border">
              <div className="text-xs font-medium text-brand-400 mb-1">{data.policyA.payer}</div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{data.policyA.drug_name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium text-sm">{data.policyA.brand_name}</span>
              </div>
            </div>
            <div className="bg-surface-1 p-5 border-b border-surface-border">
              <div className="text-xs font-medium text-brand-400 mb-1">{data.policyB.payer}</div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{data.policyB.drug_name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium text-sm">{data.policyB.brand_name}</span>
              </div>
            </div>
            
            {/* Data Rows */}
            {fields.map((f) => {
              const valA = data.policyA[f.key];
              const valB = data.policyB[f.key];
              const differ = valuesDiffer(valA, valB);
              
              const valBg = differ ? 'bg-amber-500/5' : 'bg-surface-2';
              const labelBorder = differ ? 'border-l-2 border-l-amber-500/60' : 'border-l-2 border-l-transparent';
              
              return (
                <Fragment key={f.key}>
                  {/* Label Cell */}
                  <div className={`p-4 bg-surface-1 font-semibold text-sm text-slate-300 flex items-center ${labelBorder}`}>
                    <span className={differ ? 'text-amber-200/90' : ''}>{f.label}</span>
                  </div>
                  
                  {/* Payer A Cell */}
                  <div className={`p-4 ${valBg}`}>
                    {renderValue(f.key, valA)}
                  </div>
                  
                  {/* Payer B Cell */}
                  <div className={`p-4 ${valBg}`}>
                    {renderValue(f.key, valB)}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
