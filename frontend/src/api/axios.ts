import axios from 'axios';

// 1. Detectamos si estamos en producción para evitar el fallback a localhost por error
const isProduction = import.meta.env.PROD;
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Si estamos en producción y no hay URL definida, lanzamos una advertencia o usamos un string vacío
// para evitar el error de 'loopback' (localhost) en el navegador del cliente.
const API_URL = VITE_API_URL || (isProduction ? '' : 'http://localhost:3005/api');

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde con 401 (No autorizado)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Solo redirigir si no estamos ya en la página de login para evitar bucles
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;