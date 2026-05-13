import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import { setTelegramId, refreshAuthHeader, clearTelegramId, getCachedTelegramId } from '../api/authHeader';
import type { User, TutorProfile } from '../types';

const useMock = import.meta.env.VITE_USE_MOCKS === 'true';

interface AppContextType {
  authUser: User | null;
  loginAs: (role: 'tutor' | 'student') => Promise<void>;
  loginWithTelegramId: (telegramId: string) => Promise<void>;
  tutorProfile: TutorProfile | null;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);

  // ── On mount: auto-login if session exists ──
  useEffect(() => {
    if (useMock) {
      // Mock mode: auto-load the default mock user
      apiClient.getMe().then(user => {
        setAuthUser(user);
        if (user.role === 'tutor') {
          apiClient.getTutorProfile(user.id).then(setTutorProfile);
        }
      });
    } else {
      // Real mode: try to restore session from localStorage
      const storedTelegramId = localStorage.getItem('telegram_id');
      if (storedTelegramId) {
        setTelegramId(storedTelegramId);
        refreshAuthHeader()
          .then(() => apiClient.getMe())
          .then((user) => {
            setAuthUser(user);
            if (user.role === 'tutor') {
              // Hybrid: tutor profile may come from mock store
              apiClient.getTutorProfile(user.id)
                .then(setTutorProfile)
                .catch(() => {
                  // Gracefully handle missing profile in hybrid mode
                  setTutorProfile(null);
                });
            } else {
              setTutorProfile(null);
            }
          })
          .catch((error: unknown) => {
            // 401 is handled by httpClient interceptor (redirects to /welcome)
            // For other errors, clear the stored session
            const status = (error as { response?: { status?: number } }).response?.status;
            if (status !== 401) {
              clearTelegramId();
            }
          });
      }
    }
  }, []);

  // ── Mock-mode only: login as a demo tutor or student ──
  const loginAs = useCallback(async (role: 'tutor' | 'student') => {
    if (!useMock) {
      throw new Error('loginAs is only available in mock mode. Use loginWithTelegramId instead.');
    }
    const userId = role === 'tutor' ? 'u1' : 'u2';
    const user = await apiClient.getUser(userId);
    setAuthUser(user);
    if (role === 'tutor') {
      const profile = await apiClient.getTutorProfile(userId);
      setTutorProfile(profile);
    } else {
      setTutorProfile(null);
    }
  }, []);

  // ── Real-mode only: authenticate with Telegram ID ──
  const loginWithTelegramId = useCallback(async (telegramId: string) => {
    if (useMock) {
      throw new Error('loginWithTelegramId is only available in real mode. Use loginAs instead.');
    }

    // Validate: telegram_id should be numeric
    const numericId = parseInt(telegramId, 10);
    if (isNaN(numericId)) {
      toast.error('Telegram ID должен быть числом');
      throw new Error('Invalid telegram_id: must be numeric');
    }

    setTelegramId(telegramId);
    await refreshAuthHeader();

    try {
      const user = await apiClient.getMe();
      setAuthUser(user);
      if (user.role === 'tutor') {
        apiClient.getTutorProfile(user.id)
          .then(setTutorProfile)
          .catch(() => {
            setTutorProfile(null);
          });
      } else {
        setTutorProfile(null);
      }
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        // User not registered yet — sign up automatically
        try {
          const newUser = await apiClient.signUpTelegram({ telegram_id: telegramId, role: 'tutor' });
          setAuthUser(newUser);
          setTutorProfile(null);
          toast.success('Аккаунт создан!');
        } catch (signUpErr: unknown) {
          clearTelegramId();
          toast.error('Не удалось создать аккаунт. Попробуйте позже.');
          throw signUpErr;
        }
      } else {
        clearTelegramId();
        if (status !== 401) {
          toast.error('Ошибка входа. Проверьте Telegram ID.');
        }
        throw error;
      }
    }
  }, []);

  // ── Logout: clear auth state and redirect ──
  const logout = useCallback(() => {
    clearTelegramId();
    setAuthUser(null);
    setTutorProfile(null);
  }, []);

  // Handle deep link invitations (simulated via ?start=invite_{tutor_id})
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startParam = params.get('start');
    if (startParam && startParam.startsWith('invite_') && authUser) {
      const tutorId = startParam.replace('invite_', '');
      if (authUser.role === 'student') {
        apiClient.acceptInvitation(tutorId, authUser.id).then(() => {
          toast('Приглашение принято!');
          // Clear the URL param so it doesn't re-trigger on refresh
          const url = new URL(window.location.href);
          url.searchParams.delete('start');
          window.history.replaceState({}, '', url.toString());
        }).catch((err) => {
          console.error('Failed to accept invitation', err);
          toast('Не удалось принять приглашение');
        });
      }
    }
  }, [authUser]);

  return (
    <AppContext.Provider value={{ authUser, loginAs, loginWithTelegramId, tutorProfile, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
