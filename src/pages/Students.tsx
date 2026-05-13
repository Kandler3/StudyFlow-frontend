import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Users, UserPlus, GraduationCap, Plus } from 'lucide-react';
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
import type { User, TutorStudent } from '../types';

interface RelationshipWithUser {
  relationship: TutorStudent;
  user: User;
}

export function Students() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [items, setItems] = useState<RelationshipWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'invited' | 'active'>('all');

  const fetchData = useCallback(async () => {
    if (!authUser) return;

    setLoading(true);
    try {
      if (authUser.role === 'tutor') {
        const relationships = await apiClient.getTutorStudents(authUser.id);
        const withUsers = await Promise.all(
          relationships.map(async (rel) => {
            const user = await apiClient.getUser(rel.student_id);
            return { relationship: rel, user };
          })
        );
        setItems(withUsers);
      } else {
        const relationships = await apiClient.getStudentTutors(authUser.id);
        const withUsers = await Promise.all(
          relationships.map(async (rel) => {
            const user = await apiClient.getUser(rel.tutor_id);
            return { relationship: rel, user };
          })
        );
        setItems(withUsers);
      }
    } catch (err) {
      console.error('Failed to fetch students data', err);
      toast.error('Не удалось загрузить список учеников');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = items.filter(({ relationship }) => {
    if (statusFilter === 'all') return true;
    return relationship.status === statusFilter;
  });

  const getStatusBadge = (status: 'invited' | 'active') => {
    if (status === 'active') {
      return <Badge variant="success" size="sm">Активен</Badge>;
    }
    return <Badge variant="warning" size="sm">Приглашён</Badge>;
  };

  const handleCardClick = (item: RelationshipWithUser) => {
    const targetId = authUser?.role === 'tutor'
      ? item.relationship.student_id
      : item.relationship.tutor_id;
    navigate(`/students/${targetId}`);
  };

  if (!authUser) {
    return (
      <Layout>
        <Header title="Ученики" />
        <LoadingSpinner />
      </Layout>
    );
  }

  const isTutor = authUser.role === 'tutor';
  const title = isTutor ? 'Ученики' : 'Преподаватели';

  return (
    <Layout>
      <Header
        title={title}
        action={
          isTutor && (
            <Button size="sm" onClick={() => navigate('/students/invite')}>
              <Plus className="w-4 h-4" />
            </Button>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[
            { value: 'all', label: 'Все' },
            { value: 'active', label: 'Активные' },
            { value: 'invited', label: 'Приглашённые' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value as typeof statusFilter)}
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

        {/* List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title={isTutor ? 'Нет учеников' : 'Нет преподавателей'}
            description={
              isTutor
                ? 'Пригласите первого ученика'
                : 'У вас пока нет преподавателей'
            }
            action={
              isTutor && statusFilter === 'all' && (
                <Button onClick={() => navigate('/students/invite')}>
                  <UserPlus className="w-4 h-4" />
                  Пригласить ученика
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card
                key={`${item.relationship.tutor_id}_${item.relationship.student_id}`}
                onClick={() => handleCardClick(item)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] flex-shrink-0">
                    {isTutor ? (
                      <GraduationCap className="w-6 h-6 text-[var(--tg-theme-button-color,#3390ec)]" />
                    ) : (
                      <Users className="w-6 h-6 text-[var(--tg-theme-button-color,#3390ec)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-[var(--tg-theme-text-color,#000)]">
                        {item.user.first_name} {item.user.last_name}
                      </h3>
                      {getStatusBadge(item.relationship.status)}
                    </div>

                    {isTutor && (
                      <div className="flex flex-wrap gap-3 text-sm text-[var(--tg-theme-hint-color,#999)]">
                        {item.relationship.lesson_price_rub !== undefined && (
                          <span>{item.relationship.lesson_price_rub} ₽ / занятие</span>
                        )}
                        {item.relationship.lesson_connection_link && (
                          <span className="truncate max-w-[200px]">
                            {item.relationship.lesson_connection_link}
                          </span>
                        )}
                      </div>
                    )}
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
