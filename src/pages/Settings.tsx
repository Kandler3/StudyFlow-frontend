import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Bell, Globe, HelpCircle, ChevronRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DebugPanel } from '../components/DebugPanel';
import { useApp } from '../context/AppContext';

export function Settings() {
  const navigate = useNavigate();
  const { authUser, loginAs, tutorProfile, lastAuthError } = useApp();

  const [lessonReminders, setLessonReminders] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);

  if (!authUser) return null;

  const roleLabels: Record<string, string> = {
    tutor: 'Репетитор',
    student: 'Ученик',
  };

  const statusLabels: Record<string, string> = {
    active: 'Активен',
    deleted: 'Удалён',
  };

  return (
    <Layout>
      <Header title="Настройки" />

      <div className="p-4 space-y-6">
        {/* User Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--tg-theme-button-color,#3390ec)] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {authUser.first_name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-[var(--tg-theme-text-color,#000)]">
                {authUser.first_name} {authUser.last_name}
              </h3>
              <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                {roleLabels[authUser.role] ?? authUser.role}
              </p>
              <p className="text-xs text-[var(--tg-theme-hint-color,#999)]">
                {authUser.timezone} &middot; {statusLabels[authUser.status] ?? authUser.status}
              </p>
            </div>
            <Badge variant={authUser.role === 'tutor' ? 'info' : 'success'}>
              {roleLabels[authUser.role] ?? authUser.role}
            </Badge>
          </div>
        </Card>

        {/* Tutor Profile (if tutor) */}
        {authUser.role === 'tutor' && tutorProfile && (
          <Card>
            <h3 className="font-semibold mb-3">Профиль репетитора</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">Цена занятия</span>
                <span className="font-semibold">{tutorProfile.lesson_price_rub} ₽</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">Ссылка на занятие</span>
                <span className="text-sm text-[var(--tg-theme-button-color,#3390ec)] truncate max-w-[160px] ml-2">
                  {tutorProfile.lesson_connection_link}
                </span>
              </div>
              <div className="p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)] block mb-1">Платёжные данные</span>
                <span className="text-sm font-medium">{tutorProfile.payment_info}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Role Switch Card */}
        <Card>
          <h3 className="font-semibold mb-3">Сменить роль</h3>
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-4">
            Переключитесь между ролями, чтобы увидеть разные интерфейсы
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => loginAs('tutor')}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                authUser.role === 'tutor'
                  ? 'border-[#3390ec] bg-[#3390ec]/10'
                  : 'border-[var(--tg-theme-secondary-bg-color,#f4f4f5)]'
              }`}
            >
              <div className="font-semibold">Репетитор</div>
              {authUser.role === 'tutor' && (
                <div className="text-xs text-[#3390ec] mt-1">Текущая роль</div>
              )}
            </button>
            <button
              onClick={() => loginAs('student')}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                authUser.role === 'student'
                  ? 'border-[#3390ec] bg-[#3390ec]/10'
                  : 'border-[var(--tg-theme-secondary-bg-color,#f4f4f5)]'
              }`}
            >
              <div className="font-semibold">Ученик</div>
              {authUser.role === 'student' && (
                <div className="text-xs text-[#3390ec] mt-1">Текущая роль</div>
              )}
            </button>
          </div>
        </Card>

        {/* Notification Toggles */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
            Уведомления
          </h3>
          <Card padding="none">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <span className="font-medium">Напоминания о занятиях</span>
              </div>
              <button
                onClick={() => setLessonReminders(!lessonReminders)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  lessonReminders ? 'bg-[#3390ec]' : 'bg-[var(--tg-theme-secondary-bg-color,#d4d4d5)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    lessonReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-[var(--tg-theme-secondary-bg-color,#f4f4f5)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <span className="font-medium">Напоминания о заданиях</span>
              </div>
              <button
                onClick={() => setAssignmentReminders(!assignmentReminders)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  assignmentReminders ? 'bg-[#3390ec]' : 'bg-[var(--tg-theme-secondary-bg-color,#d4d4d5)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    assignmentReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* General Settings */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
            Общие
          </h3>
          <Card padding="none">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] transition-colors border-b border-[var(--tg-theme-secondary-bg-color,#f4f4f5)] opacity-60">
              <Globe className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
              <span className="flex-1 text-left font-medium">Язык</span>
              <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">Русский</span>
              <ChevronRight className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
            </button>
            <button onClick={() => navigate('/faq')} className="w-full flex items-center gap-3 p-4 hover:bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] transition-colors">
              <HelpCircle className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
              <span className="flex-1 text-left font-medium">Помощь и поддержка</span>
              <ChevronRight className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
            </button>
          </Card>
        </div>

        {/* About */}
        <Card>
          <div className="text-center py-4">
            <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
              StudyFlow
            </div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#999)]">
              Версия 1.0.0
            </div>
          </div>
        </Card>

        <DebugPanel lastAuthError={lastAuthError} />
      </div>
    </Layout>
  );
}
