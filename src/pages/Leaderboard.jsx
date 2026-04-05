import { useState } from 'react';
import { Trophy, Search, Star, AlertCircle } from 'lucide-react';
import { getPayerRankings } from '../api/client';
import { Spinner, EmptyState, ScoreDots } from '../components/ui';

export default function Leaderboard() {
  const [drug, setDrug] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!drug.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await getPayerRankings(drug);
      setRankings(data.scores || []);
    } catch (err) {
      console.error(err);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-[var(--fg)] mb-4">
          Restriction Index
        </h1>
        <p className="font-mono text-[var(--accent)] text-sm uppercase tracking-widest max-w-xl mx-auto">
          Payer restrictiveness leaderboard
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-16 fade-up fade-up-delay-1">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded py-3 pl-12 pr-32 text-[var(--fg)] font-mono text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Enter drug name..."
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !drug.trim()}
            className="absolute right-1 text-[10px] font-mono uppercase tracking-widest bg-[var(--accent)] hover:bg-[var(--accent-2)] text-[var(--bg)] px-4 py-2 rounded transition-colors disabled:opacity-30"
          >
            Compute
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner label="CALCULATING RANKINGS..." />
        </div>
      ) : searched && rankings.length === 0 ? (
        <EmptyState title="NO DATA" subtitle="No rankings available for this specific drug designation." />
      ) : searched && rankings.length > 0 ? (
        <div className="space-y-4 fade-up">
          {rankings.map((item, idx) => (
            <div 
              key={item.payer}
              className={`bg-[var(--bg-2)] border border-[var(--border)] p-6 rounded-lg flex items-center gap-6 relative transition-all hover:border-[var(--accent)] group animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col items-center justify-center w-12 h-12 bg-[var(--bg)] border border-[var(--border)] rounded font-mono text-xl font-bold text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)] transition-colors">
                {idx + 1}
              </div>
              
              <div className="flex-1">
                <h3 className="font-display text-xl text-[var(--fg)] uppercase tracking-tight m-0">{item.payer}</h3>
                <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">
                  {item.reason}
                </p>
              </div>

              <div className="text-right">
                <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-2">SCORE</div>
                <ScoreDots score={item.score} />
              </div>

              {idx === 0 && (
                <div className="absolute -top-2 -right-2 bg-[var(--accent)] text-[var(--bg)] p-1.5 rounded-full shadow-lg shadow-[var(--accent)]">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
          <div className="text-center opacity-30 mt-20">
              <Star className="w-12 h-12 mx-auto mb-4 text-[var(--muted)]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Ready for analysis</p>
          </div>
      )}
    </div>
  );
}
