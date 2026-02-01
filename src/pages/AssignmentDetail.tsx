import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, User, FileText, Upload, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { TextArea, Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { assignments } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useApp();
  const assignment = assignments.find((a) => a.id === id);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [grade, setGrade] = useState(5);
  const [feedback, setFeedback] = useState('');

  if (!assignment) {
    return (
      <Layout hideNav children={null}>
        <Header title="Задание не найдено" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Запрошенное задание не найдено или удалено
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatDeadline = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    return deadline.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = () => {
    console.log('Submitting assignment:', { submissionText });
    setShowSubmitModal(false);
    navigate('/assignments');
  };

  const handleGrade = () => {
    console.log('Grading assignment:', { grade, feedback });
    setShowGradeModal(false);
    navigate('/assignments');
  };

  return (
    <Layout hideNav children={null}>
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
                {assignment.status === 'new' && <Badge variant="info">Новое</Badge>}
                {assignment.status === 'in_progress' && <Badge variant="warning">В работе</Badge>}
                {assignment.status === 'submitted' && <Badge variant="info">Сдано</Badge>}
                {assignment.status === 'reviewed' && <Badge variant="success">Проверено</Badge>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">Срок сдачи</div>
                  <div className="font-medium">{formatDeadline(assignment.deadline)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {userRole === 'tutor' ? 'Ученик' : 'Преподаватель'}
                  </div>
                  <div className="font-medium">{assignment.studentName}</div>
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

        {/* Attachments */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <Card>
            <h3 className="font-semibold mb-3">Прикрепленные файлы</h3>
            <div className="space-y-2">
              {assignment.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl"
                >
                  <FileText className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                  <span className="flex-1 text-sm">{file}</span>
                  <Button size="sm" variant="ghost">
                    Открыть
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Submission (for student or tutor viewing) */}
        {assignment.submission && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Ответ ученика</h3>
              {assignment.submission.submittedAt && (
                <span className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  {new Date(assignment.submission.submittedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            
            {assignment.submission.text && (
              <p className="text-[var(--tg-theme-text-color,#000)] mb-3 whitespace-pre-wrap">
                {assignment.submission.text}
              </p>
            )}

            {assignment.submission.files && assignment.submission.files.length > 0 && (
              <div className="space-y-2">
                {assignment.submission.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl"
                  >
                    <FileText className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                    <span className="flex-1 text-sm">{file}</span>
                    <Button size="sm" variant="ghost">
                      Открыть
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Feedback (if reviewed) */}
        {assignment.feedback && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-[#ff9500]" />
              <h3 className="font-semibold">Оценка и отзыв</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[var(--tg-theme-button-color,#3390ec)]">
                  {assignment.feedback.grade}
                </span>
                <span className="text-[var(--tg-theme-hint-color,#999)]">из 5</span>
              </div>
              {assignment.feedback.comment && (
                <p className="text-[var(--tg-theme-text-color,#000)]">
                  {assignment.feedback.comment}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        {userRole === 'student' && !assignment.submission && (
          <Button
            fullWidth
            onClick={() => setShowSubmitModal(true)}
          >
            <Upload className="w-5 h-5" />
            Сдать задание
          </Button>
        )}

        {userRole === 'tutor' && assignment.status === 'submitted' && (
          <Button
            fullWidth
            onClick={() => setShowGradeModal(true)}
          >
            <Star className="w-5 h-5" />
            Проверить и оценить
          </Button>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Сдать задание"
        children={null}
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowSubmitModal(false)}
            >
              Отмена
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
            >
              Отправить
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TextArea
            label="Ваш ответ"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            rows={4}
            placeholder="Опишите решение или добавьте комментарии..."
          />
          <div>
            <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000)] mb-2">
              Прикрепить файлы
            </label>
            <Button variant="secondary" fullWidth>
              <Upload className="w-4 h-4" />
              Выбрать файлы
            </Button>
          </div>
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title="Оценить работу"
        children={null}
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowGradeModal(false)}
            >
              Отмена
            </Button>
            <Button
              fullWidth
              onClick={handleGrade}
            >
              Сохранить оценку
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--tg-theme-text-color,#000)] mb-3">
              Оценка
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setGrade(value)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    grade === value
                      ? 'bg-[var(--tg-theme-button-color,#3390ec)] text-white scale-105'
                      : 'bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] text-[var(--tg-theme-text-color,#000)]'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <TextArea
            label="Комментарий"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Оставьте отзыв о работе ученика..."
          />
        </div>
      </Modal>
    </Layout>
  );
}
