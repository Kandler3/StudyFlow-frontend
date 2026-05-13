import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

type Period = 'week' | 'month' | 'year';

interface TutorMetrics {
  totalLessons: number;
  completedLessons: number;
  bookedLessons: number;
  cancelledLessons: number;
  activeStudents: number;
  verifiedReceiptsSum: number;
}

interface StudentMetrics {
  totalLessons: number;
  completedLessons: number;
  activeAssignments: number;
}

export function Analytics() {
  const { authUser } = useApp();
  const [period, setPeriod] = useState<Period>('month');
  const [tutorMetrics, setTutorMetrics] = useState<TutorMetrics | null>(null);
  const [studentMetrics, setStudentMetrics] = useState<StudentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    loadMetrics();
  }, [authUser]);

  const loadMetrics = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      if (authUser.role === 'tutor') {
        await loadTutorMetrics();
      } else {
        await loadStudentMetrics();
      }
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTutorMetrics = async () => {
    if (!authUser) return;
    const lessons = await apiClient.getLessons({ tutor_id: authUser.id });
    const students = await apiClient.getTutorStudents(authUser.id);
    const receipts = await apiClient.getReceipts({ tutor_id: authUser.id });

    setTutorMetrics({
      totalLessons: lessons.length,
      completedLessons: lessons.filter(l => l.status === 'completed').length,
      bookedLessons: lessons.filter(l => l.status === 'booked').length,
      cancelledLessons: lessons.filter(l => l.status === 'cancelled').length,
      activeStudents: students.filter(s => s.status === 'active').length,
      verifiedReceiptsSum: receipts
        .filter(r => r.is_verified)
        .reduce((sum, r) => sum + r.price_rub, 0),
    });
  };

  const loadStudentMetrics = async () => {
    if (!authUser) return;
    const lessons = await apiClient.getLessons({ student_id: authUser.id });
    const assignments = await apiClient.getAssignments({ student_id: authUser.id });

    setStudentMetrics({
      totalLessons: lessons.length,
      completedLessons: lessons.filter(l => l.status === 'completed').length,
      activeAssignments: assignments.length,
    });
  };

  const periodLabels: { value: Period; label: string }[] = [
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'year', label: 'Год' },
  ];

  if (!authUser) return null;

  return (
    <Layout hideNav>
      <Header title="Аналитика" showBack />

      <div className="p-4 space-y-4">
        {/* Period Filter (decorative) */}
        <div className="flex gap-2">
          {periodLabels.map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value)}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === item.value
                  ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                  : 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : authUser.role === 'tutor' && tutorMetrics ? (
          <TutorAnalytics metrics={tutorMetrics} />
        ) : authUser.role === 'student' && studentMetrics ? (
          <StudentAnalytics metrics={studentMetrics} />
        ) : null}
      </div>
    </Layout>
  );
}

function TutorAnalytics({ metrics }: { metrics: TutorMetrics }) {
  const stats = [
    {
      icon: Calendar,
      label: 'Всего занятий',
      value: metrics.totalLessons.toString(),
      color: 'text-[#3390ec]',
      bg: 'bg-[#3390ec]/10',
    },
    {
      icon: TrendingUp,
      label: 'Проведено',
      value: metrics.completedLessons.toString(),
      color: 'text-[#34c759]',
      bg: 'bg-[#34c759]/10',
    },
    {
      icon: Users,
      label: 'Активных учеников',
      value: metrics.activeStudents.toString(),
      color: 'text-[#ff9500]',
      bg: 'bg-[#ff9500]/10',
    },
    {
      icon: DollarSign,
      label: 'Подтверждено чеков (сумма)',
      value: `${metrics.verifiedReceiptsSum.toLocaleString()} ₽`,
      color: 'text-[#af52de]',
      bg: 'bg-[#af52de]/10',
    },
  ];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} padding="md">
            <div className="space-y-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--tg-theme-text-color,#000)] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--tg-theme-hint-color,#999)]">
                  {stat.label}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Lesson Details */}
      <Card>
        <h3 className="font-semibold mb-4">Занятия</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
            <div>
              <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">Всего</div>
              <div className="text-xl font-bold">{metrics.totalLessons}</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
            <div>
              <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">Запланировано</div>
              <div className="text-xl font-bold text-[#3390ec]">{metrics.bookedLessons}</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
            <div>
              <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">Отменено</div>
              <div className="text-xl font-bold text-[#ff3b30]">{metrics.cancelledLessons}</div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}

function StudentAnalytics({ metrics }: { metrics: StudentMetrics }) {
  const stats = [
    {
      icon: Calendar,
      label: 'Всего занятий',
      value: metrics.totalLessons.toString(),
      color: 'text-[#3390ec]',
      bg: 'bg-[#3390ec]/10',
    },
    {
      icon: TrendingUp,
      label: 'Проведено',
      value: metrics.completedLessons.toString(),
      color: 'text-[#34c759]',
      bg: 'bg-[#34c759]/10',
    },
    {
      icon: Users,
      label: 'Активных заданий',
      value: metrics.activeAssignments.toString(),
      color: 'text-[#ff9500]',
      bg: 'bg-[#ff9500]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} padding="md">
          <div className="space-y-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--tg-theme-text-color,#000)] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--tg-theme-hint-color,#999)]">
                {stat.label}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
