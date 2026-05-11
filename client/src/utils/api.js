import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ccms-backend-hsj9.onrender.com/api', // ✅ Render URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;