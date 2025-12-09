import axios from 'axios';

// Mengambil URL Backend dari file .env.local
const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// INTERCEPTOR: Otomatis sisipkan Token ke setiap Request
api.interceptors.request.use(config => {
    // Ambil token dari browser storage
    const token = localStorage.getItem('token');
    
    if (token) {
        // Jika token ada, tambahkan ke header Authorization: Bearer <token>
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;