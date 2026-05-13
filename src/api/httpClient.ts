import axios from 'axios';
import { toast } from 'sonner';
import { getAuthHeader, clearAuth } from './authHeader';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string || 'http://localhost',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(import.meta.env.VITE_NGROK_SKIP_WARNING === 'true'
      ? { 'ngrok-skip-browser-warning': 'true' }
      : {}),
  },
});

httpClient.interceptors.request.use(async (config) => {
  const skipAuthPaths = ['/health', '/users/sign-up/telegram', '/faqs'];
  const shouldSkip = skipAuthPaths.some(path => config.url?.includes(path));

  if (!shouldSkip) {
    const header = getAuthHeader();
    if (header) {
      config.headers.Authorization = header;
    }
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      toast.error('Сессия истекла. Войдите заново.');
      window.location.href = '/welcome';
    } else if (!error.response) {
      const failedUrl = error.config?.url || 'unknown';
      console.error('Network error to:', failedUrl, '| baseURL:', httpClient.defaults.baseURL);
      toast.error(`Ошибка сети: ${failedUrl}`);
    } else if (error.response?.status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже.');
    }
    return Promise.reject(error);
  }
);

export default httpClient;
