import React, { useState } from 'react';

const AppealPage = () => {
  const [formData, setFormData] = useState({
    drug: '',
    payer: '',
    denial_reason: '',
    extra_context: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Assuming FastAPI is running locally on port 8000 for the demo
      const res = await fetch('http://localhost:8000/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to generate appeal');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1>Prior Authorization Appeal Generator</h1>
      <p style={{ color: '#555' }}>
        Formulate an appeal for a medical benefit denial based on policy criteria and clinical guidelines.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Drug (Generic or Brand)</label>
          <input 
            type="text" 
            name="drug" 
            value={formData.drug} 
            onChange={handleInputChange} 
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Payer</label>
          <input 
            type="text" 
            name="payer" 
            value={formData.payer} 
            onChange={handleInputChange} 
            required 
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Denial Reason (e.g. Step Therapy Required, Clinical Criteria Not Met)</label>
          <textarea 
            name="denial_reason" 
            value={formData.denial_reason} 
            onChange={handleInputChange} 
            required 
            rows={3}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Extra Context (Patient History, Previous Therapies)</label>
          <textarea 
            name="extra_context" 
            value={formData.extra_context} 
            onChange={handleInputChange} 
            rows={4}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '0.75rem', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Generating Draft...' : 'Generate Appeal Letter'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fee', color: '#c00', border: '1px solid #fcc' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
          <h2>Generated Appeal Draft</h2>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: 'white', padding: '1rem', border: '1px solid #ccc' }}>
            {result.appeal_draft}
          </pre>
          
          <h3 style={{ marginTop: '1.5rem' }}>Supporting Citations</h3>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {result.citations.map((cite, idx) => (
              <li key={idx} style={{ color: '#0056b3' }}>{cite}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppealPage;
