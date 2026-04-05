import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { comparePolicies } from '../api/client';
import { DRUGS, PAYERS } from '../mocks/mockData';
import { Spinner, EmptyState, CoverageBadge, ScoreDots, HcpcsPill, SiteOfCareTags } from '../components/ui';

const valuesDiffer = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

const selectStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-pill)',
  padding: '0.55rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  color: 'var(--fg)',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
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
    { key: 'coverage_status', label: 'Coverage' },
    { key: 'hcpcs_code', label: 'HCPCS Code' },
    { key: 'pa_required', label: 'PA Required' },
    { key: 'pa_criteria', label: 'PA Criteria' },
    { key: 'step_therapy_required', label: 'Step Therapy' },
    { key: 'step_therapy_details', label: 'Step Therapy Details' },
    { key: 'site_of_care', label: 'Site of Care' },
    { key: 'effective_date', label: 'Effective Date' },
    { key: 'score', label: 'Restriction Score' },
  ];

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === '') {
      return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--fg-3)', letterSpacing: '0.05em' }}>—</span>;
    }
    if (key === 'coverage_status') return <CoverageBadge status={value} />;
    if (key === 'hcpcs_code') return <HcpcsPill code={value} />;
    if (key === 'score') return <ScoreDots score={value} />;
    if (key === 'site_of_care') return <SiteOfCareTags sites={value} />;
    if (key === 'pa_required' || key === 'step_therapy_required') {
      return (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 500, color: value ? 'var(--danger)' : 'var(--fg)' }}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    if (key === 'effective_date') {
      return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--fg-2)' }}>{new Date(value).toISOString().split('T')[0]}</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--fg-3)' }}>—</span>;
      return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {value.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: '0.4rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--fg-2)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>›</span> {item}
            </li>
          ))}
        </ul>
      );
    }
    return <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-2)' }}>{String(value)}</span>;
  };

  let diffCount = 0;
  if (data?.policyA && data?.policyB) {
    fields.forEach((f) => { if (valuesDiffer(data.policyA[f.key], data.policyB[f.key])) diffCount++; });
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--fg)', letterSpacing: '-0.02em', margin: '0 0 0.6rem' }}>
          Policy Comparison
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--fg-3)', margin: 0 }}>
          Compare coverage rules side-by-side across payers
        </p>
      </div>

      {/* Info banner */}
      <div style={{ maxWidth: '700px', margin: '0 auto 2rem', background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1.1rem' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--fg-3)', margin: 0, lineHeight: 1.6 }}>
          All policies are normalized to a 12-field standard schema before comparison. Differences are highlighted in amber.
        </p>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: '700px', margin: '0 auto 2.5rem', background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-card)', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Drug', value: drug, set: setDrug, options: DRUGS },
          { label: 'Payer A', value: payerA, set: setPayerA, options: PAYERS },
          { label: 'Payer B', value: payerB, set: setPayerB, options: PAYERS },
        ].map(({ label, value, set, options }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              {label}
            </label>
            <select value={value} onChange={(e) => set(e.target.value)} style={selectStyle}>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center' }}>
          <Spinner label="Comparing policies..." />
        </div>
      ) : data && (!data.policyA || !data.policyB) ? (
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <EmptyState title="No data found" subtitle="No policies found for this combination. Try different parameters." />
        </div>
      ) : data?.policyA && data?.policyB ? (
        <div>
          {/* Diff count banner */}
          {diffCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(143,106,26,0.06)', border: '1px solid rgba(143,106,26,0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--warning)' }}>
              <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.85rem' }}>
                {diffCount} difference{diffCount !== 1 ? 's' : ''} detected
              </span>
            </div>
          )}

          {/* Comparison grid */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--bg-2)', padding: '1rem' }} />
              {[data.policyA, data.policyB].map((policy, i) => (
                <div key={i} style={{ background: 'var(--bg-2)', padding: '1.25rem', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: '0.35rem' }}>
                    {policy.payer}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: 'var(--fg)' }}>
                    {policy.drug_name}
                  </div>
                </div>
              ))}
            </div>

            {/* Field rows */}
            {fields.map((f) => {
              const valA = data.policyA[f.key];
              const valB = data.policyB[f.key];
              const differ = valuesDiffer(valA, valB);
              return (
                <div
                  key={f.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr 1fr',
                    borderBottom: '1px solid var(--border)',
                    background: differ ? 'rgba(143,106,26,0.02)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-2)',
                      borderLeft: differ ? '2px solid var(--warning)' : '2px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: differ ? 'var(--warning)' : 'var(--fg-3)',
                        fontWeight: differ ? 500 : 400,
                      }}
                    >
                      {f.label}
                    </span>
                  </div>
                  {[valA, valB].map((val, i) => (
                    <div key={i} style={{ padding: '1rem 1.25rem', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start' }}>
                      {renderValue(f.key, val)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
