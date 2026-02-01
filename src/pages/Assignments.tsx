import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/ui/EmptyState';
import { assignments } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { AssignmentStatus } from '../types';

export function Assignments() {
  const navigate = useNavigate();
  const { userRole } = useApp();
  const [filter, setFilter] = useState<'all' | AssignmentStatus>('all');

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const getStatusBadge = (status: AssignmentStatus) => {
    const statusConfig = {
      new: { variant: 'info' as const, label: 'Новое', icon: AlertCircle },
      in_progress: { variant: 'warning' as const, label: 'В работе', icon: Clock },
      submitted: { variant: 'info' as const, label: 'Сдано', icon: FileText },
      reviewed: { variant: 'success' as const, label: 'Проверено', icon: CheckCircle },
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} size="sm">
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDeadline = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Просрочено', isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Сегодня', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Завтра', isOverdue: false };
    } else if (diffDays <= 7) {
      return { text: `Через ${diffDays} дн.`, isOverdue: false };
    }
    
    return { 
      text: deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      isOverdue: false 
    };
  };

  return (
    <Layout>
      <Header
        title="Задания"
        action={
          userRole === 'tutor' && (
            <Button size="sm" onClick={() => navigate('/assignments/create')}>
              <Plus className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'Все' },
            { value: 'new', label: 'Новые' },
            { value: 'in_progress', label: 'В работе' },
            { value: 'submitted', label: 'Сданы' },
            { value: 'reviewed', label: 'Проверены' },
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

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-16 h-16" />}
            title="Нет заданий"
            description="Задания по выбранным фильтрам не найдены"
            action={
              userRole === 'tutor' && (
                <Button onClick={() => navigate('/assignments/create')}>
                  <Plus className="w-4 h-4" />
                  Создать задание
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => {
              const deadline = formatDeadline(assignment.deadline);
              
              return (
                <Card
                  key={assignment.id}
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--tg-theme-text-color,#000)] mb-1">
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-[var(--tg-theme-hint-color,#999)] line-clamp-2">
                          {assignment.description}
                        </p>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-[var(--tg-theme-text-color,#000)]">
                        {userRole === 'tutor' ? assignment.studentName : 'Для вас'}
                      </div>
                      <div className={`flex items-center gap-1 ${deadline.isOverdue ? 'text-[#ff3b30]' : 'text-[var(--tg-theme-hint-color,#999)]'}`}>
                        <Clock className="w-4 h-4" />
                        {deadline.text}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <Badge variant="default" size="sm">
                          <FileText className="w-3 h-3 mr-1" />
                          {assignment.attachments.length} файл(ов)
                        </Badge>
                      )}
                      {assignment.feedback?.grade && (
                        <Badge variant="success" size="sm">
                          Оценка: {assignment.feedback.grade}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
