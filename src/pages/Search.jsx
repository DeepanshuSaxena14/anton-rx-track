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
    setNlAnswer(null); // Reset NL answer when running a new search

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
      {/* Title */}
      <div className="text-center mb-8 fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Drug Coverage Search
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          "Which health plans cover Drug X under their medical benefit?"
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 fade-up fade-up-delay-1">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            className="w-full bg-surface-1 border border-surface-border rounded-full py-3 pl-12 pr-24 text-[#e8e8f0] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
            placeholder="Search by drug name (e.g. Keytruda, Dupixent)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>
      </div>

      {/* States */}
      {loading ? (
        <div className="py-20">
          <Spinner label="Searching policies..." size={32} />
        </div>
      ) : searched && results.length === 0 ? (
        <div className="fade-up fade-up-delay-2 max-w-md mx-auto mt-8">
          <EmptyState
            icon={SearchX}
            title="No policies found"
            subtitle={`We couldn't find any medical benefit coverage data for "${query}". Please check the spelling or try another drug.`}
          />
        </div>
      ) : searched && results.length > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-surface-border pb-3 fade-up mt-8">
            <h3 className="font-medium text-slate-200">Coverage Results</h3>
            <span className="text-sm text-slate-400 font-medium bg-surface-2 px-2.5 py-1 rounded border border-surface-border">
              {results.length} found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.map((policy, idx) => (
              <DrugCard key={policy.id} policy={policy} index={idx} />
            ))}
          </div>

          {/* NL Query Box */}
          <div
            className={`mt-12 bg-surface-1 border border-surface-border rounded-xl p-5 fade-up fade-up-delay-${Math.min(
              results.length + 1,
              6
            )}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-brand-400" />
              <h3 className="font-medium text-slate-200">Ask a Question</h3>
            </div>

            <form onSubmit={handleNLQuery} className="relative flex items-center mb-4">
              <input
                type="text"
                className="w-full bg-surface-2 border border-surface-border rounded-lg py-2.5 pl-4 pr-12 text-sm text-[#e8e8f0] placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                placeholder="Ask follow-up questions about these policies..."
                value={nlQuestion}
                onChange={(e) => setNlQuestion(e.target.value)}
                disabled={nlLoading}
              />
              <button
                type="submit"
                disabled={nlLoading || !nlQuestion.trim()}
                className="absolute right-2 p-1.5 text-slate-400 hover:text-brand-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
              >
                {nlLoading ? <Spinner size={16} /> : <Send className="h-4 w-4" />}
              </button>
            </form>

            {nlAnswer && (
              <div className="bg-surface-2 border border-brand-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {nlAnswer.answer}
                </p>
                {nlAnswer.sources && nlAnswer.sources.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Sources
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {nlAnswer.sources.map((src, i) => (
                        <div
                          key={i}
                          className="flex flex-col bg-surface-3 border border-surface-border rounded px-2 py-1.5 text-xs"
                        >
                          <span className="font-medium text-brand-300">{src.payer}</span>
                          <span className="text-slate-400">
                            {src.drug} • {src.section}
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
