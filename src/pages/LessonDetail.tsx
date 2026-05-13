import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, Calendar, Edit, XCircle, Video, CreditCard, Info } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import type { Lesson, Slot, User } from '../types';

function getDurationMinutes(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

function formatDateDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTimeOnly(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const currentId = id;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const lessonData = await apiClient.getLesson(currentId);
        setLesson(lessonData);

        const [slotData, studentData] = await Promise.all([
          apiClient.getSlot(lessonData.slot_id),
          apiClient.getUser(lessonData.student_id),
        ]);
        setSlot(slotData);
        setStudent(studentData);
      } catch (err) {
        console.error('Failed to fetch lesson', err);
        setError('Занятие не найдено');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleCancel = async () => {
    if (!id || !authUser) return;
    setCancelling(true);
    try {
      await apiClient.cancelLesson(id);
      // Refetch lesson to get updated status
      const updatedLesson = await apiClient.getLesson(id);
      setLesson(updatedLesson);
    } catch (err) {
      console.error('Failed to cancel lesson', err);
      toast.error('Не удалось отменить занятие');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Layout hideNav>
        <Header title="Детали занятия" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error || !lesson || !slot) {
    return (
      <Layout hideNav>
        <Header title="Занятие не найдено" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              {error || 'Запрошенное занятие не найдено'}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const isTutor = authUser?.role === 'tutor';
  const isBooked = lesson.status === 'booked';

  return (
    <Layout hideNav>
      <Header title="Детали занятия" showBack />

      <div className="p-4 space-y-4">
        {/* Main Info */}
        <Card>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {lesson.status === 'booked' && (
                  <Badge variant="info">Запланировано</Badge>
                )}
                {lesson.status === 'completed' && (
                  <Badge variant="success">Проведено</Badge>
                )}
                {lesson.status === 'cancelled' && (
                  <Badge variant="danger">Отменено</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {/* Date & Time from slot */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
                <div>
                  <div className="font-medium">{formatDateDisplay(slot.starts_at)}</div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {formatTimeOnly(slot.starts_at)} – {formatTimeOnly(slot.ends_at)}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div>
                  <div className="font-medium">{getDurationMinutes(slot.starts_at, slot.ends_at)} минут</div>
                </div>
              </div>

              {/* Student info (for tutor) */}
              {isTutor && student && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
                  <div>
                    <div className="font-medium">{student.first_name} {student.last_name}</div>
                  </div>
                </div>
              )}

              {/* Connection link */}
              {lesson.connection_link && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
                  <div>
                    <div className="font-medium">Ссылка на занятие</div>
                    <a
                      href={lesson.connection_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--tg-theme-button-color,#3390ec)] break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lesson.connection_link}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div className="font-medium">Статус оплаты</div>
              </div>
              {lesson.is_paid ? (
                <Badge variant="success">Оплачено</Badge>
              ) : (
                <Badge variant="warning">Не оплачено</Badge>
              )}
            </div>

            {lesson.price_rub !== undefined && lesson.price_rub !== null && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--tg-theme-hint-color,#999)]">Стоимость:</span>
                <span className="font-medium">{lesson.price_rub} ₽</span>
              </div>
            )}

            {lesson.payment_info && (
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
                <div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">Платёжные данные</div>
                  <div className="text-sm text-[var(--tg-theme-text-color,#000)] mt-1">
                    {lesson.payment_info}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {isTutor && isBooked && (
          <div className="space-y-3">
            <Button
              fullWidth
              variant="primary"
              onClick={() => navigate(`/schedule/${id}/edit`)}
            >
              <Edit className="w-5 h-5" />
              Редактировать
            </Button>

            <Button
              fullWidth
              variant="danger"
              disabled={cancelling}
              onClick={handleCancel}
            >
              <XCircle className="w-5 h-5" />
              {cancelling ? 'Отмена...' : 'Отменить занятие'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
