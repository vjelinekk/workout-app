import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Or throw error if missing in production:
if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
}