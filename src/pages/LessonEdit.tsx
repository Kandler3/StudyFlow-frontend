import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Video, CreditCard, Info } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, TextArea } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import type { Lesson } from '../types';

export function LessonEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [connectionLink, setConnectionLink] = useState('');
  const [priceRub, setPriceRub] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');

  useEffect(() => {
    if (!id) return;
    const currentId = id;

    async function fetchData() {
      setLoading(true);
      try {
        const lessonData = await apiClient.getLesson(currentId);
        setLesson(lessonData);
        setConnectionLink(lessonData.connection_link ?? '');
        setPriceRub(lessonData.price_rub !== undefined && lessonData.price_rub !== null ? String(lessonData.price_rub) : '');
        setPaymentInfo(lessonData.payment_info ?? '');
      } catch (err) {
        console.error('Failed to fetch lesson', err);
        setError('Занятие не найдено');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.updateLesson(id, {
        connection_link: connectionLink || undefined,
        price_rub: priceRub ? Number(priceRub) : undefined,
        payment_info: paymentInfo || undefined,
      });
      navigate(`/schedule/${id}`);
    } catch (err) {
      console.error('Failed to update lesson', err);
      setError('Не удалось обновить занятие. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser || authUser.role !== 'tutor') {
    return (
      <Layout hideNav>
        <Header title="Доступ запрещён" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Только преподаватели могут редактировать занятия
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout hideNav>
        <Header title="Редактировать занятие" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error || !lesson) {
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

  if (lesson.status !== 'booked') {
    return (
      <Layout hideNav>
        <Header title="Редактировать занятие" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Можно редактировать только запланированные занятия
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <Header title="Редактировать занятие" showBack />

      <div className="p-4 space-y-4">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ссылка на занятие"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={connectionLink}
              onChange={(e) => setConnectionLink(e.target.value)}
              icon={<Video className="w-4 h-4" />}
              helperText="Ссылка для подключения к занятию"
            />

            <Input
              label="Стоимость (₽)"
              type="number"
              placeholder="1500"
              value={priceRub}
              onChange={(e) => setPriceRub(e.target.value)}
              icon={<CreditCard className="w-4 h-4" />}
              helperText="Цена занятия в рублях"
            />

            <TextArea
              label="Платёжные данные"
              placeholder="Реквизиты для оплаты..."
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
              rows={3}
              helperText="Информация для оплаты (опционально)"
            />

            {error && (
              <p className="text-sm text-[#ff3b30]">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/schedule/${id}`)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={submitting}
              >
                {submitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
