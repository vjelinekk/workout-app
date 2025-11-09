import { TIMEOUT_MS } from '@/constants/axios';
import { storage } from '@/utils/storage';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

export const api = axios.create({
    baseURL: API_URL,
    timeout: TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);