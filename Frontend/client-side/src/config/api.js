const isProduction = import.meta.env.PROD;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const API_BASE_URL = backendUrl
  ? `${backendUrl}/api`  // Use custom backend URL if provided
  : isProduction
    ? '/api'  // Use relative path for same-domain deployment
    : 'http://localhost:5001/api';  // Use localhost for development
