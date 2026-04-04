import { useState, useEffect } from 'react';
import { Filter, Clock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getChanges } from '../api/client';
import { PAYERS, DRUGS } from '../mocks/mockData';
import { Spinner, EmptyState } from '../components/ui';

const TYPE_CONFIG = {
  coverage_added: {
    label: 'Coverage Added',
    icon: TrendingUp,
    dotBg: 'bg-emerald-500',
    shadowClass: 'shadow-emerald-500/20',
    borderClass: 'border-l-emerald-500',
    textClass: 'text-emerald-500',   
    badgeBg: 'bg-emerald-500/10'
  },
  restriction: {
    label: 'Restriction Added',
    icon: TrendingDown,
    dotBg: 'bg-rose-500',
    shadowClass: 'shadow-rose-500/20',
    borderClass: 'border-l-rose-500',
    textClass: 'text-rose-500',
    badgeBg: 'bg-rose-500/10'
  },
  criteria_changed: {
    label: 'Criteria Changed',
    icon: RefreshCw,
    dotBg: 'bg-amber-500',
    shadowClass: 'shadow-amber-500/20',
    borderClass: 'border-l-amber-500',
    textClass: 'text-amber-500',
    badgeBg: 'bg-amber-500/10'
  }
};

const formatDate = (iso) => {
  return new Date(iso).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
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

  const clearFilters = () => {
    setFilters({ payer: '', drug: '', type: '' });
  };

  const TYPES = [
    { value: 'coverage_added', text: 'Coverage added' },
    { value: 'restriction', text: 'Restriction added' },
    { value: 'criteria_changed', text: 'Criteria changed' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10 fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">Change Log</h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          "What changed across payer policies this quarter?"
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-1 border border-surface-border p-4 rounded-xl mb-10 fade-up fade-up-delay-1 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
        </div>
        
        <select 
          className="bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
          value={filters.payer}
          onChange={(e) => setFilters({...filters, payer: e.target.value})}
        >
          <option value="">All payers</option>
          {PAYERS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select 
          className="bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
          value={filters.drug}
          onChange={(e) => setFilters({...filters, drug: e.target.value})}
        >
          <option value="">All drugs</option>
          {DRUGS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select 
          className="bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.text}</option>)}
        </select>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors ml-auto mt-2 sm:mt-0"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-24 fade-up">
          <Spinner size={40} />
        </div>
      ) : changes.length === 0 ? (
        <div className="fade-up fade-up-delay-2">
          <EmptyState 
            icon={Clock} 
            title="No changes found" 
            subtitle="Try adjusting your filters to see more results." 
          />
        </div>
      ) : (
        <div className="relative pl-12 sm:pl-16 max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[19px] sm:left-[27px] top-4 bottom-0 w-px bg-surface-border" />

          {/* Timeline Events */}
          <div className="space-y-6">
            {changes.map((change, index) => {
              const conf = TYPE_CONFIG[change.type];
              if (!conf) return null; // Safety check
              
              const Icon = conf.icon;
              const isExpanded = expanded === change.id;
              
              return (
                <div 
                  key={change.id} 
                  className={`relative fade-up fade-up-delay-${Math.min(index + 1, 6)}`}
                >
                  {/* Dot */}
                  <div className={`absolute -left-12 sm:-left-16 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface-0 ${conf.dotBg} z-10 shadow-sm ${conf.shadowClass}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Card */}
                  <div 
                    onClick={() => setExpanded(isExpanded ? null : change.id)}
                    className={`bg-surface-1 border-y border-r border-surface-border border-l-2 ${conf.borderClass} rounded-xl p-4 sm:p-5 cursor-pointer hover:bg-surface-2 transition-colors`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-transparent ${conf.badgeBg} ${conf.textClass}`}>
                          {conf.label}
                        </span>
                        <div className="text-sm font-medium text-slate-200">
                          {change.payer} <span className="text-slate-500 font-normal mx-1">&middot;</span> {change.drug}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 font-medium">
                        {formatDate(change.date)}
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {change.summary}
                    </p>

                    {/* Diff Area */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-surface-border animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 sm:p-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-rose-500/70 block mb-1.5 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Before
                            </span>
                            <span className="text-sm text-slate-300 block mt-1">{change.previous}</span>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 sm:p-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500/70 block mb-1.5 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> After
                            </span>
                            <span className="text-sm text-slate-300 block mt-1">{change.current}</span>
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
