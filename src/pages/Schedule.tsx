import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Clock, Users, Calendar, CheckCircle, XCircle, Video, BookOpen } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import type { Lesson, Slot, User } from '../types';

interface LessonWithMeta {
  lesson: Lesson;
  slot: Slot;
  student?: User;
  tutor?: User;
}

function getDurationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

function getDateKey(isoString: string): string {
  return isoString.split('T')[0]!;
}

function formatScheduleDate(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Завтра';
  }

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatTimeOnly(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function Schedule() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [lessons, setLessons] = useState<LessonWithMeta[]>([]);
  const [freeSlots, setFreeSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'booked' | 'completed' | 'cancelled'>('all');
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!authUser) return;

    setLoading(true);
    try {
      if (authUser.role === 'tutor') {
        const lessonData = await apiClient.getLessons({ tutor_id: authUser.id });
        const availableSlots = await apiClient.getTutorSlots(authUser.id, true);
        setFreeSlots(availableSlots);

        const lessonsWithData = await Promise.all(
          lessonData.map(async (lesson) => {
            const [slot, student] = await Promise.all([
              apiClient.getSlot(lesson.slot_id),
              apiClient.getUser(lesson.student_id),
            ]);
            return { lesson, slot, student };
          })
        );
        setLessons(lessonsWithData);
      } else {
        const lessonData = await apiClient.getLessons({ student_id: authUser.id });

        const lessonsWithData = await Promise.all(
          lessonData.map(async (lesson) => {
            const slot = await apiClient.getSlot(lesson.slot_id);
            const tutor = await apiClient.getUser(slot.tutor_id).catch(() => undefined);
            return { lesson, slot, tutor };
          })
        );
        setLessons(lessonsWithData);

        const tutors = await apiClient.getStudentTutors(authUser.id);
        if (tutors.length > 0) {
          const availableSlots = await apiClient.getTutorSlots(tutors[0].tutor_id, true);
          setFreeSlots(availableSlots);
        }
      }
    } catch (err) {
      console.error('Failed to fetch schedule data', err);
      toast.error('Не удалось загрузить расписание');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookSlot = async (slotId: string) => {
    if (!authUser || authUser.role !== 'student') return;
    setBookingSlotId(slotId);
    try {
      await apiClient.createLesson(slotId, authUser.id);
      await fetchData();
    } catch (err) {
      console.error('Failed to book slot', err);
      toast.error('Не удалось забронировать слот');
    } finally {
      setBookingSlotId(null);
    }
  };

  const getStatusBadge = (status: Lesson['status']) => {
    const config: Record<Lesson['status'], { variant: 'info' | 'success' | 'danger'; label: string; icon: React.ReactNode }> = {
      booked: { variant: 'info', label: 'Запланировано', icon: <Clock className="w-3 h-3" /> },
      completed: { variant: 'success', label: 'Проведено', icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { variant: 'danger', label: 'Отменено', icon: <XCircle className="w-3 h-3" /> },
    };
    const cfg = config[status];
    return (
      <Badge variant={cfg.variant} size="sm">
        {cfg.icon}
        <span className="ml-1">{cfg.label}</span>
      </Badge>
    );
  };

  const filteredLessons = lessons.filter(({ lesson }) => {
    if (filter === 'all') return true;
    return lesson.status === filter;
  });

  // Group lessons by date key extracted from slot.starts_at
  const groupedLessons = filteredLessons.reduce<Record<string, LessonWithMeta[]>>((acc, item) => {
    const key = getDateKey(item.slot.starts_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(groupedLessons).sort();

  if (!authUser) {
    return (
      <Layout>
        <Header title="Расписание" />
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title="Расписание"
        action={
          authUser.role === 'tutor' && (
            <Button
              size="sm"
              onClick={() => navigate('/schedule/slots/create')}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Free slots section for tutors */}
        {authUser.role === 'tutor' && freeSlots.length > 0 && (
          <Card padding="sm" className="bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)]">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--tg-theme-text-color,#000)] mb-2 px-1">
              <Calendar className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
              Свободные слоты ({freeSlots.length})
            </div>
            <div className="space-y-2">
              {freeSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-[var(--tg-theme-bg-color,#fff)] rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                    <span className="font-medium">
                      {formatScheduleDate(slot.starts_at)}, {formatTimeOnly(slot.starts_at)} – {formatTimeOnly(slot.ends_at)}
                    </span>
                    <span className="text-[var(--tg-theme-hint-color,#999)]">
                      ({getDurationMinutes(slot.starts_at, slot.ends_at)} мин)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Free slots section for students */}
        {authUser.role === 'student' && freeSlots.length > 0 && (
          <Card padding="sm" className="bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)]">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--tg-theme-text-color,#000)] mb-2 px-1">
              <BookOpen className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
              Доступные слоты для записи
            </div>
            <div className="space-y-2">
              {freeSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between bg-[var(--tg-theme-bg-color,#fff)] rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                    <span className="font-medium">
                      {formatScheduleDate(slot.starts_at)}, {formatTimeOnly(slot.starts_at)} – {formatTimeOnly(slot.ends_at)}
                    </span>
                    <span className="text-[var(--tg-theme-hint-color,#999)]">
                      ({getDurationMinutes(slot.starts_at, slot.ends_at)} мин)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={bookingSlotId === slot.id}
                    onClick={() => handleBookSlot(slot.id)}
                  >
                    {bookingSlotId === slot.id ? '...' : 'Записаться'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'Все' },
            { value: 'booked', label: 'Запланировано' },
            { value: 'completed', label: 'Проведено' },
            { value: 'cancelled', label: 'Отменено' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as typeof filter)}
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

        {/* Lessons list */}
        {loading ? (
          <LoadingSpinner />
        ) : sortedDateKeys.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="Нет занятий"
            description="Занятия по выбранным фильтрам не найдены"
            action={
              authUser.role === 'tutor' && (
                <Button onClick={() => navigate('/schedule/slots/create')}>
                  <Plus className="w-4 h-4" />
                  Создать слот
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {sortedDateKeys.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] mb-3 px-1">
                  {formatScheduleDate(groupedLessons[dateKey]![0].slot.starts_at)}
                </h3>
                <div className="space-y-3">
                  {groupedLessons[dateKey]!.map(({ lesson, slot, student, tutor }) => (
                    <Card
                      key={lesson.id}
                      onClick={() => navigate(`/schedule/${lesson.id}`)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                              <Clock className="w-4 h-4" />
                              {formatTimeOnly(slot.starts_at)} – {formatTimeOnly(slot.ends_at)} · {getDurationMinutes(slot.starts_at, slot.ends_at)} мин
                            </div>
                            {authUser.role === 'tutor' && student && (
                              <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-text-color,#000)]">
                                <Users className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                                {student.first_name} {student.last_name}
                              </div>
                            )}
                            {authUser.role === 'student' && tutor && (
                              <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-text-color,#000)]">
                                <Users className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                                {tutor.first_name} {tutor.last_name}
                              </div>
                            )}
                          </div>
                          {getStatusBadge(lesson.status)}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {lesson.is_paid ? (
                            <Badge variant="success" size="sm">Оплачено</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Не оплачено</Badge>
                          )}
                          {lesson.connection_link && (
                            <Badge variant="info" size="sm">
                              <Video className="w-3 h-3" />
                              <span className="ml-1">Online</span>
                            </Badge>
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
