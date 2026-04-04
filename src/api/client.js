import axios from 'axios';
import { mockPolicies } from '../mocks/mockData';

const MOCK_MODE = true;

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
