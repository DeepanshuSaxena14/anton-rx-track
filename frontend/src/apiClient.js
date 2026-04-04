/**
 * Standard API Client
 * Determines base URL based on environment parameters natively to prevent deploy breakages.
 */

const getBaseUrl = () => {
    // If running in Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    // If running in standard Create React App or Node
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
    // Fallback for local testing
    return 'http://localhost:8000';
  };
  
  export const API_BASE_URL = getBaseUrl();
  
  export const apiClient = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
  
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
  
    const response = await fetch(url, config);
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Request Failed with status ${response.status}`);
    }
  
    return response.json();
  };
  
