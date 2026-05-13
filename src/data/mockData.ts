import type {
  User,
  TutorProfile,
  TutorStudent,
  Slot,
  Lesson,
  Assignment,
  Submission,
  Feedback,
  Receipt,
  PaymentInfo,
  FileInfo,
  Notification,
  StudentView,
  AssignmentStatus,
} from '../types';

// ── Users ────────────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'u1',
    role: 'tutor',
    first_name: 'Анна',
    last_name: 'Петрова',
    timezone: 'Europe/Moscow',
    status: 'active',
  },
  {
    id: 'u2',
    role: 'student',
    first_name: 'Иван',
    last_name: 'Смирнов',
    timezone: 'Europe/Moscow',
    status: 'active',
  },
];

export const currentUser: User = users[0];

// ── TutorProfile ─────────────────────────────────────────────────────────────

export const tutorProfile: TutorProfile = {
  user_id: 'u1',
  payment_info: 'Сбербанк: 4276 1234 5678 9012',
  lesson_price_rub: 1500,
  lesson_connection_link: 'https://zoom.us/j/1234567890',
};

// ── TutorStudent relationships ───────────────────────────────────────────────

export const tutorStudents: TutorStudent[] = [
  {
    tutor_id: 'u1',
    student_id: 'u2',
    status: 'active',
    lesson_price_rub: 1500,
    lesson_connection_link: 'https://zoom.us/j/1234567890',
  },
];

// ── Slots ────────────────────────────────────────────────────────────────────

export const slots: Slot[] = [
  {
    id: 'slot1',
    tutor_id: 'u1',
    starts_at: '2026-02-03T10:00:00+03:00',
    ends_at: '2026-02-03T11:00:00+03:00',
    is_booked: true,
  },
  {
    id: 'slot2',
    tutor_id: 'u1',
    starts_at: '2026-02-03T14:00:00+03:00',
    ends_at: '2026-02-03T15:30:00+03:00',
    is_booked: false,
  },
  {
    id: 'slot3',
    tutor_id: 'u1',
    starts_at: '2026-02-05T10:00:00+03:00',
    ends_at: '2026-02-05T11:00:00+03:00',
    is_booked: true,
  },
  {
    id: 'slot4',
    tutor_id: 'u1',
    starts_at: '2026-02-01T15:00:00+03:00',
    ends_at: '2026-02-01T16:00:00+03:00',
    is_booked: true,
  },
  {
    id: 'slot5',
    tutor_id: 'u1',
    starts_at: '2026-02-06T16:00:00+03:00',
    ends_at: '2026-02-06T17:00:00+03:00',
    is_booked: false,
  },
];

// ── Lessons ──────────────────────────────────────────────────────────────────

export const lessons: Lesson[] = [
  {
    id: 'l1',
    slot_id: 'slot1',
    student_id: 'u2',
    status: 'booked',
    is_paid: false,
    connection_link: 'https://zoom.us/j/1234567890',
    price_rub: 1500,
    payment_info: 'Сбербанк: 4276 1234 5678 9012',
  },
  {
    id: 'l2',
    slot_id: 'slot4',
    student_id: 'u2',
    status: 'completed',
    is_paid: true,
    connection_link: 'https://zoom.us/j/1234567890',
    price_rub: 1500,
  },
  {
    id: 'l3',
    slot_id: 'slot3',
    student_id: 'u2',
    status: 'cancelled',
    is_paid: false,
    price_rub: 1500,
  },
];

// ── Assignments ──────────────────────────────────────────────────────────────

export const assignments: Assignment[] = [
  {
    id: 'a1',
    tutor_id: 'u1',
    student_id: 'u2',
    title: 'Задачи на тригонометрические уравнения',
    description: 'Решить задачи 1-10 из учебника',
    due_date: '2026-02-10T23:59:00+03:00',
  },
  {
    id: 'a2',
    tutor_id: 'u1',
    student_id: 'u2',
    title: 'Законы Ньютона',
    description: 'Решить 5 задач на законы Ньютона',
    due_date: '2026-01-30T23:59:00+03:00',
  },
  {
    id: 'a3',
    tutor_id: 'u1',
    student_id: 'u2',
    title: 'Производные',
    description: 'Найти производные функций',
    due_date: '2026-02-15T23:59:00+03:00',
  },
];

