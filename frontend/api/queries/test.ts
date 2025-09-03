import { api } from "../axios";

export const TEST_QUERY_KEY = 'test';

export const fetchTestData = async () => {
    const { data } = await api.get('/');
    return data;
};