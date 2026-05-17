import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Upload, Calendar, Loader2, FileText, X } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, TextArea } from '../components/ui/input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import type { User } from '../types';

export function AssignmentCreate() {
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [students, setStudents] = useState<User[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast.error('Не удалось загрузить список учеников');
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

      if (selectedFile) {
        setUploading(true);
        const { file_id, upload_url } = await apiClient.initUpload(authUser.id, selectedFile.name);
        await apiClient.uploadFile(upload_url, selectedFile);
        await apiClient.confirmUpload(file_id);
        fileId = file_id;
        setUploading(false);
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
      toast.error('Не удалось создать задание');
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

            {/* File upload */}
            <Card>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000)]">
                  Прикрепить файл (необязательно)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.mp3,.mp4,.wav,.zip,.rar"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-[var(--tg-theme-text-color,#000)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--tg-theme-button-color,#3390ec)] file:text-white"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-[var(--tg-theme-hint-color,#999)]">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                    <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Submit */}
            <Button
              fullWidth
              disabled={!isValid || submitting}
              onClick={handleSubmit}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Загрузка файла...</>
              ) : submitting ? (
                'Создание...'
              ) : (
                'Создать задание'
              )}
            </Button>
          </>
        )}
      </div>
    </Layout>
  );
}
