import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, MapPin, Calendar, Edit, XCircle, RefreshCw, CheckCircle, ClipboardList, MessageSquare } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/ui/input';
import { lessons } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useApp();
  const lesson = lessons.find((l) => l.id === id);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');

  if (!lesson) {
    return (
      <Layout hideNav>
        <Header title="Занятие не найдено" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Запрошенное занятие не найдено или удалено
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const handleCancel = () => {
    console.log('Cancelling lesson with reason:', cancelReason);
    setShowCancelModal(false);
    navigate('/schedule');
  };

  const handleComplete = () => {
    console.log('Completing lesson with notes:', lessonNotes);
    setShowCompleteModal(false);
    navigate('/schedule');
  };

  return (
    <Layout hideNav>
      <Header title="Детали занятия" showBack />

      <div className="p-4 space-y-4">
        {/* Main Info */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000)] mb-2">
                {lesson.title}
              </h2>
              {lesson.status === 'scheduled' && (
                <Badge variant="info">Запланировано</Badge>
              )}
              {lesson.status === 'completed' && (
                <Badge variant="success">Проведено</Badge>
              )}
              {lesson.status === 'cancelled' && (
                <Badge variant="danger">Отменено</Badge>
              )}
              {lesson.status === 'rescheduled' && (
                <Badge variant="warning">Перенесено</Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
                <div>
                  <div className="font-medium">{formatDate(lesson.date)}</div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {lesson.time}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div>
                  <div className="font-medium">{lesson.duration} минут</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
                <div>
                  <div className="font-medium">
                    {lesson.type === 'individual' ? 'Индивидуальное' : 'Групповое'}
                  </div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {lesson.studentNames.join(', ')}
                  </div>
                </div>
              </div>

              {lesson.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                  <div className="font-medium">{lesson.location}</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Payment Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium mb-1">Статус оплаты</div>
              <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                {lesson.isPaid ? 'Оплачено' : 'Ожидает оплаты'}
              </div>
            </div>
            {lesson.isPaid ? (
              <CheckCircle className="w-6 h-6 text-[#34c759]" />
            ) : (
              <Clock className="w-6 h-6 text-[#ff9500]" />
            )}
          </div>
        </Card>

        {/* Homework */}
        {lesson.hasHomework && (
          <Card onClick={() => navigate('/assignments')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                <div>
                  <div className="font-medium">Домашнее задание</div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    Посмотреть задание
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {lesson.notes && (
          <Card>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
              <div>
                <div className="font-medium mb-1">Заметки</div>
                <div className="text-sm text-[var(--tg-theme-text-color,#000)]">
                  {lesson.notes}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions for Tutor */}
        {userRole === 'tutor' && lesson.status === 'scheduled' && (
          <div className="space-y-3">
            <Button
              fullWidth
              variant="primary"
              onClick={() => setShowCompleteModal(true)}
            >
              <CheckCircle className="w-5 h-5" />
              Отметить проведенным
            </Button>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => navigate(`/schedule/${id}/edit`)}
            >
              <Edit className="w-5 h-5" />
              Редактировать
            </Button>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => navigate(`/schedule/${id}/reschedule`)}
            >
              <RefreshCw className="w-5 h-5" />
              Перенести
            </Button>

            <Button
              fullWidth
              variant="danger"
              onClick={() => setShowCancelModal(true)}
            >
              <XCircle className="w-5 h-5" />
              Отменить занятие
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Отмена занятия"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Отмена
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancel}
            >
              Отменить занятие
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
            Вы уверены, что хотите отменить это занятие? Ученик получит уведомление.
          </p>
          <TextArea
            label="Причина отмены (опционально)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Укажите причину отмены..."
          />
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Завершить занятие"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCompleteModal(false)}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleComplete}
            >
              Завершить
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
            Отметьте занятие как проведенное и добавьте заметки о прогрессе.
          </p>
          <TextArea
            label="Заметки о занятии (опционально)"
            value={lessonNotes}
            onChange={(e) => setLessonNotes(e.target.value)}
            rows={4}
            placeholder="Что прошли на занятии, прогресс ученика..."
          />
        </div>
      </Modal>
    </Layout>
  );
}
