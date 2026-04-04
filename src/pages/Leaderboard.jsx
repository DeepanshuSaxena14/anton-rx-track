import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';
import { getScores } from '../api/client';
import { DRUGS } from '../mocks/mockData';
import { Spinner, EmptyState, ScoreDots } from '../components/ui';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drug, setDrug] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const data = await getScores();
        setScores(data);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const filteredScores = scores
    .filter((s) => drug === '' || s.drug === drug)
    .sort((a, b) => (sortDir === 'desc' ? b.score - a.score : a.score - b.score));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-8 fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Payer Leaderboard
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Ranked by restrictiveness score — how hard each payer makes it to get approval.
        </p>
      </div>

      {/* Score legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-10 fade-up fade-up-delay-1 text-sm text-slate-300 bg-surface-1 border border-surface-border p-3 rounded-lg max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" /> Easy (1-3)
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" /> Moderate (4-6)
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/20" /> Restrictive (7-10)
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-surface-1 p-4 rounded-xl border border-surface-border fade-up fade-up-delay-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            className="w-full sm:w-auto bg-surface-2 border border-surface-border text-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          >
            <option value="">All drugs</option>
            {DRUGS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
          className="flex items-center justify-center w-full sm:w-auto gap-2 bg-surface-2 hover:bg-surface-3 transition-colors border border-surface-border text-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-brand-500"
        >
          {sortDir === 'desc' ? (
            <>
              <ArrowDown className="h-4 w-4 text-brand-400" /> Most restrictive first
            </>
          ) : (
            <>
              <ArrowUp className="h-4 w-4 text-brand-400" /> Least restrictive first
            </>
          )}
        </button>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="py-24 fade-up">
          <Spinner size={40} />
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="fade-up fade-up-delay-3 max-w-sm mx-auto mt-8">
          <EmptyState
            icon={AlertTriangle}
            title="No data found"
            subtitle="There are no policies assigned to that selection."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScores.map((item, index) => {
            const rank = index + 1;

            // Subtle styling for top 3
            let rankColor = 'text-surface-4';
            let rankSize = 'text-3xl';

            if (rank === 1 && sortDir === 'desc' && drug === '') {
              rankColor = 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]';
              rankSize = 'text-4xl';
            } else if (rank === 2 && sortDir === 'desc' && drug === '') {
              rankColor = 'text-slate-300';
            } else if (rank === 3 && sortDir === 'desc' && drug === '') {
              rankColor = 'text-amber-700/80';
            } else if (rank === 1) {
              rankColor = 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]';
              rankSize = 'text-4xl';
            } else if (rank === 2) {
              rankColor = 'text-slate-300';
            } else if (rank === 3) {
              rankColor = 'text-amber-700/80';
            }

            return (
              <div
                key={item.id}
                className={`flex flex-wrap sm:flex-nowrap items-center gap-4 bg-surface-2 border border-surface-border rounded-xl px-4 sm:px-5 py-4 hover:border-brand-500/50 hover:bg-surface-3 transition-all fade-up fade-up-delay-${Math.min(
                  index + 1,
                  6
                )}`}
              >
                {/* Rank */}
                <div className={`w-12 shrink-0 font-display font-bold text-center ${rankColor} ${rankSize}`}>
                  #{rank}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 order-3 sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                    <h3 className="font-semibold text-white whitespace-nowrap">{item.payer}</h3>
                    <span className="text-slate-500 font-normal hidden sm:inline">·</span>
                    <span className="text-slate-400 text-sm hidden sm:inline">{item.drug}</span>
                  </div>

                  {/* Requirements Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-1">
                    <span className="text-slate-400 text-sm sm:hidden border border-surface-border bg-surface-1 rounded px-2">{item.drug}</span>
                    {item.pa_required && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        <AlertTriangle className="h-3 w-3" /> PA Required
                      </span>
                    )}
                    {item.step_therapy_required && (
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        <AlertTriangle className="h-3 w-3" /> Step Therapy
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 flex items-center justify-end order-2 sm:order-none ml-auto sm:ml-0">
                  <ScoreDots score={item.score} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
