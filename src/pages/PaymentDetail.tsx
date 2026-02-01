import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CreditCard, User, Calendar, CheckCircle, Bell, MessageSquare } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/Modal';
import { Input, TextArea } from '../components/ui/input';
import { payments } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useApp();
  const payment = payments.find((p) => p.id === id);

  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderMessage, setReminderMessage] = useState('');

  if (!payment) {
    return (
      <Layout hideNav children={null}>
        <Header title="Платеж не найден" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Запрошенный платеж не найден или удален
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleMarkPaid = () => {
    console.log('Marking payment as paid:', { paidDate });
    setShowMarkPaidModal(false);
    navigate('/payments');
  };

  const handleSendReminder = () => {
    console.log('Sending reminder:', { reminderMessage });
    setShowReminderModal(false);
  };

  return (
    <Layout hideNav children={null}>
      <Header title="Детали платежа" showBack />

      <div className="p-4 space-y-4">
        {/* Amount Card */}
        <Card>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-[var(--tg-theme-text-color,#000)] mb-2">
              {payment.amount.toLocaleString()} ₽
            </div>
            <div className="mb-4">
              {payment.status === 'paid' && <Badge variant="success">Оплачено</Badge>}
              {payment.status === 'pending' && <Badge variant="warning">Ожидает</Badge>}
              {payment.status === 'overdue' && <Badge variant="danger">Просрочено</Badge>}
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
              <div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">Описание</div>
                <div className="font-medium">{payment.description}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
              <div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                  {userRole === 'tutor' ? 'Ученик' : 'Получатель'}
                </div>
                <div className="font-medium">{payment.studentName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[var(--tg-theme-hint-color,#999)] mt-0.5" />
              <div>
                <div className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-1">
                  {payment.status === 'paid' ? 'Дата оплаты' : 'Срок оплаты'}
                </div>
                <div className="font-medium">
                  {payment.status === 'paid' && payment.paidAt
                    ? formatDate(payment.paidAt)
                    : formatDate(payment.dueDate)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment History */}
        {payment.status === 'paid' && payment.paidAt && (
          <Card>
            <h3 className="font-semibold mb-3">История статусов</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#34c759] mt-2" />
                <div className="flex-1">
                  <div className="font-medium">Оплачено</div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {formatDate(payment.paidAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--tg-theme-hint-color,#999)] mt-2" />
                <div className="flex-1">
                  <div className="font-medium">Создан</div>
                  <div className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                    {formatDate(payment.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions for Tutor */}
        {userRole === 'tutor' && payment.status !== 'paid' && (
          <div className="space-y-3">
            <Button
              fullWidth
              variant="primary"
              onClick={() => setShowMarkPaidModal(true)}
            >
              <CheckCircle className="w-5 h-5" />
              Отметить оплаченным
            </Button>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => setShowReminderModal(true)}
            >
              <Bell className="w-5 h-5" />
              Отправить напоминание
            </Button>
          </div>
        )}

        {/* Info for overdue */}
        {payment.status === 'overdue' && (
          <Card>
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-[#ff3b30] mt-0.5" />
              <div>
                <div className="font-medium text-[#ff3b30] mb-1">Платеж просрочен</div>
                <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
                  Срок оплаты истек {formatDate(payment.dueDate)}.
                  {userRole === 'tutor'
                    ? ' Отправьте напоминание ученику.'
                    : ' Пожалуйста, произведите оплату как можно скорее.'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Mark Paid Modal */}
      <Modal
        isOpen={showMarkPaidModal}
        onClose={() => setShowMarkPaidModal(false)}
        title="Отметить как оплаченный"
        children={null}
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowMarkPaidModal(false)}
            >
              Отмена
            </Button>
            <Button
              fullWidth
              onClick={handleMarkPaid}
            >
              Подтвердить
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
            Укажите дату фактической оплаты
          </p>
          <Input
            label="Дата оплаты"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
          />
        </div>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="Отправить напоминание"
        children={null}
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowReminderModal(false)}
            >
              Отмена
            </Button>
            <Button
              fullWidth
              onClick={handleSendReminder}
            >
              Отправить
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--tg-theme-hint-color,#999)]">
            Напоминание будет отправлено через Telegram-бот
          </p>
          <TextArea
            label="Сообщение (опционально)"
            value={reminderMessage}
            onChange={(e) => setReminderMessage(e.target.value)}
            rows={3}
            placeholder="Добавьте персональное сообщение..."
          />
          <Card padding="sm">
            <div className="text-sm">
              <div className="font-medium mb-1">Предпросмотр:</div>
              <div className="text-[var(--tg-theme-hint-color,#999)]">
                "Напоминание об оплате: {payment.description} на сумму {payment.amount} ₽.
                Срок оплаты: {formatDate(payment.dueDate)}"
                {reminderMessage && (
                  <>
                    <br /><br />
                    {reminderMessage}
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Modal>
    </Layout>
  );
}
