import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react';
import { getChanges } from '../api/client';
import { PAYERS, DRUGS } from '../mocks/mockData';
import { Spinner, EmptyState } from '../components/ui';

const TYPE_CONFIG = {
  coverage_added: {
    label: 'Coverage Added',
    dotBg: 'rgba(26,122,74,0.1)',
    dotBorder: 'rgba(26,122,74,0.3)',
    dotColor: 'var(--success)',
    borderLeft: '2px solid var(--success)',
    badgeBg: 'rgba(26,122,74,0.08)',
    badgeColor: 'var(--success)',
    badgeBorder: 'rgba(26,122,74,0.2)',
    icon: TrendingUp,
  },
  restriction: {
    label: 'Restriction Added',
    dotBg: 'rgba(143,42,42,0.08)',
    dotBorder: 'rgba(143,42,42,0.25)',
    dotColor: 'var(--danger)',
    borderLeft: '2px solid var(--danger)',
    badgeBg: 'rgba(143,42,42,0.06)',
    badgeColor: 'var(--danger)',
    badgeBorder: 'rgba(143,42,42,0.18)',
    icon: TrendingDown,
  },
  criteria_changed: {
    label: 'Criteria Changed',
    dotBg: 'rgba(143,106,26,0.08)',
    dotBorder: 'rgba(143,106,26,0.25)',
    dotColor: 'var(--warning)',
    borderLeft: '2px solid var(--warning)',
    badgeBg: 'rgba(143,106,26,0.06)',
    badgeColor: 'var(--warning)',
    badgeBorder: 'rgba(143,106,26,0.18)',
    icon: RefreshCw,
  },
};

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const selectStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius-pill)',
  padding: '0.45rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '0.82rem',
  color: 'var(--fg)',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
};

export default function Changes() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ payer: '', drug: '', type: '' });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchChanges = async () => {
      setLoading(true);
      try {
        const data = await getChanges(filters);
        setChanges(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChanges();
  }, [filters]);

  const hasActiveFilters = filters.payer || filters.drug || filters.type;
  const clearFilters = () => setFilters({ payer: '', drug: '', type: '' });

  const TYPES = [
    { value: 'coverage_added', text: 'Coverage Added' },
    { value: 'restriction', text: 'Restriction Added' },
    { value: 'criteria_changed', text: 'Criteria Changed' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--fg)', letterSpacing: '-0.02em', margin: '0 0 0.6rem' }}>
          Change Log
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--fg-3)', margin: 0 }}>
          Track every policy update across payers and drugs
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' }}>
        {[
          { key: 'payer', label: 'All payers', options: PAYERS },
          { key: 'drug', label: 'All drugs', options: DRUGS },
          { key: 'type', label: 'All types', options: TYPES, isObj: true },
        ].map(({ key, label, options, isObj }) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            style={selectStyle}
          >
            <option value="">{label}</option>
            {options.map((o) => (
              <option key={isObj ? o.value : o} value={isObj ? o.value : o}>
                {isObj ? o.text : o}
              </option>
            ))}
          </select>
        ))}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--fg-3)', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: '0.45rem 0.9rem', cursor: 'pointer' }}
          >
            <X style={{ width: '0.8rem', height: '0.8rem' }} /> Clear
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center' }}>
          <Spinner label="Loading changes..." />
        </div>
      ) : changes.length === 0 ? (
        <EmptyState title="No changes found" subtitle="No policy changes match your current filters." />
      ) : (
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '0.45rem', top: 0, bottom: 0, width: '1px', background: 'var(--border-strong)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {changes.map((change, index) => {
              const conf = TYPE_CONFIG[change.type];
              if (!conf) return null;
              const isExpanded = expanded === change.id;
              const Icon = conf.icon;

              return (
                <div key={change.id} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.7rem',
                      top: '1rem',
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      background: conf.dotBg,
                      border: `1px solid ${conf.dotBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon style={{ width: '0.5rem', height: '0.5rem', color: conf.dotColor }} />
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : change.id)}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border-strong)',
                      borderLeft: conf.borderLeft,
                      borderRadius: 'var(--radius-card)',
                      padding: '1.25rem 1.5rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(18,19,23,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Card header */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            background: conf.badgeBg,
                            color: conf.badgeColor,
                            border: `1px solid ${conf.badgeBorder}`,
                            borderRadius: 'var(--radius-pill)',
                            padding: '0.2rem 0.7rem',
                          }}
                        >
                          {conf.label}
                        </span>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: 'var(--fg)' }}>
                          {change.payer}{' '}
                          <span style={{ color: 'var(--fg-3)', fontWeight: 300 }}>·</span>{' '}
                          {change.drug}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.05em', color: 'var(--fg-3)', background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: '0.2rem 0.7rem', whiteSpace: 'nowrap' }}>
                        {formatDate(change.date)}
                      </span>
                    </div>

                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-3)', margin: 0, lineHeight: 1.6 }}>
                      {change.summary}
                    </p>

                    {/* Expanded before/after */}
                    {isExpanded && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(143,42,42,0.04)', border: '1px solid rgba(143,42,42,0.15)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: '0.5rem' }}>Before</div>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--fg-2)', margin: 0, lineHeight: 1.5 }}>
                            {change.previous}
                          </p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(26,122,74,0.04)', border: '1px solid rgba(26,122,74,0.15)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.5rem' }}>After</div>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--fg-2)', margin: 0, lineHeight: 1.5 }}>
                            {change.current}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
