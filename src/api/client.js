import axios from 'axios';
import { mockPolicies, mockChanges } from '../mocks/mockData';

const MOCK_MODE = true;
// TODO Phase 2: add getAccessTokenSilently() to axios interceptor.

export async function searchPolicies(drugName) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const query = drugName.toLowerCase();
        const results = mockPolicies.filter(
          (p) =>
            p.drug_name.toLowerCase().includes(query) ||
            p.brand_name.toLowerCase().includes(query)
        );
        resolve(results);
      }, 600);
    });
  }

  const response = await axios.get(`/search?drug=${encodeURIComponent(drugName)}`);
  return response.data;
}

export async function queryNL(question) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          answer: 'Based on the policy criteria, coverage typically requires prior authorization and may involve step therapy depending on the indication. Clinical records supporting the diagnosis are standard baseline requirements.',
          sources: [
            { payer: 'UnitedHealthcare', drug: 'Keytruda', section: 'Prior Auth' },
            { payer: 'Cigna', drug: 'Dupixent', section: 'Step Therapy' },
          ],
        });
      }, 1200);
    });
  }

  const response = await axios.post('/query', { question });
  return response.data;
}

export async function ingestPDF(file) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          policy: mockPolicies[0],
          message: 'Policy extracted and stored (mock)'
        });
      }, 2500);
    });
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const query = drugName.toLowerCase();
        const policyA = mockPolicies.find(
          (p) => (p.drug_name.toLowerCase().includes(query) || p.brand_name.toLowerCase().includes(query)) && p.payer === payerA
        ) || null;
        const policyB = mockPolicies.find(
          (p) => (p.drug_name.toLowerCase().includes(query) || p.brand_name.toLowerCase().includes(query)) && p.payer === payerB
        ) || null;
        resolve({ policyA, policyB });
      }, 600);
    });
  }

  const response = await axios.get(
    `/compare?drug=${encodeURIComponent(drugName)}&payer_a=${encodeURIComponent(payerA)}&payer_b=${encodeURIComponent(payerB)}`
  );
  return response.data;
}

export async function getChanges(filters) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...mockChanges];
        if (filters.payer) {
          results = results.filter(c => c.payer === filters.payer);
        }
        if (filters.drug) {
          results = results.filter(c => c.drug === filters.drug);
        }
        if (filters.type) {
          results = results.filter(c => c.type === filters.type);
        }
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(results);
      }, 600);
    });
  }

  const queryParams = new URLSearchParams();
  if (filters.payer) queryParams.append('payer', filters.payer);
  if (filters.drug) queryParams.append('drug', filters.drug);
  if (filters.type) queryParams.append('type', filters.type);
  
  const response = await axios.get(`/changes?${queryParams.toString()}`);
  return response.data;
}


