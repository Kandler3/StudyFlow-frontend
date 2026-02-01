import React from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, HelpCircle, Settings, ChevronRight, Bell, Calendar } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';

export function More() {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: TrendingUp,
      label: 'Аналитика',
      description: 'Статистика и отчеты',
      path: '/analytics',
      color: 'text-[#3390ec]',
      bg: 'bg-[#3390ec]/10',
    },
    {
      icon: HelpCircle,
      label: 'Помощь',
      description: 'Часто задаваемые вопросы',
      path: '/faq',
      color: 'text-[#ff9500]',
      bg: 'bg-[#ff9500]/10',
    },
    {
      icon: Settings,
      label: 'Настройки',
      description: 'Профиль и уведомления',
      path: '/settings',
      color: 'text-[#999]',
      bg: 'bg-[#999]/10',
    },
  ];

  const quickActions = [
    {
      icon: Calendar,
      label: 'Расписание',
      path: '/schedule',
    },
    {
      icon: Bell,
      label: 'Уведомления',
      path: '/notifications',
    },
  ];

  return (
    <Layout>
      <Header title="Ещё" />

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
            Быстрые действия
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                onClick={() => navigate(action.path)}
                className="text-center"
              >
                <action.icon className="w-8 h-8 mx-auto mb-2 text-[var(--tg-theme-button-color,#3390ec)]" />
                <div className="font-medium text-sm">{action.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Menu */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
            Меню
          </h3>
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--tg-theme-text-color,#000)]">
                      {item.label}
                    </h4>
                    <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* App Info */}
        <Card>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-[#3390ec]/10 rounded-3xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-[#3390ec]" />
            </div>
            <h3 className="font-semibold text-lg mb-1">StudyFlow</h3>
            <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
              Управление обучением в Telegram
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
