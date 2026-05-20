import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Edit, Calendar, BookOpen, Receipt, Info, Clock, Users, Video, CreditCard } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import type { User, TutorStudent, Lesson, Slot, Assignment, Receipt as ReceiptType } from '../types';
import { formatDate, formatTime } from '../types';

interface LessonWithSlot {
  lesson: Lesson;
  slot: Slot;
}

type TabId = 'info' | 'lessons' | 'assignments' | 'receipts';

export function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [user, setUser] = useState<User | null>(null);
  const [relationship, setRelationship] = useState<TutorStudent | null>(null);
  const [lessons, setLessons] = useState<LessonWithSlot[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('info');

  const fetchData = useCallback(async () => {
    if (!authUser || !studentId) return;

    setLoading(true);
    setError(null);
    try {
      // Load user and relationship first — if these fail, show "not found"
      const [userData] = await Promise.all([
        apiClient.getUser(studentId),
      ]);
      setUser(userData);

      let rel: TutorStudent | undefined;
      try {
        if (authUser.role === 'tutor') {
          rel = await apiClient.getTutorStudent(authUser.id, studentId);
        } else {
          const tutors = await apiClient.getStudentTutors(authUser.id);
          rel = tutors.find((t) => t.tutor_id === studentId);
        }
      } catch {
        // relationship is optional — leave as null
      }
      setRelationship(rel ?? null);

      // Load lessons, assignments, receipts — failures here are non-critical
      try {
        const [lessonData, assignmentData, receiptData] = await Promise.all([
          apiClient.getLessons({ student_id: studentId }),
          apiClient.getAssignments({ student_id: studentId }),
          apiClient.getReceipts({ student_id: studentId }),
        ]);

        setAssignments(assignmentData);
        setReceipts(receiptData);

        const lessonsWithSlots: LessonWithSlot[] = [];
        for (const lesson of lessonData) {
          try {
            const slot = await apiClient.getSlot(lesson.slot_id);
            lessonsWithSlots.push({ lesson, slot });
          } catch {
            // skip this lesson if slot can't be loaded
          }
        }
        setLessons(lessonsWithSlots);
      } catch {
        // non-critical — leave empty arrays
      }
    } catch (err) {
      console.error('Failed to fetch student detail', err);
      setError('Не удалось загрузить данные ученика');
    } finally {
      setLoading(false);
    }
  }, [authUser, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isTutor = authUser?.role === 'tutor';
  const stats = {
    totalLessons: lessons.length,
    completedLessons: lessons.filter((l) => l.lesson.status === 'completed').length,
    activeAssignments: assignments.filter((a) => {
      const now = new Date();
      const due = new Date(a.due_date);
      return now <= due;
    }).length,
  };

  const getLessonStatusBadge = (status: Lesson['status']) => {
    const config: Record<Lesson['status'], { variant: 'info' | 'success' | 'danger'; label: string }> = {
      booked: { variant: 'info', label: 'Запланировано' },
      completed: { variant: 'success', label: 'Проведено' },
      cancelled: { variant: 'danger', label: 'Отменено' },
    };
    const cfg = config[status];
    return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
  };

  const getAssignmentStatusBadge = (assignment: Assignment): { variant: 'info' | 'success' | 'danger' | 'warning'; label: string } => {
    const now = new Date();
    const due = new Date(assignment.due_date);
    if (now > due) {
      return { variant: 'danger', label: 'Просрочено' };
    }
    return { variant: 'info', label: 'Ожидает' };
  };

  if (loading) {
    return (
      <Layout hideNav>
        <Header title="Детали ученика" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout hideNav>
        <Header title="Ученик не найден" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              {error || 'Запрошенный ученик не найден'}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'info', label: 'Инфо', icon: Info },
    { id: 'lessons', label: 'Занятия', icon: Calendar },
    { id: 'assignments', label: 'Задания', icon: BookOpen },
    { id: 'receipts', label: 'Чеки', icon: Receipt },
  ];

  return (
    <Layout hideNav>
      <Header
        title={`${user.first_name} ${user.last_name}`}
        showBack
        action={
          isTutor && relationship && (
            <Button size="sm" variant="ghost" onClick={() => navigate(`/students/${studentId}/edit`)}>
              <Edit className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Student Info Card */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] flex-shrink-0">
              <Users className="w-8 h-8 text-[var(--tg-theme-button-color,#3390ec)]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000)] mb-2">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {user.status === 'active' ? (
                  <Badge variant="success" size="sm">Активен</Badge>
                ) : (
                  <Badge variant="danger" size="sm">Удалён</Badge>
                )}
                {relationship && (
                  relationship.status === 'active' ? (
                    <Badge variant="success" size="sm">Связь активна</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Приглашён</Badge>
                  )
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                  <div className="text-lg font-bold text-[var(--tg-theme-button-color,#3390ec)]">
                    {stats.totalLessons}
                  </div>
                  <div className="text-xs text-[var(--tg-theme-hint-color,#999)] mt-0.5">
                    Занятий
                  </div>
                </div>
                <div className="text-center p-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                  <div className="text-lg font-bold text-[#34c759]">
                    {stats.completedLessons}
                  </div>
                  <div className="text-xs text-[var(--tg-theme-hint-color,#999)] mt-0.5">
                    Проведено
                  </div>
                </div>
                <div className="text-center p-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                  <div className="text-lg font-bold text-[var(--tg-theme-button-color,#3390ec)]">
                    {stats.activeAssignments}
                  </div>
                  <div className="text-xs text-[var(--tg-theme-hint-color,#999)] mt-0.5">
                    Активных
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                  : 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Relationship Details (tutor only) */}
            {isTutor && relationship && (
              <Card>
                <h3 className="font-semibold mb-3 text-[var(--tg-theme-text-color,#000)]">
                  Параметры пары
                </h3>
                <div className="space-y-3">
                  {relationship.lesson_price_rub !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">Цена за занятие</span>
                      <span className="font-medium">{relationship.lesson_price_rub} ₽</span>
                    </div>
                  )}
                  {relationship.lesson_connection_link && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm text-[var(--tg-theme-hint-color,#999)] shrink-0">Ссылка</span>
                      <a
                        href={relationship.lesson_connection_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--tg-theme-button-color,#3390ec)] break-all text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {relationship.lesson_connection_link}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {!relationship && (
              <Card>
                <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
                  Нет активной связи с преподавателем
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-3">
            {lessons.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-12 h-12" />}
                title="Нет занятий"
                description="У ученика пока нет занятий"
              />
            ) : (
              lessons.map(({ lesson, slot }) => (
                <Card
                  key={lesson.id}
                  onClick={() => navigate(`/schedule/${lesson.id}`)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(slot.starts_at)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-text-color,#000)]">
                          <Clock className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                          {formatTime(slot.starts_at)} — {formatTime(slot.ends_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getLessonStatusBadge(lesson.status)}
                        {lesson.is_paid ? (
                          <Badge variant="success" size="sm">Оплачено</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Не оплачено</Badge>
                        )}
                      </div>
                    </div>

                    {lesson.connection_link && (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-[var(--tg-theme-hint-color,#999)]" />
                        <span className="text-[var(--tg-theme-hint-color,#999)] truncate">
                          {lesson.connection_link}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-12 h-12" />}
                title="Нет заданий"
                description="У ученика пока нет заданий"
              />
            ) : (
              assignments.map((assignment) => {
                const statusInfo = getAssignmentStatusBadge(assignment);
                return (
                  <Card
                    key={assignment.id}
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-[var(--tg-theme-text-color,#000)]">
                          {assignment.title}
                        </h4>
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {assignment.description && (
                        <p className="text-sm text-[var(--tg-theme-hint-color,#999)] line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                        Срок: {formatDate(assignment.due_date)}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="space-y-3">
            {receipts.length === 0 ? (
              <EmptyState
                icon={<Receipt className="w-12 h-12" />}
                title="Нет чеков"
                description="Чеки пока не загружены"
              />
            ) : (
              receipts.map((receipt) => (
                <Card key={receipt.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                        <span className="font-semibold">{receipt.price_rub} ₽</span>
                      </div>
                      {receipt.is_verified ? (
                        <Badge variant="success" size="sm">Подтверждён</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Ожидает проверки</Badge>
                      )}
                    </div>
                    <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                      {formatDate(receipt.created_at)}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
