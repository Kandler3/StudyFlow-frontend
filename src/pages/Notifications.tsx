import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Calendar, ClipboardList, CreditCard, Check } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/EmptyState';
import { notifications as notificationsData } from '../data/mockData';

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(notificationsData);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));

    // Navigate to target
    if (notification.type === 'lesson') {
      navigate(`/schedule/${notification.targetId}`);
    } else if (notification.type === 'assignment') {
      navigate(`/assignments/${notification.targetId}`);
    } else if (notification.type === 'payment') {
      navigate(`/payments/${notification.targetId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return Calendar;
      case 'assignment':
        return ClipboardList;
      case 'payment':
        return CreditCard;
      default:
        return Bell;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    }
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout hideNav>
      <Header
        title="Уведомления"
        showBack
        action={
          unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllAsRead}>
              <Check className="w-4 h-4" />
              Прочитать все
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {unreadCount > 0 && (
          <Card padding="sm">
            <div className="text-center py-2">
              <span className="text-sm font-medium">
                {unreadCount} непрочитанных уведомлений
              </span>
            </div>
          </Card>
        )}

        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-16 h-16" />}
            title="Нет уведомлений"
            description="Все уведомления будут отображаться здесь"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              
              return (
                <Card
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={!notification.read ? 'border-2 border-[var(--tg-theme-button-color,#3390ec)]' : ''}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'lesson' ? 'bg-[#3390ec]/10 text-[#3390ec]' :
                      notification.type === 'assignment' ? 'bg-[#ff9500]/10 text-[#ff9500]' :
                      'bg-[#34c759]/10 text-[#34c759]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-[var(--tg-theme-text-color,#000)]">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#3390ec] flex-shrink-0 ml-2 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--tg-theme-text-color,#000)] mb-2">
                        {notification.message}
                      </p>
                      <div className="text-xs text-[var(--tg-theme-hint-color,#999)]">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
