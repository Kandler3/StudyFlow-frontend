import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, Plus, Search, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { EmptyState } from '../components/ui/EmptyState';
import { students } from '../data/mockData';
import { Student } from '../types';

export function Students() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Student['status']>('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Student['status']) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Активен' },
      trial: { variant: 'info' as const, label: 'Пробное' },
      completed: { variant: 'default' as const, label: 'Закончил' },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const formatNextLesson = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Завтра в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <Header
        title="Ученики"
        action={
          <Button size="sm" onClick={() => navigate('/students/create')}>
            <Plus className="w-4 h-4" />
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Search */}
        <Input
          placeholder="Поиск учеников..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'Все' },
            { value: 'active', label: 'Активные' },
            { value: 'trial', label: 'Пробные' },
            { value: 'completed', label: 'Закончили' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === item.value
                  ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                  : 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title={searchQuery ? 'Ничего не найдено' : 'Нет учеников'}
            description={searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первого ученика'}
            action={
              !searchQuery && (
                <Button onClick={() => navigate('/students/create')}>
                  <Plus className="w-4 h-4" />
                  Добавить ученика
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[var(--tg-theme-text-color,#000)]">
                        {student.name}
                      </h3>
                      {getStatusBadge(student.status)}
                    </div>

                    {student.nextLesson && (
                      <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-hint-color,#999)] mb-2">
                        <Calendar className="w-4 h-4" />
                        {formatNextLesson(student.nextLesson)}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      {student.progress !== undefined && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#34c759]" />
                          <span className="text-[var(--tg-theme-text-color,#000)]">
                            {student.progress}%
                          </span>
                        </div>
                      )}
                      
                      {student.balance !== undefined && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                          <span className={student.balance < 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'}>
                            {student.balance > 0 ? '+' : ''}{student.balance} ₽
                          </span>
                        </div>
                      )}
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
