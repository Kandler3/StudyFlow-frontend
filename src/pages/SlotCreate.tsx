import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, ArrowRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export function SlotCreate() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    if (!date || !startTime || !endTime) {
      setError('Заполните все поля');
      return;
    }

    const starts_at = `${date}T${startTime}:00+03:00`;
    const ends_at = `${date}T${endTime}:00+03:00`;

    if (new Date(starts_at) >= new Date(ends_at)) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiClient.createSlot({
        tutor_id: authUser.id,
        starts_at,
        ends_at,
      });
      navigate('/schedule');
    } catch (err) {
      console.error('Failed to create slot', err);
      setError('Не удалось создать слот. Попробуйте снова.');
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
              Только преподаватели могут создавать слоты
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <Header title="Создать слот" showBack />

      <div className="p-4 space-y-4">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Дата"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              icon={<Clock className="w-4 h-4" />}
            />

            <Input
              label="Время начала"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              icon={<Clock className="w-4 h-4" />}
            />

            <Input
              label="Время окончания"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              icon={<ArrowRight className="w-4 h-4" />}
            />

            {error && (
              <p className="text-sm text-[#ff3b30]">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Создание...' : 'Создать слот'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
