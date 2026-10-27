
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://civicpulse-0w1p.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});


// Auto-attach JWT Bearer token to all outgoing requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('civicpulse_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global response interceptor: Auto-logout on 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAuthRoute = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
            localStorage.removeItem('civicpulse_token');
            localStorage.removeItem('civicpulse_user');
            if (!isAuthRoute) {
                window.location.href = '/login?expired=1';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
