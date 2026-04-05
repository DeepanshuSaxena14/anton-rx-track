import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { comparePolicies, getPayers, getDrugs } from '../api/client';
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
  const [availablePayers, setAvailablePayers] = useState([]);
  const [availableDrugs, setAvailableDrugs] = useState([]);
  
  const [drug, setDrug] = useState('');
  const [payerA, setPayerA] = useState('');
  const [payerB, setPayerB] = useState('');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  // Load unique payers and drugs on mount
  useEffect(() => {
    async function loadResources() {
      try {
        const [payers, drugs] = await Promise.all([getPayers(), getDrugs()]);
        setAvailablePayers(payers);
        setAvailableDrugs(drugs);
        
        // Set initial selection if available
        if (drugs.length > 0) setDrug(drugs[0]);
        if (payers.length > 0) setPayerA(payers[0]);
        if (payers.length > 1) setPayerB(payers[1]);
        else if (payers.length > 0) setPayerB(payers[0]);
        
      } catch (err) {
        console.error('Core: Resource discovery failed:', err);
      } finally {
        setResourcesLoading(false);
      }
    }
    loadResources();
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!drug || !payerA || !payerB) return;
      
      setLoading(true);
      try {
        const result = await comparePolicies(drug, payerA, payerB);
        // Map backend list to the policyA/B object format by finding matching payer names
        setData({
          policyA: result.comparison?.find(p => p.payer === payerA) || null,
          policyB: result.comparison?.find(p => p.payer === payerB) || null
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (!resourcesLoading) {
      fetchComparison();
    }
  }, [drug, payerA, payerB, resourcesLoading]);

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
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
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

  if (resourcesLoading) {
    return (
      <div style={{ padding: '10rem 0', display: 'flex', justifyContent: 'center' }}>
        <Spinner label="Loading matrix filters..." />
      </div>
    );
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
          { label: 'Drug', value: drug, set: setDrug, options: availableDrugs },
          { label: 'Payer A', value: payerA, set: setPayerA, options: availablePayers },
          { label: 'Payer B', value: payerB, set: setPayerB, options: availablePayers },
        ].map(({ label, value, set, options }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              {label}
            </label>
            <select value={value} onChange={(e) => set(e.target.value)} style={selectStyle}>
              {options.length === 0 ? (
                <option value="">No data ingested</option>
              ) : (
                options.map((o) => <option key={o} value={o}>{o}</option>)
              )}
            </select>
          </div>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center' }}>
          <Spinner label="Comparing policies..." />
        </div>
      ) : data && (!data.policyA && !data.policyB) ? (
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <EmptyState title="No data found" subtitle="Neither payer has a policy for this combination. Try different parameters." />
        </div>
      ) : data ? (
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
              {[ {payer: payerA, policy: data.policyA}, {payer: payerB, policy: data.policyB} ].map((col, i) => (
                <div key={i} style={{ background: 'var(--bg-2)', padding: '1.25rem', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: '0.35rem' }}>
                    {col.payer}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: col.policy ? 'var(--fg)' : 'var(--fg-3)' }}>
                    {col.policy ? col.policy.drug_name : 'No policy found'}
                  </div>
                </div>
              ))}
            </div>

            {/* Field rows */}
            {fields.map((f) => {
              const valA = data.policyA ? data.policyA[f.key] : null;
              const valB = data.policyB ? data.policyB[f.key] : null;
              const differ = data.policyA && data.policyB ? valuesDiffer(valA, valB) : false;
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
