import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/ui/EmptyState';
import { payments } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { PaymentStatus } from '../types';

export function Payments() {
  const navigate = useNavigate();
  const { userRole } = useApp();
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  // Calculate totals
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOverdue = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      paid: { variant: 'success' as const, label: 'Оплачено', icon: CheckCircle },
      pending: { variant: 'warning' as const, label: 'Ожидает', icon: Clock },
      overdue: { variant: 'danger' as const, label: 'Просрочено', icon: AlertCircle },
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
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <Header
        title="Оплаты"
        action={
          userRole === 'tutor' && (
            <Button size="sm" onClick={() => navigate('/payments/create')}>
              <Plus className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        {userRole === 'tutor' && (
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md">
              <div className="text-center">
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                  Ожидается
                </div>
                <div className="text-2xl font-bold text-[#ff9500]">
                  {totalPending.toLocaleString()} ₽
                </div>
              </div>
            </Card>
            <Card padding="md">
              <div className="text-center">
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                  Просрочено
                </div>
                <div className="text-2xl font-bold text-[#ff3b30]">
                  {totalOverdue.toLocaleString()} ₽
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'Все' },
            { value: 'pending', label: 'Ожидают' },
            { value: 'overdue', label: 'Просрочены' },
            { value: 'paid', label: 'Оплачены' },
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

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-16 h-16" />}
            title="Нет платежей"
            description="Платежи по выбранным фильтрам не найдены"
            action={
              userRole === 'tutor' && (
                <Button onClick={() => navigate('/payments/create')}>
                  <Plus className="w-4 h-4" />
                  Создать платеж
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <Card
                key={payment.id}
                onClick={() => navigate(`/payments/${payment.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-bold text-[var(--tg-theme-text-color,#000)] mb-1">
                        {payment.amount.toLocaleString()} ₽
                      </h4>
                      <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                        {payment.description}
                      </p>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-[var(--tg-theme-text-color,#000)]">
                      {userRole === 'tutor' ? payment.studentName : 'Для вас'}
                    </div>
                    <div className="text-[var(--tg-theme-hint-color,#999)]">
                      {payment.status === 'paid' && payment.paidAt
                        ? `Оплачено ${formatDate(payment.paidAt)}`
                        : `Срок: ${formatDate(payment.dueDate)}`}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
