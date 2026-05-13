import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, ClipboardList, CreditCard, Settings,
  ArrowRight, BookOpen, LogIn, Loader2, Smartphone,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useApp } from '../context/AppContext';

const useMock = import.meta.env.VITE_USE_MOCKS === 'true';

export function Welcome() {
  const navigate = useNavigate();
  const {
    loginAs, loginWithTelegramId, authUser,
    isInitializing, needsRegistration, needsTelegram,
    telegramUserInfo, completeRegistration, lastAuthError,
  } = useApp();
  const [telegramId, setTelegramId] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showDevLogin, setShowDevLogin] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: 'Расписание',
      description: 'Планируйте и управляйте занятиями',
    },
    {
      icon: ClipboardList,
      title: 'Задания',
      description: 'Создавайте и отслеживайте домашние задания',
    },
    {
      icon: CreditCard,
      title: 'Оплаты',
      description: 'Работа с чеками и подтверждение оплат',
    },
    {
      icon: Settings,
      title: 'Настройки',
      description: 'Персонализируйте приложение под себя',
    },
  ];

  // ── Mock-mode: quick start as tutor ──
  const handleStart = async () => {
    await loginAs('tutor');
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/schedule');
  };

  // ── Real-mode dev helper: login with telegram ID ──
  const handleTelegramLogin = async () => {
    const trimmed = telegramId.trim();
    if (!trimmed) return;
    setIsLoggingIn(true);
    try {
      await loginWithTelegramId(trimmed);
      navigate('/schedule');
    } catch {
      // Error toast is already shown by AppContext
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTelegramLogin();
    }
  };

  // ── Registration: complete sign-up with chosen role ──
  const handleCompleteRegistration = async (role: 'tutor' | 'student') => {
    setIsRegistering(true);
    try {
      await completeRegistration(role);
      navigate('/schedule');
    } catch {
      // Error toast is already shown by AppContext
    } finally {
      setIsRegistering(false);
    }
  };

  // ── Redirect: already logged in ──
  React.useEffect(() => {
    if (!useMock && authUser) {
      navigate('/schedule', { replace: true });
    } else if (useMock && localStorage.getItem('onboarding_complete') === 'true') {
      navigate('/schedule', { replace: true });
    }
  }, [navigate, authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3390ec] to-[#5b9bef] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-[#3390ec]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StudyFlow</h1>
          <p className="text-white/90 text-lg">
            Платформа для репетиторов и учеников
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-white/95 backdrop-blur"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#3390ec]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#3390ec]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        {useMock ? (
          // ══════ MOCK MODE ══════
          <>
            <Button fullWidth size="lg" onClick={handleStart}>
              Начать
            </Button>
            <p className="text-center text-white/70 text-sm mt-6">
              Демо-режим: вход как репетитор
            </p>
          </>
        ) : isInitializing ? (
          // ══════ REAL MODE — Loading ══════
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-white/80 text-sm">Загрузка...</p>
          </div>
        ) : needsRegistration ? (
          // ══════ REAL MODE — Registration (new user) ══════
          <>
            <Card className="bg-white/95 backdrop-blur mb-3">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    {telegramUserInfo?.first_name
                      ? `Добро пожаловать, ${telegramUserInfo.first_name}!`
                      : 'Добро пожаловать!'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Выберите роль для продолжения
                  </p>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={() => handleCompleteRegistration('tutor')}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : null}
                  Войти как тьютор
                </Button>

                <Button
                  fullWidth
                  size="lg"
                  onClick={() => handleCompleteRegistration('student')}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : null}
                  Войти как ученик
                </Button>
              </div>
            </Card>
            <p className="text-center text-white/70 text-sm mt-6">
              Регистрация в приложении StudyFlow
            </p>
          </>
        ) : needsTelegram ? (
          // ══════ REAL MODE — Not in Telegram ══════
          <>
            <Card className="bg-white/95 backdrop-blur mb-3">
              <div className="flex flex-col items-center gap-4 py-4">
                <Smartphone className="w-12 h-12 text-[#3390ec]/60" />
                <div className="text-center">
                  <p className="text-gray-700 font-medium">
                    Откройте приложение через Telegram
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    StudyFlow работает внутри Telegram Mini App.
                    Пожалуйста, откройте его через Telegram.
                  </p>
                </div>
              </div>
            </Card>

            {/* Debug panel — shows what the app actually sees */}
            <DebugPanel lastAuthError={lastAuthError} />

            {/* Dev login toggle */}
            {!showDevLogin ? (
              <button
                className="w-full text-center text-white/50 text-xs hover:text-white/80 transition-colors cursor-pointer"
                onClick={() => setShowDevLogin(true)}
              >
                Dev: вход по Telegram ID
              </button>
            ) : (
              <Card className="bg-white/95 backdrop-blur">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Telegram ID (dev)
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Введите ваш Telegram ID"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleTelegramLogin}
                    disabled={isLoggingIn || !telegramId.trim()}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    {isLoggingIn ? 'Вход...' : 'Войти (dev)'}
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * In-app debug panel — shows what the browser actually sees.
 * Critical for debugging Telegram Mini App issues where there's no DevTools.
 */
function DebugPanel({ lastAuthError }: { lastAuthError: string | null }) {
  const [expanded, setExpanded] = React.useState(false);

  const tg = (window as any).Telegram;
  const webApp = tg?.WebApp;

  const rows: [string, string][] = [
    ['User Agent', navigator.userAgent],
    ['Current URL', window.location.href],
    ['VITE_USE_MOCKS', import.meta.env.VITE_USE_MOCKS ?? 'undefined'],
    ['VITE_API_URL', import.meta.env.VITE_API_URL ?? 'undefined'],
    ['VITE_NGROK_SKIP_WARNING', import.meta.env.VITE_NGROK_SKIP_WARNING ?? 'undefined'],
    ['window.Telegram', tg ? 'exists' : 'NOT FOUND'],
    ['WebApp', webApp ? 'exists' : 'NOT FOUND'],
    ['WebApp.platform', webApp?.platform ?? '(empty)'],
    ['WebApp.version', webApp?.version ?? '(empty)'],
    ['initData', webApp?.initData || '(empty)'],
    ['initData length', String((webApp?.initData || '').length)],
    ['initDataUnsafe', webApp?.initDataUnsafe ? JSON.stringify(webApp.initDataUnsafe).slice(0, 200) : '(empty)'],
    ['WebApp.colorScheme', webApp?.colorScheme ?? '(empty)'],
    ['WebApp.viewportHeight', String(webApp?.viewportHeight ?? 0)],
    ['WebApp.viewportStableHeight', String(webApp?.viewportStableHeight ?? 0)],
    ['WebApp.isExpanded', String(webApp?.isExpanded ?? false)],
    ['Last Auth Error', lastAuthError ?? '(none)'],
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-3 mb-3 border border-gray-700">
      <div
        className="flex items-center justify-between cursor-pointer py-1"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs font-mono text-green-400 font-bold">Debug Info</span>
        <span className="text-xs text-green-400">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs font-mono">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="text-gray-400 shrink-0">{label}:</span>
              <span
                className="break-all"
                style={{
                  color: value === 'NOT FOUND' || value === '(empty)' ? '#f87171' : '#e2e8f0',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
