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
      setErrorMsg('Please upload a valid PDF document.');
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
      {/* Page Header */}
      <div className="text-center mb-8 fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Upload Policy PDF
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Upload a payer policy document. Our AI will instantly extract all 12 structured fields including PA criteria, step therapy, and indications.
        </p>
      </div>

      {status !== 'success' && status !== 'processing' && status !== 'error' && (
        <div className="max-w-xl mx-auto fade-up fade-up-delay-1">
          {/* Drop Zone */}
          <div
            className={`relative flex flex-col items-center justify-center p-12 mt-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              dragging
                ? 'border-brand-400 bg-brand-500/10'
                : 'border-surface-4 bg-surface-1 hover:border-brand-500/50 hover:bg-surface-2'
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
                <FileIcon className="h-10 w-10 text-brand-400 mb-3" />
                <span className="text-slate-200 font-medium mb-1">{file.name}</span>
                <span className="text-slate-400 text-sm">{formatSize(file.size)}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-slate-200 font-medium mb-1">Drop a policy PDF here</p>
                <p className="text-slate-400 text-sm">or click to browse</p>
              </div>
            )}
          </div>

          {/* Inline Validation Error */}
          {errorMsg && (
            <div className="flex items-center gap-2 mt-4 text-rose-400 text-sm font-medium p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Upload Button */}
          {file && !errorMsg && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={handleUpload}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all"
              >
                Extract policy with AI
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing State */}
      {status === 'processing' && (
        <div className="max-w-md mx-auto py-12 flex flex-col items-center fade-up">
          <Spinner size={40} />
          <h2 className="text-xl font-bold text-white mt-6 mb-2">Parsing policy with AI…</h2>
          <p className="text-slate-400 text-sm mb-10 text-center">
            Extracting all 12 structured fields using Gemini 2.5 Flash
          </p>

          <div className="w-full space-y-3">
            {['Drug name', 'HCPCS code', 'Coverage status', 'PA criteria', 'Step therapy', 'Site of care'].map((field) => (
              <div key={field} className="flex items-center justify-between p-4 border border-surface-border rounded-lg shimmer">
                <span className="text-sm font-medium text-slate-200 relative z-10 drop-shadow-sm">{field}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Server State */}
      {status === 'error' && (
        <div className="max-w-md mx-auto mt-8 bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center fade-up">
          <div className="mx-auto w-12 h-12 flex items-center justify-center bg-rose-500/20 rounded-full mb-4">
            <XCircle className="h-6 w-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Extraction failed</h3>
          <p className="text-slate-400 text-sm mb-6">
            We couldn't extract the data. The PDF may be a flat scanned image or heavily encrypted.
          </p>
          <button
            onClick={reset}
            className="text-brand-400 font-medium hover:text-brand-300 transition-colors"
          >
            Try another file
          </button>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && result && (
        <div className="max-w-3xl mx-auto fade-up">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/20 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Policy extracted successfully</h2>
          </div>

          <div className="bg-surface-2 border border-surface-border rounded-xl p-5 sm:p-6 mb-6">
            {/* Success Card Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
               <div>
                 <div className="text-xs font-medium text-brand-400 mb-1">{result.payer}</div>
                 <div className="flex items-center gap-2">
                   <h3 className="font-display text-2xl font-bold text-white">{result.drug_name}</h3>
                   <span className="text-slate-400 font-medium">{result.brand_name}</span>
                   <HcpcsPill code={result.hcpcs_code} />
                 </div>
               </div>
               <CoverageBadge status={result.coverage_status} />
            </div>

            {/* 2-Column Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-surface-1 rounded-lg border border-surface-border">
              <div>
                <span className="text-slate-400 block text-xs mb-1">PA Required</span>
                <span className="font-medium text-slate-200 text-sm">{result.pa_required ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-1">Step Therapy</span>
                <span className="font-medium text-slate-200 text-sm">{result.step_therapy_required ? 'Required' : 'Not Required'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-1">Effective Date</span>
                <span className="font-medium text-slate-200 text-sm">{new Date(result.effective_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-1">Site of Care</span>
                <div className="mt-1">
                  {result.site_of_care && result.site_of_care.length > 0 ? (
                    <SiteOfCareTags sites={result.site_of_care} />
                  ) : (
                    <span className="font-medium text-slate-200 text-sm">Not specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* PA Criteria */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-3">PA Criteria</h4>
              {result.pa_criteria && result.pa_criteria.length > 0 ? (
                <ul className="space-y-2">
                  {result.pa_criteria.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-brand-500 font-bold mt-[-2px]">&rarr;</span>
                      <span className="leading-tight">{crit}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">None specified.</p>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={reset}
              className="text-sm text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>&larr;</span> Upload another policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