// ── Submissions ──────────────────────────────────────────────────────────────

export const submissions: Submission[] = [
  {
    id: 'sub1',
    assignment_id: 'a3',
    comment: 'Все задания выполнены',
    created_at: '2026-02-05T18:30:00+03:00',
  },
];

// ── Feedbacks ────────────────────────────────────────────────────────────────

export const feedbacks: Feedback[] = [
  {
    id: 'fb1',
    submission_id: 'sub1',
    comment: 'Отличная работа! Всё верно.',
  },
];

// ── Receipts ─────────────────────────────────────────────────────────────────

export const receipts: Receipt[] = [
  {
    id: 'r1',
    lesson_id: 'l2',
    tutor_id: 'u1',
    student_id: 'u2',
    file_id: 'file1',
    price_rub: 1500,
    is_verified: true,
    created_at: '2026-02-01T20:00:00+03:00',
  },
];

// ── PaymentInfo ──────────────────────────────────────────────────────────────

export const paymentInfoItems: PaymentInfo[] = [
  {
    lesson_id: 'l1',
    price_rub: 1500,
    payment_info: 'Сбербанк: 4276 1234 5678 9012',
  },
];

// ── FileInfo ─────────────────────────────────────────────────────────────────

export const fileInfos: FileInfo[] = [
  {
    id: 'file1',
    filename: 'receipt_check.jpg',
    extension: 'jpg',
    uploaded_by: 'u2',
    created_at: '2026-02-01T20:00:00+03:00',
  },
];

// ── Notifications ────────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'lesson_reminder',
    title: 'Напоминание о занятии',
    message: 'Завтра в 10:00 занятие с Иваном Смирновым',
    timestamp: '2026-02-02T18:00:00+03:00',
    read: false,
  },
  {
    id: 'n2',
    type: 'assignment_reminder',
    title: 'Дедлайн задания',
    message: 'Дедлайн задания «Задачи на тригонометрические уравнения» 10 февраля',
    timestamp: '2026-02-08T12:00:00+03:00',
    read: false,
  },
];

// ── Computed assignment statuses (for convenience) ───────────────────────────
// a1: no submission, future due  → UNSENT
// a2: no submission, past due   → OVERDUE
// a3: has submission + feedback → REVIEWED

export const assignmentStatuses: Record<string, AssignmentStatus> = {
  a1: 'UNSENT',
  a2: 'OVERDUE',
  a3: 'REVIEWED',
};

// ── StudentViews (composite for UI) ─────────────────────────────────────────

export const studentViews: StudentView[] = [
  {
    user: users[1], // Ivan Smirnov
    relationship: tutorStudents[0],
    stats: {
      totalLessons: 3,   // l1, l2, l3
      completedLessons: 1, // l2 (completed)
      activeAssignments: 2, // a1 (UNSENT), a3 (REVIEWED — still "active" from a certain perspective, or just a2 OVERDUE)
    },
  },
];

// ── FAQ data (kept as-is, no type change needed) ─────────────────────────────

export const faqData = [
  {
    id: 'faq1',
    category: 'Расписание',
    question: 'Как создать новое занятие?',
    answer: 'Перейдите в раздел "Расписание" и нажмите кнопку "+". Заполните информацию о занятии: выберите ученика, дату, время и длительность.',
  },
  {
    id: 'faq2',
    category: 'Расписание',
    question: 'Можно ли перенести занятие?',
    answer: 'Да, откройте детали занятия и нажмите "Перенести". Выберите новую дату и время. Ученик получит уведомление об изменении.',
  },
  {
    id: 'faq3',
    category: 'Задания',
    question: 'Как назначить домашнее задание?',
    answer: 'В разделе "Задания" нажмите "+", выберите ученика или группу, введите описание и установите дедлайн. Можно прикрепить файлы.',
  },
  {
    id: 'faq4',
    category: 'Оплаты',
    question: 'Как отметить платеж как оплаченный?',
    answer: 'Откройте детали платежа и нажмите "Отметить оплаченным". Укажите дату и способ оплаты (опционально).',
  },
  {
    id: 'faq5',
    category: 'Ученики',
    question: 'Как добавить нового ученика?',
    answer: 'В разделе "Ученики" нажмите "+". Введите имя, контактные данные и статус (активный/пробное занятие).',
  },
];
