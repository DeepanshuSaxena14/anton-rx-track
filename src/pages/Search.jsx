import { useState } from 'react';
import { Search as SearchIcon, Sparkles, Send } from 'lucide-react';
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
      console.error(error);
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
      console.error(error);
    } finally {
      setNlLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: 'var(--fg)',
            letterSpacing: '-0.02em',
            margin: '0 0 0.6rem',
          }}
        >
          Policy Search
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--fg-3)', margin: 0 }}>
          Search across all payers by drug name or HCPCS code
        </p>
      </div>

      {/* Search bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <SearchIcon
            style={{
              position: 'absolute',
              left: '1.1rem',
              width: '1rem',
              height: '1rem',
              color: 'var(--fg-3)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drug name or HCPCS code..."
            style={{
              width: '100%',
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              padding: '0.75rem 8rem 0.75rem 2.75rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: 'var(--fg)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--fg)';
              e.target.style.boxShadow = '0 0 0 3px rgba(33,34,38,0.08)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border-strong)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              position: 'absolute',
              right: '0.35rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '0.82rem',
              color: 'var(--bg)',
              background: 'var(--fg)',
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              opacity: loading || !query.trim() ? 0.4 : 1,
              transition: 'opacity 0.15s ease, background 0.15s ease',
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ padding: '5rem 0', display: 'flex', justifyContent: 'center' }}>
          <Spinner label="Searching policies..." />
        </div>
      ) : searched && results.length === 0 ? (
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <EmptyState
            title="No results found"
            subtitle={`No policies matched "${query}". Try a different drug name or payer.`}
          />
        </div>
      ) : searched && results.length > 0 ? (
        <div>
          {/* Results header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--fg)' }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--fg-3)',
              }}
            >
              for "{query}"
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            {results.map((policy, idx) => (
              <DrugCard key={policy.id} policy={policy} index={idx} />
            ))}
          </div>

          {/* NL Ask panel */}
          <div
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-card)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Sparkles style={{ width: '1rem', height: '1rem', color: 'var(--fg-3)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--fg)' }}>
                Ask a follow-up question
              </span>
            </div>

            <form onSubmit={handleNLQuery} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <input
                type="text"
                value={nlQuestion}
                onChange={(e) => setNlQuestion(e.target.value)}
                placeholder="e.g. Does Aetna require PA for this drug?"
                disabled={nlLoading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.7rem 3rem 0.7rem 1.25rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.87rem',
                  color: 'var(--fg)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--fg)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(33,34,38,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border-strong)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={nlLoading || !nlQuestion.trim()}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: 'var(--fg-3)',
                  opacity: nlLoading || !nlQuestion.trim() ? 0.3 : 1,
                }}
              >
                {nlLoading ? <Spinner size={16} /> : <Send style={{ width: '1rem', height: '1rem' }} />}
              </button>
            </form>

            {nlAnswer && (
              <div
                style={{
                  background: 'var(--bg)',
                  borderLeft: '2px solid var(--fg)',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  padding: '1.1rem 1.25rem',
                }}
              >
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--fg-2)', lineHeight: 1.65, margin: '0 0 1rem' }}>
                  {nlAnswer.answer}
                </p>
                {nlAnswer.sources && nlAnswer.sources.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: '0.6rem' }}>
                      Sources
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {nlAnswer.sources.map((src, i) => (
                        <span
                          key={i}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            background: 'var(--bg-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '0.2rem 0.6rem',
                            color: 'var(--fg-2)',
                          }}
                        >
                          {src.payer} · {src.drug}
                        </span>
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
