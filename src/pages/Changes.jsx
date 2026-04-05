import { useState, useEffect } from 'react';
import { Filter, Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getChanges } from '../api/client';
import { PAYERS, DRUGS } from '../mocks/mockData';
import { Spinner, EmptyState } from '../components/ui';

const TYPE_CONFIG = {
  coverage_added: {
    label: '+ ADDED',
    borderClass: 'border-l-[var(--accent)]',
    textClass: 'text-[var(--accent)] border-[var(--accent)]',
  },
  restriction: {
    label: '- RESTRICTED',
    borderClass: 'border-l-rose-400',
    textClass: 'text-rose-400 border-rose-400',
  },
  criteria_changed: {
    label: '~ CHANGED',
    borderClass: 'border-l-[#facc15]',
    textClass: 'text-[#facc15] border-[#facc15]',
  }
};

const formatDate = (iso) => {
  return new Date(iso).toISOString().split('T')[0];
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
        console.error('Error fetching changes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChanges();
  }, [filters]);

  const hasActiveFilters = filters.payer || filters.drug || filters.type;

  const clearFilters = () => setFilters({ payer: '', drug: '', type: '' });

  const TYPES = [
    { value: 'coverage_added', text: 'COVERAGE ADDED' },
    { value: 'restriction', text: 'RESTRICTION ADDED' },
    { value: 'criteria_changed', text: 'CRITERIA CHANGED' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-[var(--fg)] tracking-tight mb-4">
          Change Log
        </h1>
        <p className="font-mono text-[var(--accent)] text-sm uppercase tracking-widest max-w-2xl mx-auto">
          Temporal policy modifications
        </p>
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded p-4 flex flex-wrap items-center gap-4 mb-16 fade-up fade-up-delay-1 shadow-sm">
        <div className="flex items-center gap-2 text-[var(--accent)] mr-2">
          <span className="font-mono text-xs uppercase tracking-widest">[{'>'} FILTERS]</span>
        </div>
        
        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] rounded py-2 px-3 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
          value={filters.payer}
          onChange={(e) => setFilters({...filters, payer: e.target.value})}
        >
          <option value="" className="bg-[var(--bg-2)]">ALL PAYERS</option>
          {PAYERS.map((p) => <option key={p} value={p} className="bg-[var(--bg-2)]">{p}</option>)}
        </select>

        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] rounded py-2 px-3 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
          value={filters.drug}
          onChange={(e) => setFilters({...filters, drug: e.target.value})}
        >
          <option value="" className="bg-[var(--bg-2)]">ALL DRUGS</option>
          {DRUGS.map((d) => <option key={d} value={d} className="bg-[var(--bg-2)]">{d}</option>)}
        </select>

        <select 
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] rounded py-2 px-3 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="" className="bg-[var(--bg-2)]">ALL TYPES</option>
          {TYPES.map((t) => <option key={t.value} value={t.value} className="bg-[var(--bg-2)]">{t.text}</option>)}
        </select>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] border border-[var(--border)] px-3 py-2 hover:bg-[var(--bg)] hover:text-[var(--fg)] transition-colors ml-auto mt-2 sm:mt-0 rounded"
          >
            CLEAR
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-24 fade-up">
          <Spinner label="PULLING TEMPORAL DATA..." />
        </div>
      ) : changes.length === 0 ? (
        <div className="fade-up fade-up-delay-2">
          <EmptyState title="NO EVENTS" subtitle="Zero log entries match active filters." />
        </div>
      ) : (
        <div className="relative pl-8 sm:pl-12 max-w-3xl mx-auto">
          <div className="absolute left-[16px] sm:left-[24px] top-0 bottom-0 w-px bg-[var(--border)]" />

          <div className="space-y-8">
            {changes.map((change, index) => {
              const conf = TYPE_CONFIG[change.type];
              if (!conf) return null;
              
              const isExpanded = expanded === change.id;
              
              return (
                <div 
                  key={change.id} 
                  className={`relative fade-up fade-up-delay-${Math.min(index + 1, 6)} group`}
                >
                  <div className="absolute -left-10 sm:-left-[3.25rem] w-4 h-4 bg-[var(--bg)] flex items-center justify-center z-10 border border-[var(--border)] rounded-full mt-2">
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                  </div>

                  <div 
                    onClick={() => setExpanded(isExpanded ? null : change.id)}
                    className={`bg-[var(--bg-2)] border border-[var(--border)] border-l-4 ${conf.borderClass} p-5 rounded cursor-pointer transition-colors hover:border-[var(--accent)] shadow-sm`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono tracking-widest border rounded ${conf.textClass} bg-[color-mix(in_srgb,transparent_90%,currentColor)]`}>
                          {conf.label}
                        </span>
                        <div className="text-xl font-display font-semibold text-[var(--fg)] tracking-tight uppercase">
                          {change.payer} <span className="opacity-30 mx-1">/</span> {change.drug}
                        </div>
                      </div>
                      <div className="text-xs font-mono text-[var(--accent)] tracking-widest border border-[var(--border)] px-2 py-0.5 rounded bg-[var(--bg)]">
                        {formatDate(change.date)}
                      </div>
                    </div>
                    
                    <p className="font-mono text-xs text-[var(--muted)] leading-relaxed uppercase">
                      {change.summary}
                    </p>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-[var(--border)] animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="border border-[var(--border)] bg-[var(--bg)] p-4 rounded">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted)] block mb-3 border-b border-[var(--border)] pb-1">
                              STATE: -1
                            </span>
                            <span className="font-mono text-xs text-rose-400 block mt-1 uppercase decoration-rose-500 line-through">
                              {change.previous}
                            </span>
                          </div>
                          <div className="border border-[var(--border)] bg-[var(--bg)] p-4 rounded shadow-sm relative">
                            <div className="absolute top-0 right-0 p-1.5 px-3 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)] text-[8px] font-mono tracking-widest">+ NEW</div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] block mb-3 border-b border-[color-mix(in_srgb,var(--accent)_20%,transparent)] pb-1">
                              STATE: +1
                            </span>
                            <span className="font-mono text-xs text-[var(--fg)] block mt-1 uppercase">
                              {change.current}
                            </span>
                          </div>
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
