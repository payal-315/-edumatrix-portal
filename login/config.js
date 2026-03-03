// Configuration for API endpoints
// Update this to your deployed backend URL
const API_CONFIG = {
  // For local development, use localhost
  // For production, update this to your deployed backend URL
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://edumatrix-bu32.onrender.com'
};
