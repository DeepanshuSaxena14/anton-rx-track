import axios from 'axios';

// Production API Configuration
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MOCK_MODE = false;

// TODO Phase 2: add getAccessTokenSilently() to axios interceptor.

export async function searchPolicies(drugName) {
  if (MOCK_MODE) {
    // ... mock logic omitted for brevity as it's disabled
    return [];
  }

  const response = await axios.get(`/search?drug_name=${encodeURIComponent(drugName)}`);
  return response.data;
}

export async function queryNL(question) {
  if (MOCK_MODE) {
    return { answer: 'Mock answer', sources: [] };
  }

  const response = await axios.post('/query', { question });
  return response.data;
}

export async function ingestPDF(file) {
  if (MOCK_MODE) {
    return { success: true, policy: {}, message: 'Mock ingest' };
  }

  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function comparePolicies(drugName, payerA, payerB) {
  if (MOCK_MODE) {
    return { policyA: null, policyB: null };
  }

  // Backend /compare uses 'payers' list query param
  const response = await axios.get(
    `/compare?drug_name=${encodeURIComponent(drugName)}&payers=${encodeURIComponent(payerA)}&payers=${encodeURIComponent(payerB)}`
  );
  return response.data;
}

export async function getChanges(filters) {
  if (MOCK_MODE) {
    return [];
  }

  const queryParams = new URLSearchParams();
  if (filters.payer) queryParams.append('payer', filters.payer);
  // Backend uses 'drug_name' for changes
  if (filters.drug) queryParams.append('drug_name', filters.drug);

  const response = await axios.get(`/changes?${queryParams.toString()}`);
  return response.data;
}

export async function getPayerRankings(drugName) {
  const response = await axios.get(`/scores?drug_name=${encodeURIComponent(drugName)}`);
  return response.data;
}

export async function generateAppeal(drug, payer, denialReason, extraContext = '') {
  const response = await axios.post('/appeal', {
    drug,
    payer,
    denial_reason: denialReason,
    extra_context: extraContext
  });
  return response.data;
}
