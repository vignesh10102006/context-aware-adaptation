import axios from 'axios';

// Since the dev server and Express run locally, we target port 5000
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSolutions = () => api.get('/solutions');
export const getSolutionById = (id) => api.get(`/solutions/${id}`);
export const submitAnalysis = (problem, context) => api.post('/analyze', { problem, context });
export const submitFeedback = (feedback) => api.post('/feedback', feedback);

export default {
  getSolutions,
  getSolutionById,
  submitAnalysis,
  submitFeedback,
};
