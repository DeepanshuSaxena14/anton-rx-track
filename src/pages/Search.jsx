import { useState } from 'react';
import { Search as SearchIcon, SearchX, Sparkles, Send } from 'lucide-react';
import { searchPolicies, queryNL } from '../api/client';
import DrugCard from '../components/DrugCard';
import { Spinner, EmptyState } from '../components/ui';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [nlQuestion, setNlQuestion] = useState('');
  const [nlAnswer, setNlAnswer] = useState(null);
  const [nlLoading, setNlLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setNlAnswer(null);

    try {
      const data = await searchPolicies(query);
      setResults(data);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNLQuery = async (e) => {
    e.preventDefault();
    if (!nlQuestion.trim() || nlLoading) return;

    setNlLoading(true);
    try {
      const data = await queryNL(nlQuestion);
      setNlAnswer(data);
    } catch (error) {
      console.error('Error answering query:', error);
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-[var(--fg)] mb-4">
          Search Algorithm
        </h1>
        <p className="font-mono text-[var(--muted)] text-sm uppercase tracking-widest max-w-2xl mx-auto">
          Query engine for medical benefit matrices
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12 fade-up fade-up-delay-1">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-[var(--fg)] opacity-50" />
          <input
            type="text"
            className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-md py-3 pl-12 pr-32 text-[var(--fg)] font-mono placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            placeholder="Enter drug designation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-1 text-xs font-mono uppercase tracking-widest bg-[var(--accent)] hover:bg-[var(--accent-2)] text-[var(--bg)] px-4 py-2 rounded transition-colors disabled:opacity-30"
          >
            Execute
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner label="INITIALIZING SEARCH ROUTINE..." />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="fade-up fade-up-delay-2 max-w-md mx-auto mt-8">
          <EmptyState
            title="NO RECORDS LOCATED"
            subtitle={`Query "${query}" returned zero matches in active index.`}
          />
        </div>
      ) : searched && results.length > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 fade-up mt-8">
            <h3 className="font-mono text-sm tracking-widest text-[var(--fg)] uppercase">SYS.RESULTS</h3>
            <span className="text-xs text-[var(--accent)] font-mono tracking-widest bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border border-[var(--accent)] px-2 py-0.5 rounded">
              LEN: {results.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {results.map((policy, idx) => (
              <DrugCard key={policy.id} policy={policy} index={idx} />
            ))}
          </div>

          <div
            className={`mt-12 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg p-6 fade-up relative group transition-colors hover:border-[var(--accent)]`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-mono text-sm tracking-widest text-[var(--fg)] uppercase">NLP Analysis Terminal</h3>
            </div>

            <form onSubmit={handleNLQuery} className="relative flex items-center mb-6">
              <div className="absolute left-4 font-mono text-[var(--accent)] text-sm">{'>'}</div>
              <input
                type="text"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded py-3 pl-10 pr-12 text-[var(--fg)] font-mono text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="Submit follow-up parameters..."
                value={nlQuestion}
                onChange={(e) => setNlQuestion(e.target.value)}
                disabled={nlLoading}
              />
              <button
                type="submit"
                disabled={nlLoading || !nlQuestion.trim()}
                className="absolute right-2 p-2 text-[var(--fg)] opacity-50 hover:opacity-100 hover:text-[var(--accent)] disabled:opacity-20 transition-colors bg-transparent border-none"
              >
                {nlLoading ? <Spinner label="" size={16} /> : <Send className="h-4 w-4" />}
              </button>
            </form>

            {nlAnswer && (
              <div className="bg-[var(--bg)] border-l-2 border-[var(--accent)] p-5 animate-in fade-in duration-300">
                <p className="font-mono text-[13px] leading-relaxed text-[var(--fg)] mb-5">
                  {nlAnswer.answer}
                </p>
                {nlAnswer.sources && nlAnswer.sources.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-widest block mb-3 border-b border-[var(--border)] pb-1">
                      CITATIONS
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {nlAnswer.sources.map((src, i) => (
                        <div
                          key={i}
                          className="flex flex-col bg-[var(--bg-2)] border border-[var(--border)] rounded px-2 py-1.5 font-mono text-[10px]"
                        >
                          <span className="font-semibold text-[var(--accent)] uppercase tracking-wider">{src.payer}</span>
                          <span className="text-[var(--muted)]">
                            {src.drug} // {src.section}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
