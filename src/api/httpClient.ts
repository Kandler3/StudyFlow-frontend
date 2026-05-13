import axios from 'axios';
import { toast } from 'sonner';
import { getCachedAuthHeader, refreshAuthHeader, getCachedTelegramId, clearTelegramId } from './authHeader';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string || 'http://localhost',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async (config) => {
  const skipAuthPaths = ['/health', '/users/sign-up/telegram'];
  const shouldSkip = skipAuthPaths.some(path => config.url?.includes(path));

  if (!shouldSkip) {
    const telegramId = getCachedTelegramId();
    if (telegramId) {
      let header = getCachedAuthHeader();
      if (!header) {
        header = await refreshAuthHeader();
      }
      config.headers.Authorization = header;
    }
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTelegramId();
      toast.error('Сессия истекла. Войдите заново.');
      window.location.href = '/welcome';
    } else if (!error.response) {
      toast.error('Ошибка сети. Проверьте подключение.');
    } else if (error.response?.status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже.');
    }
    return Promise.reject(error);
  }
);

export default httpClient;
