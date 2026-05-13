import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Upload, Calendar } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, TextArea } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import type { User } from '../types';

export function AssignmentCreate() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [students, setStudents] = useState<User[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is tutor
  if (authUser && authUser.role !== 'tutor') {
    return (
      <Layout hideNav>
        <Header title="Нет доступа" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Только преподаватель может создавать задания
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  // Fetch students
  useEffect(() => {
    if (!authUser || authUser.role !== 'tutor') return;
    const currentUser = authUser;

    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        const tutorStudents = await apiClient.getTutorStudents(currentUser.id);
        const userPromises = tutorStudents.map((ts) =>
          apiClient.getUser(ts.student_id)
        );
        const userResults = await Promise.allSettled(userPromises);
        const resolvedUsers: User[] = userResults
          .filter((r): r is PromiseFulfilledResult<User> => r.status === 'fulfilled')
          .map((r) => r.value);
        setStudents(resolvedUsers);
        if (resolvedUsers.length > 0) {
          setSelectedStudentId(resolvedUsers[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
      } finally {
        setLoadingStudents(false);
      }
    }

    fetchStudents();
  }, [authUser]);

  const handleSubmit = async () => {
    if (!authUser || !selectedStudentId || !title.trim() || !description.trim() || !dueDate) {
      return;
    }

    setSubmitting(true);
    try {
      let fileId: string | undefined;

      // Mock file upload: if filename entered, initUpload to get file_id
      if (fileName.trim()) {
        const uploadResult = await apiClient.initUpload(fileName.trim());
        fileId = uploadResult.file_id;
      }

      // Build ISO datetime from dueDate + dueTime
      let dueDateIso: string;
      if (dueTime) {
        dueDateIso = new Date(`${dueDate}T${dueTime}:00`).toISOString();
      } else {
        // Use end of day if no time specified
        dueDateIso = new Date(`${dueDate}T23:59:00`).toISOString();
      }

      await apiClient.createAssignment({
        tutor_id: authUser.id,
        student_id: selectedStudentId,
        title: title.trim(),
        description: description.trim(),
        file_id: fileId,
        due_date: dueDateIso,
      });

      navigate('/assignments');
    } catch (err) {
      console.error('Failed to create assignment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = selectedStudentId && title.trim() && description.trim() && dueDate;

  return (
    <Layout hideNav>
      <Header title="Создать задание" showBack />

      <div className="p-4 space-y-4">
        {loadingStudents ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Student selector */}
            <Card>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000)]">
                  Ученик
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-input-background px-3 py-1 text-base text-[var(--tg-theme-text-color,#000)] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  {students.length === 0 && (
                    <option value="">Нет учеников</option>
                  )}
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Title */}
            <Input
              label="Название"
              placeholder="Введите название задания"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Description */}
            <TextArea
              label="Описание"
              placeholder="Введите описание задания"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />

            {/* Due date */}
            <Card>
              <div className="space-y-3">
                <Input
                  label="Дата сдачи"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <Input
                  label="Время сдачи (необязательно)"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </Card>

            {/* File upload (simplified mock) */}
            <Input
              label="Прикрепить файл (необязательно)"
              placeholder="Введите имя файла"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              icon={<Upload className="w-4 h-4" />}
              helperText="Введите имя файла для симуляции загрузки"
            />

            {/* Submit */}
            <Button
              fullWidth
              disabled={!isValid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Создание...' : 'Создать задание'}
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
