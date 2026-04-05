import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, XCircle, FileIcon, AlertCircle } from 'lucide-react';
import { ingestPDF } from '../api/client';
import { Spinner, CoverageBadge, HcpcsPill, SiteOfCareTags } from '../components/ui';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setDragging(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('SYS_ERR: Invalid payload type. Require application/pdf.');
      setFile(null);
      return;
    }
    setErrorMsg(null);
    setFile(selectedFile);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const data = await ingestPDF(file);
      setResult(data.policy);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const formatSize = (bytes) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12 fade-up">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-[var(--fg)] mb-4">
          Data Ingestion
        </h1>
        <p className="font-mono text-[var(--accent)] text-sm uppercase tracking-widest max-w-xl mx-auto">
          AI-driven matrix extraction core
        </p>
      </div>

      {status !== 'success' && status !== 'processing' && status !== 'error' && (
        <div className="max-w-xl mx-auto fade-up fade-up-delay-1">
          <div
            className={`relative flex flex-col items-center justify-center p-16 mt-4 border border-dashed rounded-lg cursor-pointer transition-colors ${
              dragging
                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                : 'border-[var(--border)] bg-[var(--bg-2)] hover:border-[var(--accent)]'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
            
            {file ? (
              <div className="flex flex-col items-center text-center">
                <FileIcon className="h-10 w-10 text-[var(--accent)] mb-4" />
                <span className="text-[var(--fg)] font-mono text-sm tracking-wide mb-2 uppercase">{file.name}</span>
                <span className="font-mono text-xs text-[var(--muted)] tracking-widest">{formatSize(file.size)}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <UploadCloud className="h-10 w-10 text-[var(--muted)] mb-4 group-hover:text-[var(--accent)] transition-colors" />
                <p className="text-[var(--fg)] font-mono text-sm tracking-widest mb-2 uppercase">Mount PDF Payload</p>
                <p className="font-mono text-xs text-[var(--muted)] tracking-widest uppercase">Click or drop file</p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-3 mt-6 text-rose-400 text-xs font-mono uppercase tracking-widest p-4 bg-[var(--bg-2)] border border-[color-mix(in_srgb,transparent_80%,#f43f5e)] rounded">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {file && !errorMsg && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
              <button
                onClick={handleUpload}
                className="w-full bg-[var(--accent)] hover:bg-[var(--accent-2)] text-[var(--bg)] font-mono text-sm uppercase tracking-widest py-4 px-4 transition-all rounded shadow-md"
              >
                Extract Structured Matrix
              </button>
            </div>
          )}
        </div>
      )}

      {status === 'processing' && (
        <div className="max-w-md mx-auto py-16 flex flex-col items-center fade-up font-mono">
          <Spinner label="Parsing Payload..." size={40} />
          <p className="text-[var(--muted)] text-xs mb-12 text-center uppercase tracking-widest mt-8">
            Routing through Gemini 2.5 Flash
          </p>

          <div className="w-full space-y-4">
            {['Payer Hash', 'Drug Identity', 'Coverage Vector', 'PA Matrix', 'Step Constraints', 'Care Location'].map((field) => (
              <div key={field} className="flex items-center justify-between p-4 border border-[var(--border)] bg-[var(--bg-2)] rounded shimmer overflow-hidden relative">
                <span className="text-[10px] font-mono tracking-widest text-[var(--fg)] uppercase relative z-10">{field}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-md mx-auto mt-12 bg-[var(--bg-2)] border border-[color-mix(in_srgb,transparent_80%,#f43f5e)] p-8 text-center fade-up rounded-lg">
          <div className="mx-auto w-12 h-12 flex items-center justify-center bg-[color-mix(in_srgb,transparent_90%,#f43f5e)] mb-6 rounded-full">
            <XCircle className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-mono text-rose-400 uppercase tracking-widest font-bold mb-3">Extraction Aborted</h3>
          <p className="text-[var(--muted)] text-xs font-mono uppercase tracking-widest leading-relaxed mb-8">
            Payload unrecognized. Unstructured scan failure parsing PDF blob.
          </p>
          <button
            onClick={reset}
            className="text-rose-400 text-xs font-mono uppercase tracking-widest hover:text-rose-300 transition-colors border-b border-rose-400/50 pb-1"
          >
            Remount Payload
          </button>
        </div>
      )}

      {status === 'success' && result && (
        <div className="max-w-3xl mx-auto fade-up">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-12 h-12 flex items-center justify-center bg-[var(--accent)] mb-6 rounded-full text-[var(--bg)] shadow-[0_0_15px_var(--accent)]">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-mono text-[var(--accent)] tracking-widest uppercase font-semibold">Matrix Extracted</h2>
          </div>

          <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-xl p-6 sm:p-8 mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
               <div>
                 <div className="text-[10px] font-mono font-bold text-[var(--accent)] tracking-widest uppercase mb-2">[{result.payer}]</div>
                 <div className="flex items-center gap-3">
                   <h3 className="font-display text-3xl font-bold text-[var(--fg)] tracking-tight leading-none m-0">{result.drug_name}</h3>
                   <span className="font-mono text-xs text-[var(--muted)] uppercase tracking-widest">{result.brand_name}</span>
                   <HcpcsPill code={result.hcpcs_code} />
                 </div>
               </div>
               <CoverageBadge status={result.coverage_status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--border)] border border-[var(--border)] rounded overflow-hidden mb-8">
              <div className="bg-[var(--bg)] p-5">
                <span className="font-mono text-[10px] tracking-widest text-[var(--muted)] block uppercase mb-1">PA_REQUIRED</span>
                <span className={`font-mono text-xs font-bold tracking-widest uppercase ${result.pa_required ? 'text-rose-400' : 'text-[var(--fg)]'}`}>{result.pa_required ? 'TRUE' : 'FALSE'}</span>
              </div>
              <div className="bg-[var(--bg)] p-5">
                <span className="font-mono text-[10px] tracking-widest text-[var(--muted)] block uppercase mb-1">STEP_THERAPY</span>
                <span className={`font-mono text-xs font-bold tracking-widest uppercase ${result.step_therapy_required ? 'text-rose-400' : 'text-[var(--fg)]'}`}>{result.step_therapy_required ? 'REQUIRED' : 'NULL'}</span>
              </div>
              <div className="bg-[var(--bg)] p-5">
                <span className="font-mono text-[10px] tracking-widest text-[var(--muted)] block uppercase mb-1">START_DATE</span>
                <span className="font-mono text-xs font-bold tracking-widest uppercase text-[var(--fg)]">{new Date(result.effective_date).toISOString().split('T')[0]}</span>
              </div>
              <div className="bg-[var(--bg)] p-5">
                <span className="font-mono text-[10px] tracking-widest text-[var(--muted)] block uppercase mb-2">SITE_OF_CARE_MATRIX</span>
                <div>
                  {result.site_of_care && result.site_of_care.length > 0 ? (
                    <SiteOfCareTags sites={result.site_of_care} />
                  ) : (
                    <span className="font-mono text-xs font-bold tracking-widest uppercase text-[var(--muted)]">NULL</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-mono text-[10px] tracking-widest text-[var(--accent)] uppercase mb-3"># PA_CRITERIA</h4>
              {result.pa_criteria && result.pa_criteria.length > 0 ? (
                <ul className="space-y-3">
                  {result.pa_criteria.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-3 font-mono text-xs text-[color-mix(in_srgb,var(--fg)_80%,transparent)] leading-relaxed uppercase">
                      <span className="text-[var(--accent)] font-bold">{'>'}</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-xs text-[var(--muted)] uppercase">NULL</p>
              )}
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={reset}
              className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] hover:text-[var(--fg)] transition-colors bg-transparent border border-[var(--border)] px-4 py-3 hover:border-[var(--fg)] rounded"
            >
              [ REMOUNT NEW PAYLOAD ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
