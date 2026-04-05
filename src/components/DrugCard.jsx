import { useState } from 'react';
import { CoverageBadge, ScoreDots, HcpcsPill, SiteOfCareTags } from './ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DrugCard({ policy, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(18,19,23,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                color: 'var(--fg-3)',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              {policy.payer}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  fontSize: '1.3rem',
                  color: 'var(--fg)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {policy.drug_name}
              </h2>
              {policy.brand_name && (
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--fg-3)',
                  }}
                >
                  {policy.brand_name}
                </span>
              )}
              <HcpcsPill code={policy.hcpcs_code} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <CoverageBadge status={policy.coverage_status} />
            <ScoreDots score={policy.score} />
          </div>
        </div>

        {/* Key fields */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}
        >
          {[
            { label: 'PA Required', value: policy.pa_required ? 'Yes' : 'No', danger: policy.pa_required },
            { label: 'Step Therapy', value: policy.step_therapy_required ? 'Required' : 'No', danger: policy.step_therapy_required },
            { label: 'Effective', value: policy.effective_date ? new Date(policy.effective_date).toISOString().split('T')[0] : '—' },
          ].map(({ label, value, danger }) => (
            <div key={label} style={{ padding: '0.85rem 1rem', borderRight: '1px solid var(--border)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-3)',
                  marginBottom: '0.3rem',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: danger ? 'var(--danger)' : 'var(--fg)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Site of care */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--fg-3)',
              marginBottom: '0.5rem',
            }}
          >
            Site of Care
          </div>
          {policy.site_of_care && policy.site_of_care.length > 0 ? (
            <SiteOfCareTags sites={policy.site_of_care} />
          ) : (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-3)' }}>—</span>
          )}
        </div>

        {/* Expanded section */}
        {expanded && (
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {policy.covered_indications && policy.covered_indications.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-3)',
                    marginBottom: '0.6rem',
                  }}
                >
                  Indications
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {policy.covered_indications.map((ind, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.82rem',
                        color: 'var(--fg-2)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>›</span>
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {policy.pa_criteria && policy.pa_criteria.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--fg-3)',
                    marginBottom: '0.6rem',
                  }}
                >
                  PA Criteria
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {policy.pa_criteria.map((c, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.82rem',
                        color: 'var(--fg-2)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>›</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {policy.step_therapy_required && policy.step_therapy_details && (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(143,42,42,0.04)',
                  border: '1px solid rgba(143,42,42,0.15)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--danger)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Step Therapy Details
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--fg-2)', margin: 0 }}>
                  {policy.step_therapy_details}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.75rem',
          background: 'var(--bg-2)',
          borderTop: '1px solid var(--border)',
          border: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: '1px solid var(--border)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: 'var(--fg-3)',
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-3)';
          e.currentTarget.style.color = 'var(--fg)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--bg-2)';
          e.currentTarget.style.color = 'var(--fg-3)';
        }}
      >
        {expanded ? (
          <><ChevronUp style={{ width: '0.9rem', height: '0.9rem' }} />Show less</>
        ) : (
          <><ChevronDown style={{ width: '0.9rem', height: '0.9rem' }} />Show more</>
        )}
      </button>
    </div>
  );
}
