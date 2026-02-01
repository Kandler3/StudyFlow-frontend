import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Edit, Calendar, ClipboardList, CreditCard, MessageSquare, TrendingUp } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { students, lessons, assignments, payments } from '../data/mockData';

export function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'assignments' | 'payments'>('overview');
  
  const student = students.find((s) => s.id === id);
  const studentLessons = lessons.filter((l) => l.studentIds.includes(id || ''));
  const studentAssignments = assignments.filter((a) => a.studentId === id);
  const studentPayments = payments.filter((p) => p.studentId === id);

  if (!student) {
    return (
      <Layout hideNav>
        <Header title="Ученик не найден" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Запрошенный ученик не найден
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: TrendingUp },
    { id: 'lessons', label: 'Занятия', icon: Calendar, count: studentLessons.length },
    { id: 'assignments', label: 'Задания', icon: ClipboardList, count: studentAssignments.length },
    { id: 'payments', label: 'Оплаты', icon: CreditCard, count: studentPayments.length },
  ];

  return (
    <Layout hideNav>
      <Header
        title={student.name}
        showBack
        action={
          <Button size="sm" variant="ghost" onClick={() => navigate(`/students/${id}/edit`)}>
            <Edit className="w-4 h-4" />
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Student Info */}
        <Card>
          <div className="flex items-start gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000)] mb-2">
                {student.name}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                {student.status === 'active' && <Badge variant="success">Активен</Badge>}
                {student.status === 'trial' && <Badge variant="info">Пробное</Badge>}
                {student.status === 'completed' && <Badge variant="default">Закончил</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[var(--tg-theme-hint-color,#999)] mb-1">Прогресс</div>
                  <div className="font-semibold">{student.progress}%</div>
                </div>
                <div>
                  <div className="text-[var(--tg-theme-hint-color,#999)] mb-1">Баланс</div>
                  <div className={`font-semibold ${student.balance && student.balance < 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                    {student.balance && student.balance > 0 ? '+' : ''}{student.balance} ₽
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
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                  : 'bg-[var(--tg-theme-bg-color,#fff)] text-[var(--tg-theme-text-color,#000)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <Card>
              <h3 className="font-semibold mb-3">Статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                  <div className="text-2xl font-bold text-[var(--tg-theme-button-color,#3390ec)]">
                    {studentLessons.length}
                  </div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mt-1">
                    Занятий всего
                  </div>
                </div>
                <div className="text-center p-4 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl">
                  <div className="text-2xl font-bold text-[var(--tg-theme-button-color,#3390ec)]">
                    {studentAssignments.filter(a => a.status === 'reviewed').length}
                  </div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mt-1">
                    Заданий выполнено
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-3">Ближайшее занятие</h3>
              {student.nextLesson ? (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                  <div>
                    <div className="font-medium">
                      {new Date(student.nextLesson).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  Нет запланированных занятий
                </p>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-3">
            {studentLessons.length === 0 ? (
              <Card>
                <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
                  Занятий пока нет
                </p>
              </Card>
            ) : (
              studentLessons.map((lesson) => (
                <Card key={lesson.id} onClick={() => navigate(`/schedule/${lesson.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{lesson.title}</h4>
                    <Badge variant={lesson.status === 'completed' ? 'success' : 'info'} size="sm">
                      {lesson.status === 'completed' ? 'Проведено' : 'Запланировано'}
                    </Badge>
                  </div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {new Date(lesson.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {lesson.time}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-3">
            {studentAssignments.length === 0 ? (
              <Card>
                <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
                  Заданий пока нет
                </p>
              </Card>
            ) : (
              studentAssignments.map((assignment) => (
                <Card key={assignment.id} onClick={() => navigate(`/assignments/${assignment.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{assignment.title}</h4>
                    <Badge
                      variant={
                        assignment.status === 'reviewed' ? 'success' :
                        assignment.status === 'submitted' ? 'info' :
                        'default'
                      }
                      size="sm"
                    >
                      {assignment.status === 'reviewed' ? 'Проверено' :
                       assignment.status === 'submitted' ? 'Сдано' :
                       'Новое'}
                    </Badge>
                  </div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    Срок: {new Date(assignment.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {studentPayments.length === 0 ? (
              <Card>
                <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
                  Платежей пока нет
                </p>
              </Card>
            ) : (
              studentPayments.map((payment) => (
                <Card key={payment.id} onClick={() => navigate(`/payments/${payment.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{payment.amount} ₽</h4>
                      <p className="text-sm text-[var(--tg-theme-hint-color,#999)] mt-1">
                        {payment.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        payment.status === 'paid' ? 'success' :
                        payment.status === 'overdue' ? 'danger' :
                        'warning'
                      }
                      size="sm"
                    >
                      {payment.status === 'paid' ? 'Оплачено' :
                       payment.status === 'overdue' ? 'Просрочено' :
                       'Ожидает'}
                    </Badge>
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
