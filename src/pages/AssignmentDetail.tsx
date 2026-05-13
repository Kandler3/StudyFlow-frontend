import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, User as UserIcon, FileText, Upload, MessageSquare, CheckCircle, AlertCircle, AlertTriangle, Download } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input, TextArea } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { computeAssignmentStatus, formatDate, formatTime } from '../types';
import type { Assignment, Submission, Feedback, User, AssignmentStatus } from '../types';

export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitComment, setSubmitComment] = useState('');
  const [submitFileName, setSubmitFileName] = useState('');
  const [submitSaving, setSubmitSaving] = useState(false);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFileName, setReviewFileName] = useState('');
  const [reviewGrade, setReviewGrade] = useState<number | undefined>(undefined);
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    if (!id || !authUser) return;
    const currentId = id;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const assignmentData = await apiClient.getAssignment(currentId);
        setAssignment(assignmentData);

        const studentData = await apiClient.getUser(assignmentData.student_id);
        setStudent(studentData);

        const [subs, fbs] = await Promise.all([
          apiClient.getSubmissions(currentId),
          apiClient.getFeedbacks(currentId),
        ]);
        setSubmissions(subs);
        setFeedbacks(fbs);
      } catch (err) {
        console.error('Failed to fetch assignment', err);
        setError('Задание не найдено');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, authUser]);

  // Derived state
  const currentSubmission: Submission | undefined = submissions[0];
  const currentFeedback: Feedback | undefined = feedbacks[0];
  const status: AssignmentStatus = assignment
    ? computeAssignmentStatus(assignment, currentSubmission, currentFeedback)
    : 'UNSENT';

  const isTutor = authUser?.role === 'tutor';

  // Submission handlers
  const handleSubmitAssignment = async () => {
    if (!id || !authUser) return;
    setSubmitSaving(true);
    try {
      let fileId: string | undefined;
      if (submitFileName.trim()) {
        const uploadResult = await apiClient.initUpload(submitFileName.trim());
        fileId = uploadResult.file_id;
      }

      const newSub = await apiClient.createSubmission({
        assignment_id: id,
        file_id: fileId,
        comment: submitComment.trim() || undefined,
      });

      setSubmissions([newSub]);
      setShowSubmitModal(false);
      setSubmitComment('');
      setSubmitFileName('');

      // Refetch feedbacks (should be none, but ensure consistency)
      const fbs = await apiClient.getFeedbacks(id);
      setFeedbacks(fbs);
    } catch (err) {
      console.error('Failed to submit assignment', err);
      toast.error('Не удалось отправить задание');
    } finally {
      setSubmitSaving(false);
    }
  };

  // Review handlers
  const handleReview = async () => {
    if (!currentSubmission || !authUser) return;
    setReviewSaving(true);
    try {
      let fileId: string | undefined;
      if (reviewFileName.trim()) {
        const uploadResult = await apiClient.initUpload(reviewFileName.trim());
        fileId = uploadResult.file_id;
      }

      const newFb = await apiClient.createFeedback({
        submission_id: currentSubmission.id,
        file_id: fileId,
        comment: reviewComment.trim() || undefined,
        grade: reviewGrade,
      });

      setFeedbacks([newFb]);
      setShowReviewModal(false);
      setReviewComment('');
      setReviewFileName('');
      setReviewGrade(undefined);
    } catch (err) {
      console.error('Failed to create feedback', err);
      toast.error('Не удалось отправить отзыв');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleUpdateFeedback = async () => {
    if (!currentFeedback) return;
    setReviewSaving(true);
    try {
      let fileId: string | undefined;
      if (reviewFileName.trim()) {
        const uploadResult = await apiClient.initUpload(reviewFileName.trim());
        fileId = uploadResult.file_id;
      }

      const updated = await apiClient.updateFeedback(currentFeedback.id, {
        file_id: fileId || currentFeedback.file_id,
        comment: reviewComment.trim() || undefined,
        grade: reviewGrade ?? currentFeedback.grade,
      });

      setFeedbacks([updated]);
      setShowReviewModal(false);
      setReviewComment('');
      setReviewFileName('');
      setReviewGrade(undefined);
    } catch (err) {
      console.error('Failed to update feedback', err);
      toast.error('Не удалось обновить отзыв');
    } finally {
      setReviewSaving(false);
    }
  };

  const openReviewModal = () => {
    setReviewComment(currentFeedback?.comment || '');
    setReviewFileName('');
    setReviewGrade(currentFeedback?.grade || undefined);
    setShowReviewModal(true);
  };

  // Status badge helper
  const getStatusBadge = (s: AssignmentStatus) => {
    const config: Record<AssignmentStatus, { variant: 'info' | 'warning' | 'danger' | 'success'; label: string }> = {
      UNSENT: { variant: 'info', label: 'Не отправлено' },
      OVERDUE: { variant: 'danger', label: 'Просрочено' },
      UNREVIEWED: { variant: 'warning', label: 'На проверке' },
      REVIEWED: { variant: 'success', label: 'Проверено' },
    };
    const cfg = config[s];
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  // Loading state
  if (loading) {
    return (
      <Layout hideNav>
        <Header title="Детали задания" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  // Error / Not found state
  if (error || !assignment || !student) {
    return (
      <Layout hideNav>
        <Header title="Задание не найдено" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              {error || 'Запрошенное задание не найдено'}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <Header title="Детали задания" showBack />

      <div className="p-4 space-y-4">
        {/* Main Info */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--tg-theme-text-color,#000)] mb-3">
                {assignment.title}
              </h2>
              <div className="flex gap-2">
                {getStatusBadge(status)}
              </div>
            </div>

            <div className="space-y-3">
              {/* Due date */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">Срок сдачи</div>
                  <div className="font-medium">
                    {formatDate(assignment.due_date)} в {formatTime(assignment.due_date)}
                  </div>
                </div>
              </div>

              {/* Student name */}
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {isTutor ? 'Ученик' : 'Преподаватель'}
                  </div>
                  <div className="font-medium">
                    {student.first_name} {student.last_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card>
          <h3 className="font-semibold mb-3">Описание</h3>
          <p className="text-[var(--tg-theme-text-color,#000)] whitespace-pre-wrap">
            {assignment.description}
          </p>
        </Card>

        {/* File attachment from tutor */}
        {assignment.file_id && (
          <Card>
            <h3 className="font-semibold mb-3">Прикрепленный файл</h3>
            <a
              href={apiClient.getFileUrl(assignment.file_id)}
              download
              className="flex items-center gap-3 p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <FileText className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
              <span className="flex-1 text-sm">Скачать файл</span>
              <Download className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
            </a>
          </Card>
        )}

        {/* Submission section (student's work) */}
        {currentSubmission && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Ответ ученика</h3>
              <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                {new Date(currentSubmission.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {currentSubmission.comment && (
              <p className="text-[var(--tg-theme-text-color,#000)] mb-3 whitespace-pre-wrap">
                {currentSubmission.comment}
              </p>
            )}

            {currentSubmission.file_id && (
              <a
                href={apiClient.getFileUrl(currentSubmission.file_id)}
                download
                className="flex items-center gap-3 p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                <span className="flex-1 text-sm">Скачать файл</span>
                <Download className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
              </a>
            )}
          </Card>
        )}

        {/* Submit button for students */}
        {!isTutor && !currentSubmission && (
          <Button
            fullWidth
            onClick={() => setShowSubmitModal(true)}
          >
            <Upload className="w-5 h-5" />
            Сдать задание
          </Button>
        )}

        {/* Feedback section */}
        {currentFeedback && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
              <h3 className="font-semibold">Отзыв преподавателя</h3>
            </div>

            {currentFeedback.comment && (
              <p className="text-[var(--tg-theme-text-color,#000)] mb-3 whitespace-pre-wrap">
                {currentFeedback.comment}
              </p>
            )}

            {currentFeedback.file_id && (
              <a
                href={apiClient.getFileUrl(currentFeedback.file_id)}
                download
                className="flex items-center gap-3 p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                <span className="flex-1 text-sm">Скачать файл</span>
                <Download className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
              </a>
            )}

            {currentFeedback.grade && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">Оценка:</span>
                <span className="text-lg font-bold text-[var(--tg-theme-button-color,#3390ec)]">
                  {currentFeedback.grade}/5
                </span>
              </div>
            )}

            {/* Edit feedback button for tutors */}
            {isTutor && (
              <Button
                variant="secondary"
                fullWidth
                className="mt-3"
                onClick={openReviewModal}
              >
                Редактировать отзыв
              </Button>
            )}
          </Card>
        )}

        {/* Review button for tutors */}
        {isTutor && currentSubmission && !currentFeedback && (
          <Button
            fullWidth
            onClick={openReviewModal}
          >
            <MessageSquare className="w-5 h-5" />
            Проверить
          </Button>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Сдать задание"
      >
        <div className="space-y-4">
          <TextArea
            label="Комментарий"
            value={submitComment}
            onChange={(e) => setSubmitComment(e.target.value)}
            rows={4}
            placeholder="Опишите решение или добавьте комментарии..."
          />
          <Input
            label="Прикрепить файл (необязательно)"
            placeholder="Введите имя файла"
            value={submitFileName}
            onChange={(e) => setSubmitFileName(e.target.value)}
            icon={<Upload className="w-4 h-4" />}
            helperText="Введите имя файла для симуляции загрузки"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowSubmitModal(false)}
          >
            Отмена
          </Button>
          <Button
            fullWidth
            disabled={submitSaving}
            onClick={handleSubmitAssignment}
          >
            {submitSaving ? 'Отправка...' : 'Отправить'}
          </Button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={currentFeedback ? 'Редактировать отзыв' : 'Проверить работу'}
      >
        <div className="space-y-4">
          <TextArea
            label="Комментарий"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            placeholder="Оставьте отзыв о работе ученика..."
          />

          {/* Grade selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000)] mb-2">
              Оценка (необязательно)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setReviewGrade(reviewGrade === g ? undefined : g)}
                  className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                    reviewGrade === g
                      ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white'
                      : 'bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] text-[var(--tg-theme-text-color,#000)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Прикрепить файл (необязательно)"
            placeholder="Введите имя файла"
            value={reviewFileName}
            onChange={(e) => setReviewFileName(e.target.value)}
            icon={<Upload className="w-4 h-4" />}
            helperText="Введите имя файла для симуляции загрузки"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowReviewModal(false)}
          >
            Отмена
          </Button>
          <Button
            fullWidth
            disabled={reviewSaving}
            onClick={currentFeedback ? handleUpdateFeedback : handleReview}
          >
            {reviewSaving ? 'Сохранение...' : currentFeedback ? 'Сохранить' : 'Отправить'}
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
