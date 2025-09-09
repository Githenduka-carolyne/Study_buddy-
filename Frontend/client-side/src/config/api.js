const isProduction = import.meta.env.PROD;

export const API_BASE_URL = isProduction
  ? '/api'  // Use relative path for production/Vercel
  : 'http://localhost:5001/api';  // Use localhost for development
