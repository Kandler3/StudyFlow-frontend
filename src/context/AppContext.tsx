import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../api/client';
import {
  isInTelegramContext,
  getInitData,
  clearAuth,
  setDevInitData,
  parseTelegramId,
  parseTelegramUserNames,
} from '../api/authHeader';
import type { User, TutorProfile } from '../types';

const useMock = import.meta.env.VITE_USE_MOCKS === 'true';

export interface TelegramUserInfo {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface AppContextType {
  authUser: User | null;
  loginAs: (role: 'tutor' | 'student') => Promise<void>;
  loginWithTelegramId: (telegramId: string) => Promise<void>;
  tutorProfile: TutorProfile | null;
  logout: () => void;
  // New TMA auth states:
  isInitializing: boolean;
  needsRegistration: boolean;
  needsTelegram: boolean;
  telegramUserInfo: TelegramUserInfo | null;
  completeRegistration: (role: 'tutor' | 'student') => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [needsTelegram, setNeedsTelegram] = useState(false);
  const [telegramUserInfo, setTelegramUserInfo] = useState<TelegramUserInfo | null>(null);

  // ── Shared helper: set authUser and fetch tutor profile if needed ──
  const handleAuthSuccess = useCallback((user: User) => {
    setAuthUser(user);
    setNeedsRegistration(false);
    setTelegramUserInfo(null);
    setNeedsTelegram(false);
    if (user.role === 'tutor') {
      apiClient.getTutorProfile(user.id)
        .then(setTutorProfile)
        .catch(() => setTutorProfile(null));
    } else {
      setTutorProfile(null);
    }
  }, []);

  // ── On mount: initialise auth ──
  useEffect(() => {
    if (useMock) {
      // Mock mode: auto-load the default mock user
      setIsInitializing(true);
      apiClient.getMe().then(user => {
        handleAuthSuccess(user);
      }).finally(() => {
        setIsInitializing(false);
      });
    } else {
      // Real mode: check for initData (Telegram context or dev fallback)
      const initData = getInitData();
      if (initData) {
        // We have initData — try to authenticate
        apiClient.getMe()
          .then((user) => {
            handleAuthSuccess(user);
          })
          .catch((error: unknown) => {
            const status = (error as { response?: { status?: number } }).response?.status;
            if (status === 404) {
              // User not registered — store Telegram user info for registration
              const userInfo = parseTelegramUserNames(initData);
              const telegramId = parseTelegramId(initData);
              if (telegramId) {
                setTelegramUserInfo({
                  id: telegramId,
                  ...userInfo,
                });
                setNeedsRegistration(true);
              }
              // If we can't even parse an id, fall through to needsTelegram
            }
            // 401 is handled by httpClient interceptor (redirects to /welcome)
            // Other errors: stay on welcome page, no special action needed
          })
          .finally(() => {
            setIsInitializing(false);
          });
      } else {
        // Not in Telegram — show "Open in Telegram" message
        setIsInitializing(false);
        setNeedsTelegram(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mock-mode only: login as a demo tutor or student ──
  const loginAs = useCallback(async (role: 'tutor' | 'student') => {
    if (!useMock) {
      throw new Error('loginAs is only available in mock mode. Use loginWithTelegramId instead.');
    }
    const userId = role === 'tutor' ? 'u1' : 'u2';
    const user = await apiClient.getUser(userId);
    handleAuthSuccess(user);
    if (role === 'tutor') {
      const profile = await apiClient.getTutorProfile(userId);
      setTutorProfile(profile);
    } else {
      setTutorProfile(null);
    }
  }, [handleAuthSuccess]);

  // ── Complete registration: called from Welcome.tsx after role selection ──
  const completeRegistration = useCallback(async (role: 'tutor' | 'student') => {
    if (!telegramUserInfo) {
      throw new Error('No Telegram user info available for registration');
    }

    const newUser = await apiClient.signUpTelegram({
      telegram_id: telegramUserInfo.id,
      role,
      first_name: telegramUserInfo.first_name,
      last_name: telegramUserInfo.last_name,
      username: telegramUserInfo.username,
    });

    handleAuthSuccess(newUser);
    toast.success('Аккаунт создан!');
  }, [telegramUserInfo, handleAuthSuccess]);

  // ── Real-mode dev helper: authenticate with a raw Telegram ID ──
  const loginWithTelegramId = useCallback(async (telegramId: string) => {
    if (useMock) {
      throw new Error('loginWithTelegramId is only available in real mode. Use loginAs instead.');
    }

    const numericId = parseInt(telegramId, 10);
    if (isNaN(numericId)) {
      toast.error('Telegram ID должен быть числом');
      throw new Error('Invalid telegram_id: must be numeric');
    }

    // Construct a minimal dev initData
    const encodedUser = encodeURIComponent(JSON.stringify({ id: numericId }));
    const devInitData = `user=${encodedUser}&hash=dev`;
    setDevInitData(devInitData);

    // Try to fetch existing user
    try {
      const user = await apiClient.getMe();
      handleAuthSuccess(user);
      return;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;

      if (status === 404) {
        // User not registered — auto-register with default role for dev convenience
        try {
          const newUser = await apiClient.signUpTelegram({
            telegram_id: telegramId,
            role: 'tutor',
          });
          handleAuthSuccess(newUser);
          toast.success('Аккаунт создан!');
          return;
        } catch (signUpErr: unknown) {
          clearAuth();
          toast.error('Не удалось создать аккаунт. Попробуйте позже.');
          throw signUpErr;
        }
      }

      // 401 or other error
      clearAuth();
      if (status !== 401) {
        toast.error('Ошибка входа. Проверьте Telegram ID.');
      }
      throw error;
    }
  }, [handleAuthSuccess]);

  // ── Logout: clear auth state and redirect ──
  const logout = useCallback(() => {
    clearAuth();
    setAuthUser(null);
    setTutorProfile(null);
    setNeedsRegistration(false);
    setNeedsTelegram(false);
    setTelegramUserInfo(null);
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
    <AppContext.Provider
      value={{
        authUser,
        loginAs,
        loginWithTelegramId,
        tutorProfile,
        logout,
        isInitializing,
        needsRegistration,
        needsTelegram,
        telegramUserInfo,
        completeRegistration,
      }}
    >
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
