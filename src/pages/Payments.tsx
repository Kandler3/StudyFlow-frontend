import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, CheckCircle, Clock, XCircle, Upload, ShieldCheck } from 'lucide-react';
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
import { formatDate, formatTime } from '../types';
import type { Lesson, Slot, User, Receipt } from '../types';

type PaymentFilter = 'all' | 'unpaid' | 'pending_verification' | 'verified';

interface LessonWithMeta {
  lesson: Lesson;
  slot: Slot;
  student?: User;
  receipt?: Receipt;
}

const FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'unpaid', label: 'Не оплачено' },
  { value: 'pending_verification', label: 'На проверке' },
  { value: 'verified', label: 'Подтверждено' },
];

export function Payments() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [items, setItems] = useState<LessonWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentFilter>('all');

  useEffect(() => {
    if (!authUser) return;
    const currentUser = authUser;

    async function fetchData() {
      setLoading(true);
      try {
        const lessonFilters = currentUser.role === 'tutor'
          ? { tutor_id: currentUser.id }
          : { student_id: currentUser.id };

        const [lessons, receipts] = await Promise.all([
          apiClient.getLessons(lessonFilters),
          apiClient.getReceipts(
            currentUser.role === 'tutor'
              ? { tutor_id: currentUser.id }
              : { student_id: currentUser.id }
          ),
        ]);

        const receiptMap = new Map<string, Receipt>();
        receipts.forEach(r => receiptMap.set(r.lesson_id, r));

        const itemsWithMeta = await Promise.all(
          lessons.map(async (lesson) => {
            const [slot, student] = await Promise.all([
              apiClient.getSlot(lesson.slot_id).catch(() => null),
              authUser?.role === 'tutor'
                ? apiClient.getUser(lesson.student_id).catch(() => undefined)
                : Promise.resolve(undefined),
            ]);

            return {
              lesson,
              slot: slot as Slot,
              student,
              receipt: receiptMap.get(lesson.id),
            };
          })
        );

        setItems(itemsWithMeta.filter((item) => item.slot !== null) as LessonWithMeta[]);
      } catch (err) {
        console.error('Failed to fetch payments data', err);
        toast.error('Не удалось загрузить платежи');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authUser]);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return !item.lesson.is_paid;
    if (filter === 'pending_verification') return !!item.receipt && !item.receipt.is_verified;
    if (filter === 'verified') return !!item.receipt && item.receipt.is_verified;
    return true;
  });

  const getPaymentBadge = (lesson: Lesson, receipt?: Receipt) => {
    if (lesson.is_paid && receipt?.is_verified) {
      return (
        <Badge variant="success" size="sm">
          <CheckCircle className="w-3 h-3 mr-1" />
          Подтверждено
        </Badge>
      );
    }
    if (receipt && !receipt.is_verified) {
      return (
        <Badge variant="warning" size="sm">
          <Clock className="w-3 h-3 mr-1" />
          На проверке
        </Badge>
      );
    }
    if (lesson.status === 'completed' && !lesson.is_paid) {
      return (
        <Badge variant="danger" size="sm">
          <XCircle className="w-3 h-3 mr-1" />
          Ожидает оплаты
        </Badge>
      );
    }
    return (
      <Badge variant="info" size="sm">
        <Clock className="w-3 h-3 mr-1" />
        {lesson.status === 'booked' ? 'Запланировано' : 'Не оплачено'}
      </Badge>
    );
  };

  if (!authUser) {
    return (
      <Layout>
        <Header title="Оплаты" />
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Оплаты" />

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
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
        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-16 h-16" />}
            title="Нет платежей"
            description="Платежи по выбранным фильтрам не найдены"
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map(({ lesson, slot, student, receipt }) => (
              <Card
                key={lesson.id}
                onClick={() => navigate(`/payments/${lesson.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold text-[var(--tg-theme-text-color,#000)] mb-1">
                        {lesson.price_rub?.toLocaleString() ?? '—'} ₽
                      </p>
                      <p className="text-sm text-[var(--tg-theme-hint-color,#999)] line-clamp-1">
                        {authUser.role === 'tutor' && student
                          ? `${student.first_name} ${student.last_name}`
                          : authUser.role === 'student'
                            ? 'Оплата занятия'
                            : ''}
                      </p>
                    </div>
                    {getPaymentBadge(lesson, receipt)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-[var(--tg-theme-hint-color,#999)]">
                      <Clock className="w-4 h-4" />
                      {formatDate(slot.starts_at)} в {formatTime(slot.starts_at)}
                    </div>

                    {authUser.role === 'student' && !lesson.is_paid && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          navigate(`/payments/${lesson.id}`);
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Оплатить
                      </Button>
                    )}
                  </div>

                  {receipt && (
                    <div className="flex items-center gap-1 text-xs text-[var(--tg-theme-hint-color,#999)]">
                      <ShieldCheck className="w-3 h-3" />
                      {receipt.is_verified ? 'Чек подтверждён' : 'Чек на проверке'}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
