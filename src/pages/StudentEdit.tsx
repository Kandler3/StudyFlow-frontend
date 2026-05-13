import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Save } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import type { TutorStudent } from '../types';

export function StudentEdit() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [relationship, setRelationship] = useState<TutorStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lessonPriceRub, setLessonPriceRub] = useState<string>('');
  const [lessonConnectionLink, setLessonConnectionLink] = useState<string>('');

  useEffect(() => {
    if (!authUser || !studentId) return;
    const currentUser = authUser;
    const currentStudentId = studentId;

    async function fetchData() {
      setLoading(true);
      try {
        if (currentUser.role === 'tutor') {
          const rel = await apiClient.getTutorStudent(currentUser.id, currentStudentId);
          if (rel) {
            setRelationship(rel);
            setLessonPriceRub(rel.lesson_price_rub?.toString() ?? '');
            setLessonConnectionLink(rel.lesson_connection_link ?? '');
          } else {
            setError('Связь с учеником не найдена');
          }
        } else {
          setError('Доступ запрещён. Только преподаватель может редактировать параметры.');
        }
      } catch (err) {
        console.error('Failed to fetch relationship', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authUser, studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !studentId || authUser.role !== 'tutor') return;

    setError(null);
    setSubmitting(true);

    try {
      await apiClient.updateTutorStudent(authUser.id, studentId, {
        lesson_price_rub: lessonPriceRub ? Number(lessonPriceRub) : undefined,
        lesson_connection_link: lessonConnectionLink || undefined,
      });
      navigate(`/students/${studentId}`);
    } catch (err) {
      console.error('Failed to update student', err);
      setError('Не удалось сохранить изменения');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authUser) {
    return (
      <Layout hideNav>
        <Header title="Редактировать" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (authUser.role !== 'tutor') {
    return (
      <Layout hideNav>
        <Header title="Редактировать" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Доступ запрещён. Только преподаватель может редактировать параметры ученика.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout hideNav>
        <Header title="Редактировать" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error && !relationship) {
    return (
      <Layout hideNav>
        <Header title="Редактировать" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              {error}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <Header title="Редактировать параметры" showBack />

      <div className="p-4 space-y-4">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Цена за занятие (₽)"
              type="number"
              placeholder="1500"
              value={lessonPriceRub}
              onChange={(e) => setLessonPriceRub(e.target.value)}
            />

            <Input
              label="Ссылка на занятие"
              placeholder="https://zoom.us/j/..."
              value={lessonConnectionLink}
              onChange={(e) => setLessonConnectionLink(e.target.value)}
            />

            {error && (
              <p className="text-sm text-[#ff3b30]">{error}</p>
            )}

            <Button
              fullWidth
              variant="primary"
              disabled={submitting}
              type="submit"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
