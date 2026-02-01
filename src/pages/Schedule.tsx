import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar as CalendarIcon, List, Plus, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/ui/EmptyState';
import { lessons } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Lesson, LessonStatus } from '../types';

export function Schedule() {
  const navigate = useNavigate();
  const { userRole } = useApp();
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [filter, setFilter] = useState<'all' | LessonStatus>('all');

  const filteredLessons = lessons.filter((lesson) => {
    if (filter === 'all') return true;
    return lesson.status === filter;
  });

  const getStatusBadge = (status: LessonStatus) => {
    const statusConfig = {
      scheduled: { variant: 'info' as const, label: 'Запланировано', icon: Clock },
      completed: { variant: 'success' as const, label: 'Проведено', icon: CheckCircle },
      cancelled: { variant: 'danger' as const, label: 'Отменено', icon: XCircle },
      rescheduled: { variant: 'warning' as const, label: 'Перенесено', icon: AlertCircle },
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} size="sm">
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    }
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const groupedLessons = filteredLessons.reduce((acc, lesson) => {
    const dateKey = lesson.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <Layout>
      <Header
        title="Расписание"
        action={
          userRole === 'tutor' && (
            <Button
              size="sm"
              onClick={() => navigate('/schedule/create')}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('list')}
            className="flex-1"
          >
            <List className="w-4 h-4" />
            Список
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('calendar')}
            className="flex-1"
          >
            <CalendarIcon className="w-4 h-4" />
            Календарь
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'Все' },
            { value: 'scheduled', label: 'Запланировано' },
            { value: 'completed', label: 'Проведено' },
            { value: 'cancelled', label: 'Отменено' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === item.value
                  ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                  : 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Lessons List */}
        {filteredLessons.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="w-16 h-16" />}
            title="Нет занятий"
            description="Занятия по выбранным фильтрам не найдены"
            action={
              userRole === 'tutor' && (
                <Button onClick={() => navigate('/schedule/create')}>
                  <Plus className="w-4 h-4" />
                  Создать занятие
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLessons).map(([date, dayLessons]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
                  {formatDate(date)}
                </h3>
                <div className="space-y-3">
                  {dayLessons.map((lesson) => (
                    <Card
                      key={lesson.id}
                      onClick={() => navigate(`/schedule/${lesson.id}`)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[var(--tg-theme-text-color,#000)] mb-1">
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-hint-color,#999)]">
                              <Clock className="w-4 h-4" />
                              {lesson.time} · {lesson.duration} мин
                            </div>
                          </div>
                          {getStatusBadge(lesson.status)}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-text-color,#000)]">
                          <Users className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                          {lesson.studentNames.join(', ')}
                          {lesson.type === 'group' && (
                            <Badge variant="default" size="sm">Группа</Badge>
                          )}
                        </div>

                        {lesson.location && (
                          <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-hint-color,#999)]">
                            <MapPin className="w-4 h-4" />
                            {lesson.location}
                          </div>
                        )}

                        <div className="flex gap-2">
                          {lesson.hasHomework && (
                            <Badge variant="info" size="sm">ДЗ</Badge>
                          )}
                          {lesson.isPaid ? (
                            <Badge variant="success" size="sm">Оплачено</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Не оплачено</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
