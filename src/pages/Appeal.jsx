import { useState } from 'react';
import { FileText, Send, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { generateAppeal } from '../api/client';
import { Spinner, EmptyState } from '../components/ui';

export default function Appeal() {
  const [formData, setFormData] = useState({
    drug: '',
    payer: '',
    denialReason: '',
    extraContext: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.drug || !formData.payer || !formData.denialReason) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await generateAppeal(
        formData.drug,
        formData.payer,
        formData.denialReason,
        formData.extraContext
      );
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Appeal generation failed. Check API status.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.appeal_draft) return;
    const element = document.createElement('a');
    const file = new Blob([result.appeal_draft], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Appeal_${formData.payer}_${formData.drug}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mt-12 mb-12 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-[var(--fg)] mb-4">
          Appeal Terminal
        </h1>
        <p className="font-mono text-[var(--accent)] text-sm uppercase tracking-widest max-w-xl mx-auto">
          AI-driven denial rebuttal engine
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        <div className="fade-up fade-up-delay-1">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># TARGET_DRUG</label>
              <input
                type="text"
                className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded py-3 px-4 text-[var(--fg)] font-mono text-sm focus:outline-none focus:border-[var(--accent)] transition-colors uppercase"
                placeholder="Pembrolizumab / Keytruda"
                value={formData.drug}
                onChange={(e) => setFormData({ ...formData, drug: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># TARGET_PAYER</label>
              <input
                type="text"
                className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded py-3 px-4 text-[var(--fg)] font-mono text-sm focus:outline-none focus:border-[var(--accent)] transition-colors uppercase"
                placeholder="Cigna / UHC"
                value={formData.payer}
                onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># DENIAL_REASON</label>
              <textarea
                rows={3}
                className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded py-3 px-4 text-[var(--fg)] font-mono text-xs focus:outline-none focus:border-[var(--accent)] transition-colors uppercase"
                placeholder="Prior authorization denial code / text..."
                value={formData.denialReason}
                onChange={(e) => setFormData({ ...formData, denialReason: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase"># ADDITIONAL_CONTEXT (OPTIONAL)</label>
              <textarea
                rows={3}
                className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded py-3 px-4 text-[var(--fg)] font-mono text-xs focus:outline-none focus:border-[var(--accent)] transition-colors uppercase"
                placeholder="Patient history, alternative failures..."
                value={formData.extraContext}
                onChange={(e) => setFormData({ ...formData, extraContext: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent-2)] text-[var(--bg)] font-mono text-xs uppercase tracking-[0.2em] py-4 rounded transition-all shadow-lg shadow-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
            >
              {loading ? <Spinner label="MAPPING CITATIONS..." size={16} /> : 'Execute Generation Sequence'}
            </button>
          </form>
        </div>

        <div className="fade-up fade-up-delay-2">
          {loading ? (
            <div className="h-full border border-[var(--border)] bg-[var(--bg-2)] rounded flex flex-col items-center justify-center p-12 text-center">
              <Spinner label="RAG RETRIEVAL IN PROGRESS..." />
              <p className="mt-8 font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">Searching relevant policy chunks for rebuttal construction</p>
            </div>
          ) : result?.appeal_draft ? (
            <div className="h-full flex flex-col border border-[var(--accent)] bg-[var(--bg-2)] rounded overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between p-4 bg-[var(--bg)] border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--accent)]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg)]">REBUTTAL_DRAFT.txt</span>
                </div>
                <button onClick={handleDownload} className="text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 p-6 font-mono text-[13px] text-[var(--fg)] leading-relaxed overflow-y-auto max-h-[500px] whitespace-pre-wrap select-text selection:bg-[var(--accent)] selection:text-[var(--bg)]">
                {result.appeal_draft}
              </div>
              {result.citations && result.citations.length > 0 && (
                <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)]">
                  <span className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest block mb-2 border-b border-[var(--border)] pb-1">CITATIONS_RESOLVED</span>
                  <div className="flex flex-wrap gap-2">
                    {result.citations.map((c, i) => (
                      <span key={i} className="text-[9px] font-mono bg-[var(--bg-2)] border border-[var(--border)] px-2 py-0.5 text-[var(--accent)] uppercase">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : result?.error ? (
            <div className="h-full border border-rose-500/20 bg-[var(--bg-2)] rounded flex flex-col items-center justify-center p-12 text-center animate-in fade-in">
              <AlertCircle className="h-8 w-8 text-rose-400 mb-4" />
              <p className="font-mono text-xs text-rose-400 uppercase tracking-widest">{result.error}</p>
            </div>
          ) : (
            <div className="h-full border border-[var(--border)] bg-[var(--bg-2)] rounded flex flex-col items-center justify-center p-12 text-center opacity-40">
              <FileText className="h-10 w-10 text-[var(--muted)] mb-6" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Standalone generation unit</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)] mt-2">Initialize parameters to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
