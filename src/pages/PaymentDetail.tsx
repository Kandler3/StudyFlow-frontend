import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CreditCard, FileText, CheckCircle, Clock, XCircle, Upload, ShieldCheck, Download, Calendar, User as UserIcon, Info } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { formatDate, formatTime } from '../types';
import type { Lesson, Slot, User, Receipt, PaymentInfo } from '../types';

export function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useApp();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submit receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPrice, setReceiptPrice] = useState(0);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Verify state
  const [verifying, setVerifying] = useState(false);

  // Receipt file URL (fetched async for download)
  const [receiptFileUrl, setReceiptFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !authUser) return;
    const currentId = id;
    const currentUser = authUser;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const lessonData = await apiClient.getLesson(currentId);
        setLesson(lessonData);

        // Fetch slot and student
        const [slotData, studentData] = await Promise.all([
          apiClient.getSlot(lessonData.slot_id).catch(() => null),
          apiClient.getUser(lessonData.student_id).catch(() => null),
        ]);
        setSlot(slotData);
        setStudent(studentData);

        // Fetch payment info (optional — may not exist for all lessons)
        const payInfoData = await apiClient.getPaymentInfo(currentId).catch(() => null);
        setPaymentInfo(payInfoData);

        // Fetch receipts to find one for this lesson
        const receiptFilters = currentUser.role === 'tutor'
          ? { tutor_id: currentUser.id }
          : { student_id: currentUser.id };
        const receiptList = await apiClient.getReceipts(receiptFilters);
        const lessonReceipts = receiptList.filter(r => r.lesson_id === currentId);
        setReceipts(lessonReceipts);

        // Fetch receipt file URL for download
        if (lessonReceipts.length > 0) {
          const fileUrl = await apiClient.getReceiptFileUrl(lessonReceipts[0].id).catch(() => null);
          setReceiptFileUrl(fileUrl);
        }

        // Pre-fill price for receipt form
        const priceValue = lessonData.price_rub ?? payInfoData?.price_rub ?? 0;
        setReceiptPrice(priceValue);
      } catch (err) {
        console.error('Failed to fetch payment detail', err);
        setError('Платеж не найден');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, authUser]);

  const currentReceipt: Receipt | undefined = receipts[0];
  const isTutor = authUser?.role === 'tutor';

  // Student: submit a receipt
  const handleSubmitReceipt = async () => {
    if (!id || !authUser || !lesson || !slot) return;
    setSubmitting(true);
    try {
      let fileId: string;
      if (receiptFileName.trim()) {
        const uploadResult = await apiClient.initUpload(receiptFileName.trim());
        fileId = uploadResult.file_id;
      } else {
        // Default file name if none provided
        const uploadResult = await apiClient.initUpload('receipt.txt');
        fileId = uploadResult.file_id;
      }

      const newReceipt = await apiClient.submitReceipt({
        lesson_id: id,
        file_id: fileId,
      });

      setReceipts([newReceipt]);
      setShowReceiptModal(false);
      setReceiptFileName('');

      // Fetch receipt file URL for the new receipt
      const fileUrl = await apiClient.getReceiptFileUrl(newReceipt.id).catch(() => null);
      setReceiptFileUrl(fileUrl);

      // Refetch lesson to get updated is_paid status
      const updatedLesson = await apiClient.getLesson(id);
      setLesson(updatedLesson);
    } catch (err) {
      console.error('Failed to submit receipt', err);
      toast.error('Не удалось отправить чек');
    } finally {
      setSubmitting(false);
    }
  };

  // Tutor: verify a receipt
  const handleVerifyReceipt = async () => {
    if (!currentReceipt) return;
    setVerifying(true);
    try {
      const verified = await apiClient.verifyReceipt(currentReceipt.id);
      setReceipts([verified]);

      // Refetch lesson to get updated is_paid status
      if (id) {
        const updatedLesson = await apiClient.getLesson(id);
        setLesson(updatedLesson);
      }
    } catch (err) {
      console.error('Failed to verify receipt', err);
      toast.error('Не удалось подтвердить чек');
    } finally {
      setVerifying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout hideNav>
        <Header title="Детали платежа" showBack />
        <LoadingSpinner />
      </Layout>
    );
  }

  // Error / Not found state
  if (error || !lesson || !slot) {
    return (
      <Layout hideNav>
        <Header title="Платеж не найден" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              {error || 'Запрошенный платеж не найден'}
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const displayPrice = lesson.price_rub ?? paymentInfo?.price_rub;
  const displayPaymentInfo = lesson.payment_info ?? paymentInfo?.payment_info;

  return (
    <Layout hideNav>
      <Header title="Детали платежа" showBack />

      <div className="p-4 space-y-4">
        {/* Amount Card */}
        <Card>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-[var(--tg-theme-text-color,#000)] mb-2">
              {displayPrice?.toLocaleString() ?? '—'} ₽
            </div>
            <div className="mb-2">
              {lesson.is_paid ? (
                <Badge variant="success">Оплачено</Badge>
              ) : (
                <Badge variant="warning">Не оплачено</Badge>
              )}
            </div>
            {currentReceipt && (
              <div>
                {currentReceipt.is_verified ? (
                  <Badge variant="success">Чек подтверждён</Badge>
                ) : (
                  <Badge variant="warning">Чек на проверке</Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Lesson Info */}
        <Card>
          <h3 className="font-semibold mb-3">Информация о занятии</h3>
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center gap-3">
              {lesson.status === 'booked' && <Badge variant="info">Запланировано</Badge>}
              {lesson.status === 'completed' && <Badge variant="success">Проведено</Badge>}
              {lesson.status === 'cancelled' && <Badge variant="danger">Отменено</Badge>}
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
              <div>
                <div className="font-medium">{formatDate(slot.starts_at)}</div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                </div>
              </div>
            </div>

            {/* Student name (for tutor) or Tutor name (for student) */}
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
              <div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  {isTutor ? 'Ученик' : 'Преподаватель'}
                </div>
                <div className="font-medium">
                  {student ? `${student.first_name} ${student.last_name}` : '—'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        {displayPaymentInfo && (
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <h3 className="font-semibold">Платёжные данные</h3>
              </div>
              <p className="text-sm text-[var(--tg-theme-text-color,#000)] whitespace-pre-wrap">
                {displayPaymentInfo}
              </p>
            </div>
          </Card>
        )}

        {/* Receipt Info */}
        {currentReceipt && (
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)]" />
                <h3 className="font-semibold">Чек</h3>
                {currentReceipt.is_verified ? (
                  <Badge variant="success" size="sm">Подтверждён</Badge>
                ) : (
                  <Badge variant="warning" size="sm">На проверке</Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-[var(--tg-theme-hint-color,#999)]">
                <span>Сумма: {currentReceipt.price_rub.toLocaleString()} ₽</span>
              </div>

              <a
                href={receiptFileUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl"
                onClick={(e) => {
                  if (!receiptFileUrl) e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FileText className="w-5 h-5 text-[var(--tg-theme-button-color,#3390ec)]" />
                <span className="flex-1 text-sm">Скачать чек</span>
                <Download className="w-4 h-4 text-[var(--tg-theme-button-color,#3390ec)]" />
              </a>

              <div className="text-xs text-[var(--tg-theme-hint-color,#999)]">
                Загружен: {new Date(currentReceipt.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Student actions */}
        {!isTutor && !lesson.is_paid && (
          <Button
            fullWidth
            variant="primary"
            onClick={() => setShowReceiptModal(true)}
          >
            <Upload className="w-5 h-5" />
            Загрузить чек
          </Button>
        )}

        {/* Tutor actions */}
        {isTutor && currentReceipt && !currentReceipt.is_verified && (
          <Button
            fullWidth
            variant="primary"
            disabled={verifying}
            onClick={handleVerifyReceipt}
          >
            <ShieldCheck className="w-5 h-5" />
            {verifying ? 'Подтверждение...' : 'Подтвердить чек'}
          </Button>
        )}
      </div>

      {/* Submit Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Загрузить чек"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
            Загрузите чек об оплате для подтверждения платежа
          </p>
          <Input
            label="Сумма оплаты"
            type="number"
            value={String(receiptPrice)}
            onChange={(e) => setReceiptPrice(Number(e.target.value))}
            icon={<CreditCard className="w-4 h-4" />}
          />
          <Input
            label="Файл чека"
            placeholder="Введите имя файла"
            value={receiptFileName}
            onChange={(e) => setReceiptFileName(e.target.value)}
            icon={<Upload className="w-4 h-4" />}
            helperText="Введите имя файла для симуляции загрузки"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowReceiptModal(false)}
          >
            Отмена
          </Button>
          <Button
            fullWidth
            disabled={submitting}
            onClick={handleSubmitReceipt}
          >
            {submitting ? 'Загрузка...' : 'Отправить'}
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
