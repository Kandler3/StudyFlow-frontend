import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, FileText, AlertTriangle } from 'lucide-react';
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
import { computeAssignmentStatus, formatDate } from '../types';
import type { Assignment, Submission, Feedback, User, AssignmentStatus } from '../types';

interface AssignmentWithMeta {
  assignment: Assignment;
  submission?: Submission;
  feedback?: Feedback;
  student?: User;
  status: AssignmentStatus;
}

const FILTERS: { value: 'all' | AssignmentStatus; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'UNSENT', label: 'Не отправлено' },
  { value: 'OVERDUE', label: 'Просрочено' },
  { value: 'UNREVIEWED', label: 'На проверке' },
  { value: 'REVIEWED', label: 'Проверено' },
];

export function Assignments() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [items, setItems] = useState<AssignmentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | AssignmentStatus>('all');

  useEffect(() => {
    if (!authUser) return;
    const currentUser = authUser;

    async function fetchData() {
      setLoading(true);
      try {
        const filters = currentUser.role === 'tutor'
          ? { tutor_id: currentUser.id }
          : { student_id: currentUser.id };

        const assignments = await apiClient.getAssignments(filters);

        const itemsWithMeta = await Promise.all(
          assignments.map(async (assignment) => {
            const [subs, fbs] = await Promise.all([
              apiClient.getSubmissions(assignment.id),
              apiClient.getFeedbacks(assignment.id),
            ]);

            const submission = subs[0];
            const feedback = fbs[0];
            const status = computeAssignmentStatus(assignment, submission, feedback);

            let student: User | undefined;
            if (currentUser.role === 'tutor') {
              try {
                student = await apiClient.getUser(assignment.student_id);
              } catch {
                // student lookup failed silently
              }
            }

            return { assignment, submission, feedback, student, status };
          })
        );

        setItems(itemsWithMeta);
      } catch (err) {
        console.error('Failed to fetch assignments', err);
        toast.error('Не удалось загрузить задания');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authUser]);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status: AssignmentStatus) => {
    const config: Record<AssignmentStatus, { variant: 'info' | 'warning' | 'danger' | 'success'; label: string }> = {
      UNSENT: { variant: 'info', label: 'Не отправлено' },
      OVERDUE: { variant: 'danger', label: 'Просрочено' },
      UNREVIEWED: { variant: 'warning', label: 'На проверке' },
      REVIEWED: { variant: 'success', label: 'Проверено' },
    };
    const cfg = config[status];
    return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    const icons: Record<AssignmentStatus, React.ReactNode> = {
      UNSENT: <FileText className="w-16 h-16" />,
      OVERDUE: <AlertTriangle className="w-16 h-16" />,
      UNREVIEWED: <Clock className="w-16 h-16" />,
      REVIEWED: <CheckCircle className="w-16 h-16" />,
    };
    return icons[status];
  };

  if (!authUser) {
    return (
      <Layout>
        <Header title="Задания" />
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title="Задания"
        action={
          authUser.role === 'tutor' && (
            <Button size="sm" onClick={() => navigate('/assignments/create')}>
              <Plus className="w-4 h-4" />
            </Button>
          )
        }
      />

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

        {/* Assignments List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={getStatusIcon(filter === 'all' ? 'UNSENT' : filter)}
            title="Нет заданий"
            description="Задания по выбранным фильтрам не найдены"
            action={
              authUser.role === 'tutor' && items.length === 0 && (
                <Button onClick={() => navigate('/assignments/create')}>
                  <Plus className="w-4 h-4" />
                  Создать задание
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map(({ assignment, student, status }) => (
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
                    {getStatusBadge(status)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-[var(--tg-theme-text-color,#000)]">
                      {authUser.role === 'tutor' && student
                        ? `${student.first_name} ${student.last_name}`
                        : authUser.role === 'student'
                          ? 'Для вас'
                          : ''}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--tg-theme-hint-color,#999)]">
                      <Clock className="w-4 h-4" />
                      {formatDate(assignment.due_date)}
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
