import axios from 'axios';
export default axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
export const errMsg = (e) => e.response?.data?.message || e.message;