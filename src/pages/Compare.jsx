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
        // Map backend list to the policyA/B object format expected by the component
        setData({
          policyA: result.comparison?.[0] || null,
          policyB: result.comparison?.[1] || null
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [drug, payerA, payerB]);

  const fields = [
    { key: 'coverage_status', label: 'COVERAGE_STATUS' },
    { key: 'hcpcs_code', label: 'HCPCS_CODE' },
    { key: 'pa_required', label: 'PA_REQUIRED' },
    { key: 'pa_criteria', label: 'PA_CRITERIA' },
    { key: 'step_therapy_required', label: 'STEP_THERAPY_REQ' },
    { key: 'step_therapy_details', label: 'STEP_THERAPY_MATRIX' },
    { key: 'site_of_care', label: 'SITE_OF_CARE' },
    { key: 'effective_date', label: 'START_DATE' },
    { key: 'score', label: 'RESTRICTION_SCORE' }
  ];

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="font-mono text-xs text-[var(--muted)] opacity-50">NULL</span>;
    }
    
    if (key === 'coverage_status') return <CoverageBadge status={value} />;
    if (key === 'hcpcs_code') return <HcpcsPill code={value} />;
    if (key === 'score') return <ScoreDots score={value} />;
    if (key === 'site_of_care') return <SiteOfCareTags sites={value} />;
    
    if (key === 'pa_required' || key === 'step_therapy_required') {
      return (
        <span className={`font-mono text-xs uppercase tracking-wider ${value ? 'text-rose-400 font-bold' : 'text-[var(--fg)]'}`}>
          {value ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    
    if (key === 'effective_date') {
      return <span className="font-mono text-xs uppercase tracking-wider text-[var(--fg)]">{new Date(value).toISOString().split('T')[0]}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="font-mono text-xs text-[var(--muted)] opacity-50">NULL_ARRAY</span>;
      return (
        <ul className="space-y-2">
          {value.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-mono text-[var(--fg)] opacity-80 leading-relaxed uppercase">
               <span className="text-[var(--accent)]">{'>'}</span>
               <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    
    return <span className="font-mono text-xs text-[var(--fg)] bg-[var(--bg)] p-2 rounded border border-[var(--border)] block uppercase">{String(value)}</span>;
  };

  let diffCount = 0;
  if (data && data.policyA && data.policyB) {
    fields.forEach((f) => {
      if (valuesDiffer(data.policyA[f.key], data.policyB[f.key])) diffCount++;
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-[var(--fg)] tracking-tight mb-4">
          Diff Engine
        </h1>
        <p className="font-mono text-[var(--accent)] text-sm uppercase tracking-widest max-w-2xl mx-auto">
          Matrix divergence scan
        </p>
      </div>

      <div className="max-w-4xl mx-auto flex items-start gap-3 p-4 mb-10 bg-[var(--bg-2)] border border-[var(--accent)] rounded fade-up fade-up-delay-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1.5 bg-[var(--accent)] text-[var(--bg)] font-mono text-[10px] uppercase font-bold">INFO</div>
        <Info className="h-5 w-5 shrink-0 text-[var(--accent)] mt-1" />
        <p className="leading-relaxed font-mono text-xs text-[var(--fg)] uppercase pr-8 tracking-wide">
          <strong className="text-[var(--accent)] font-bold">[ NORMALIZED SCHEMA ]:</strong> Internal structures mapped to 12-field standard matrix enabling raw cross-dimensional diff sequence.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 fade-up fade-up-delay-2 p-6 bg-[var(--bg-2)] border border-[var(--border)] rounded shadow-sm">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># SELECT_DRUG</label>
          <select 
            className="bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] rounded py-2 px-3 font-mono text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          >
            {DRUGS.map((d) => <option key={d} value={d} className="bg-[var(--bg-2)]">{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># TARGET_A</label>
          <select 
            className="bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] rounded py-2 px-3 font-mono text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
            value={payerA}
            onChange={(e) => setPayerA(e.target.value)}
          >
            {PAYERS.map((p) => <option key={p} value={p} className="bg-[var(--bg-2)]">{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># TARGET_B</label>
          <select 
            className="bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] rounded py-2 px-3 font-mono text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
            value={payerB}
            onChange={(e) => setPayerB(e.target.value)}
          >
            {PAYERS.map((p) => <option key={p} value={p} className="bg-[var(--bg-2)]">{p}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 fade-up">
          <Spinner label="EXECUTING DIFF SCAN..." />
        </div>
      ) : data && (!data.policyA || !data.policyB) ? (
        <div className="max-w-xl mx-auto py-12 fade-up">
          <EmptyState 
            title="DATA MISSING" 
            subtitle="Selected matrix nodes lack corresponding target payload. Modify parameters." 
          />
        </div>
      ) : data && data.policyA && data.policyB ? (
        <div className="max-w-6xl mx-auto fade-up fade-up-delay-3">
          
          {diffCount > 0 && (
            <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-[color-mix(in_srgb,transparent_80%,#facc15)] border border-[color-mix(in_srgb,transparent_50%,#facc15)] text-[#facc15] font-mono text-xs font-bold uppercase tracking-widest animate-in fade-in rounded">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{diffCount} CONFLICTS DETECTED BETWEEN RECORDS</span>
            </div>
          )}

          <div className="flex flex-col border border-[var(--border)] bg-[var(--bg)] rounded overflow-hidden shadow-sm">
            <div className="grid grid-cols-[160px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] gap-px bg-[var(--border)] border-b border-[var(--border)]">
              <div className="bg-[var(--bg-2)] p-5"></div>
              <div className="bg-[var(--bg-2)] p-6 text-center">
                <div className="text-[10px] font-mono font-bold tracking-widest text-[var(--accent)] mb-2 uppercase">[{data.policyA.payer}]</div>
                <h3 className="font-display text-2xl tracking-tight text-[var(--fg)] mb-1 uppercase m-0 leading-none">{data.policyA.drug_name}</h3>
                <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider block mt-2">{data.policyA.brand_name}</span>
              </div>
              <div className="bg-[var(--bg-2)] p-6 text-center">
                <div className="text-[10px] font-mono font-bold tracking-widest text-rose-400 mb-2 uppercase">[{data.policyB.payer}]</div>
                <h3 className="font-display text-2xl tracking-tight text-[var(--fg)] mb-1 uppercase m-0 leading-none">{data.policyB.drug_name}</h3>
                <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider block mt-2">{data.policyB.brand_name}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-px bg-[var(--border)]">
              {fields.map((f) => {
                const valA = data.policyA[f.key];
                const valB = data.policyB[f.key];
                const differ = valuesDiffer(valA, valB);
                
                const valBg = differ ? 'bg-[color-mix(in_srgb,transparent_90%,#facc15)]' : 'bg-[var(--bg)]';
                const labelBorder = differ ? 'border-l-4 border-l-[#facc15]' : 'border-l-4 border-l-transparent';
                
                return (
                  <div key={f.key} className="grid grid-cols-[160px_1fr_1fr] md:grid-cols-[200px_1fr_1fr] gap-px">
                    <div className={`p-4 bg-[var(--bg-2)] min-h-[60px] font-mono text-[10px] font-bold tracking-widest text-[var(--muted)] flex items-center ${labelBorder}`}>
                      <span className={differ ? 'text-[#facc15]' : ''}>{f.label}</span>
                    </div>
                    
                    <div className={`p-5 ${valBg}`}>
                      {renderValue(f.key, valA)}
                    </div>
                    
                    <div className={`p-5 ${valBg}`}>
                      {renderValue(f.key, valB)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
