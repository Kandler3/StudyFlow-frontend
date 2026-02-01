import React, { useState } from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Award } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { analytics, lessons, students, payments } from '../data/mockData';

export function Analytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const scheduledLessons = lessons.filter(l => l.status === 'scheduled').length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      icon: DollarSign,
      label: 'Доход (оплачено)',
      value: `${totalRevenue.toLocaleString()} ₽`,
      trend: '+12%',
      color: 'text-[#34c759]',
      bg: 'bg-[#34c759]/10',
    },
    {
      icon: Calendar,
      label: 'Занятий проведено',
      value: completedLessons,
      trend: '+8%',
      color: 'text-[#3390ec]',
      bg: 'bg-[#3390ec]/10',
    },
    {
      icon: Users,
      label: 'Активных учеников',
      value: students.filter(s => s.status === 'active').length,
      trend: '+3',
      color: 'text-[#ff9500]',
      bg: 'bg-[#ff9500]/10',
    },
    {
      icon: Award,
      label: 'Средняя посещаемость',
      value: `${analytics.attendance}%`,
      trend: '+2%',
      color: 'text-[#af52de]',
      bg: 'bg-[#af52de]/10',
    },
  ];

  return (
    <Layout hideNav>
      <Header title="Аналитика" showBack />

      <div className="p-4 space-y-4">
        {/* Period Filter */}
        <div className="flex gap-2">
          {[
            { value: 'week', label: 'Неделя' },
            { value: 'month', label: 'Месяц' },
            { value: 'year', label: 'Год' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value as any)}
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
                  <div className="text-xs text-[var(--tg-theme-hint-color,#999)] mb-1">
                    {stat.label}
                  </div>
                  <div className={`text-xs font-medium ${stat.color}`}>
                    {stat.trend}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Revenue Card */}
        <Card>
          <h3 className="font-semibold mb-4">Финансы</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
              <div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                  Получено
                </div>
                <div className="text-xl font-bold text-[#34c759]">
                  {totalRevenue.toLocaleString()} ₽
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-[#34c759]" />
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
              <div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                  Ожидается
                </div>
                <div className="text-xl font-bold text-[#ff9500]">
                  {pendingRevenue.toLocaleString()} ₽
                </div>
              </div>
              <DollarSign className="w-6 h-6 text-[#ff9500]" />
            </div>
          </div>
        </Card>

        {/* Lessons Card */}
        <Card>
          <h3 className="font-semibold mb-4">Занятия</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  Проведено
                </span>
                <span className="font-semibold">{completedLessons}</span>
              </div>
              <div className="h-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#34c759] rounded-full"
                  style={{ width: `${(completedLessons / lessons.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  Запланировано
                </span>
                <span className="font-semibold">{scheduledLessons}</span>
              </div>
              <div className="h-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3390ec] rounded-full"
                  style={{ width: `${(scheduledLessons / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Students Card */}
        <Card>
          <h3 className="font-semibold mb-4">Ученики по статусу</h3>
          <div className="space-y-3">
            {[
              { 
                label: 'Активные', 
                value: students.filter(s => s.status === 'active').length,
                color: 'bg-[#34c759]',
              },
              { 
                label: 'Пробные', 
                value: students.filter(s => s.status === 'trial').length,
                color: 'bg-[#3390ec]',
              },
              { 
                label: 'Закончили', 
                value: students.filter(s => s.status === 'completed').length,
                color: 'bg-[var(--tg-theme-hint-color,#999)]',
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
