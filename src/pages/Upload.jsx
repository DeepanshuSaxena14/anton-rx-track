import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, XCircle, FileIcon, AlertCircle } from 'lucide-react';
import { ingestPDF } from '../api/client';
import { Spinner, CoverageBadge, HcpcsPill, SiteOfCareTags } from '../components/ui';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [extractedCount, setExtractedCount] = useState(0);
  const [documentSummary, setDocumentSummary] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    setExtractedCount(0);
    setDocumentSummary(null);
    setDragging(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setErrorMsg('Invalid file type. Please upload a PDF document.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum allowed size is 10 MB.');
      setFile(null);
      return;
    }
    setErrorMsg(null);
    setFile(selectedFile);
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const data = await ingestPDF(file);
      if (data.status === 'error') {
        setErrorMsg(data.errors?.[0] || data.message || 'Extraction failed.');
        setStatus('error');
        return;
      }
      // policies_extracted is a COUNT (number) from the API, not an array of objects
      const count = typeof data.policies_extracted === 'number'
        ? data.policies_extracted
        : (Array.isArray(data.policies_extracted) ? data.policies_extracted.length : 0);
      const policyObj = Array.isArray(data.policies_extracted)
        ? data.policies_extracted[0]
        : (data.policy || null);
      setExtractedCount(count);
      setResult(policyObj);
      setDocumentSummary(data.document_summary || null);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while processing this file.');
      setStatus('error');
    }
  };

  const formatSize = (bytes) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--fg-3)',
    display: 'block',
    marginBottom: '0.3rem',
  };

  const valueStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--fg)',
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--fg)', letterSpacing: '-0.02em', margin: '0 0 0.6rem' }}>
          Policy Ingestion
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--fg-3)', margin: 0 }}>
          Upload a payer PDF and extract all 12 policy fields automatically
        </p>
      </div>

      {/* Upload zone */}
      {status !== 'success' && status !== 'processing' && (
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3.5rem 2rem',
              background: dragging ? 'var(--bg-3)' : 'var(--bg-2)',
              border: `2px dashed ${dragging ? 'var(--fg)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />

            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
                <FileIcon style={{ width: '2rem', height: '2rem', color: 'var(--fg-2)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--fg)' }}>
                  {file.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
                  {formatSize(file.size)} · PDF
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-3)', border: '1px solid var(--border-strong)', borderRadius: '0.75rem' }}>
                  <UploadCloud style={{ width: '1.3rem', height: '1.3rem', color: 'var(--fg-3)' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.9rem', color: 'var(--fg)', margin: '0 0 0.25rem' }}>
                    Drop a PDF here
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--fg-3)', margin: 0 }}>
                    or click to browse — up to 10 MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation error */}
          {errorMsg && status !== 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(143,42,42,0.05)', border: '1px solid rgba(143,42,42,0.18)', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle style={{ width: '0.9rem', height: '0.9rem', flexShrink: 0, color: 'var(--danger)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--danger)' }}>
                {errorMsg}
              </span>
            </div>
          )}

          {/* Upload button */}
          {file && !errorMsg && (
            <button
              onClick={handleUpload}
              style={{
                width: '100%',
                marginTop: '1.25rem',
                background: 'var(--fg)',
                color: 'var(--bg)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '0.9rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Extract Policy Data
            </button>
          )}
        </div>
      )}

      {/* Processing */}
      {status === 'processing' && (
        <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0' }}>
          <Spinner label="Extracting policy data..." size={36} />
          <div style={{ width: '100%', marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['Payer', 'Drug Identity', 'Coverage Status', 'PA Requirements', 'Step Therapy', 'Site of Care'].map((field) => (
              <div key={field} className="shimmer" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                  {field}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ maxWidth: '420px', margin: '0 auto', background: 'var(--bg-2)', border: '1px solid rgba(143,42,42,0.2)', borderRadius: 'var(--radius-card)', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(143,42,42,0.07)', border: '1px solid rgba(143,42,42,0.2)', borderRadius: '50%', margin: '0 auto 1.25rem' }}>
            <XCircle style={{ width: '1.3rem', height: '1.3rem', color: 'var(--danger)' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1rem', color: 'var(--danger)', margin: '0 0 0.5rem' }}>
            Extraction failed
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-3)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            {errorMsg || 'Unable to extract data from this PDF. Please check the file and try again.'}
          </p>
          <button
            onClick={reset}
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.85rem', color: 'var(--fg)', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: '0.55rem 1.5rem', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Success — show banner + summary always; show fields card only if we have a policy object */}
      {status === 'success' && (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {/* Success banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            background: 'rgba(26,122,74,0.06)',
            border: '1px solid rgba(26,122,74,0.2)',
            borderRadius: 'var(--radius-card)',
            marginBottom: '1.75rem',
          }}>
            <div style={{ width: '2.25rem', height: '2.25rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.25)', borderRadius: '50%' }}>
              <CheckCircle style={{ width: '1.1rem', height: '1.1rem', color: 'var(--success)' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--success)', margin: '0 0 0.15rem' }}>
                Document uploaded &amp; processed successfully
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: 0 }}>
                {file?.name} &nbsp;·&nbsp; {extractedCount} {extractedCount === 1 ? 'policy' : 'policies'} extracted
              </p>
            </div>
          </div>

          {/* Extracted fields card — only shown when API returns a single policy object */}
          {result && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div style={labelStyle}>{result.payer}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.3rem', color: 'var(--fg)', margin: 0 }}>{result.drug_name}</h3>
                    {result.brand_name && <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--fg-3)' }}>{result.brand_name}</span>}
                    <HcpcsPill code={result.hcpcs_code} />
                  </div>
                </div>
                <CoverageBadge status={result.coverage_status} />
              </div>

              {/* Fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid var(--border)' }}>
                {[
                  { label: 'PA Required', value: result.pa_required ? 'Yes' : 'No', danger: result.pa_required },
                  { label: 'Step Therapy', value: result.step_therapy_required ? 'Required' : 'No', danger: result.step_therapy_required },
                  { label: 'Effective Date', value: result.effective_date ? new Date(result.effective_date).toISOString().split('T')[0] : '—' },
                  { label: 'Site of Care', custom: <SiteOfCareTags sites={result.site_of_care} /> },
                ].map(({ label, value, danger, custom }) => (
                  <div key={label} style={{ padding: '1rem 1.25rem', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <span style={labelStyle}>{label}</span>
                    {custom || <span style={{ ...valueStyle, color: danger ? 'var(--danger)' : 'var(--fg)' }}>{value}</span>}
                  </div>
                ))}
              </div>

              {/* PA Criteria */}
              {result.pa_criteria && result.pa_criteria.length > 0 && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={labelStyle}>PA Criteria</span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {result.pa_criteria.map((c, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-2)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}>›</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Document Summary Card */}
          {documentSummary && (
            <div style={{
              marginTop: '1.25rem',
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-3)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-3)',
                }}>AI Document Summary</span>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-3)',
                  opacity: 0.6,
                }}>Auto-generated</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                color: 'var(--fg-2)',
                lineHeight: 1.7,
                margin: 0,
                padding: '1.25rem 1.5rem',
              }}>
                {documentSummary}
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={reset}
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--fg-3)', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: '0.55rem 1.5rem', cursor: 'pointer' }}
            >
              Upload another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
