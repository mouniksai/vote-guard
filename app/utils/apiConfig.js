// Centralized API configuration
// In development: uses http://localhost:5001
// In production (HF Spaces): uses the same origin (reverse proxy handles routing)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default API_BASE_URL;
