import { API_BASE_URL } from '@env';
import axios from 'axios';

export const api = axios.create({
  baseURL: API_BASE_URL,
});
