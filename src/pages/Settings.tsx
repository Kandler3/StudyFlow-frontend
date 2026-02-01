import React from 'react';
import { User, Bell, Globe, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { currentUser, userRole, setUserRole } = useApp();

  const settingSections = [
    {
      title: 'Профиль',
      items: [
        {
          icon: User,
          label: 'Имя пользователя',
          value: currentUser.name,
          onClick: () => console.log('Edit profile'),
        },
        {
          icon: User,
          label: 'Роль',
          value: userRole === 'tutor' ? 'Репетитор' : 'Ученик',
          badge: true,
          onClick: () => console.log('Change role'),
        },
      ],
    },
    {
      title: 'Уведомления',
      items: [
        {
          icon: Bell,
          label: 'Занятия',
          value: 'Включено',
          onClick: () => console.log('Toggle lesson notifications'),
        },
        {
          icon: Bell,
          label: 'Задания',
          value: 'Включено',
          onClick: () => console.log('Toggle assignment notifications'),
        },
        {
          icon: Bell,
          label: 'Оплаты',
          value: 'Включено',
          onClick: () => console.log('Toggle payment notifications'),
        },
      ],
    },
    {
      title: 'Общие',
      items: [
        {
          icon: Globe,
          label: 'Язык',
          value: 'Русский',
          onClick: () => console.log('Change language'),
        },
        {
          icon: HelpCircle,
          label: 'Помощь и поддержка',
          onClick: () => console.log('Open help'),
        },
      ],
    },
  ];

  return (
    <Layout>
      <Header title="Настройки" />

      <div className="p-4 space-y-6">
        {/* User Card */}
        <Card>
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-[var(--tg-theme-text-color,#000)]">
                {currentUser.name}
              </h3>
              <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                {userRole === 'tutor' ? 'Репетитор' : 'Ученик'}
              </p>
            </div>
            <Badge variant={userRole === 'tutor' ? 'info' : 'success'}>
              {userRole === 'tutor' ? 'Преподаватель' : 'Студент'}
            </Badge>
          </div>
        </Card>

        {/* Role Switch Card */}
        <Card>
          <h3 className="font-semibold mb-3">Переключить роль (демо)</h3>
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-4">
            Переключитесь между ролями, чтобы увидеть разные интерфейсы
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setUserRole('tutor')}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                userRole === 'tutor'
                  ? 'border-[#3390ec] bg-[#3390ec]/10'
                  : 'border-[var(--tg-theme-secondary-bg-color,#f4f4f5)]'
              }`}
            >
              <div className="font-semibold">Репетитор</div>
            </button>
            <button
              onClick={() => setUserRole('student')}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                userRole === 'student'
                  ? 'border-[#3390ec] bg-[#3390ec]/10'
                  : 'border-[var(--tg-theme-secondary-bg-color,#f4f4f5)]'
              }`}
            >
              <div className="font-semibold">Ученик</div>
            </button>
          </div>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
              {section.title}
            </h3>
            <Card padding="none">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] transition-colors ${
                    itemIndex !== section.items.length - 1 ? 'border-b border-[var(--tg-theme-secondary-bg-color,#f4f4f5)]' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.value && !item.badge && (
                    <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                      {item.value}
                    </span>
                  )}
                  {item.badge && item.value && (
                    <Badge variant="info" size="sm">{item.value}</Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                </button>
              ))}
            </Card>
          </div>
        ))}

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
      </div>
    </Layout>
  );
}
