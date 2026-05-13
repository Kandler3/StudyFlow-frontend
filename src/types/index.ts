// User — matches GET /users/users/me response
export interface User {
  id: string;
  role: 'tutor' | 'student';
  first_name: string;
  last_name: string;
  timezone: string;
  status: 'active' | 'deleted';
}

// TutorProfile — matches GET /users/tutor-profiles/{user_id}
export interface TutorProfile {
  user_id: string;
  payment_info: string;
  lesson_price_rub: number;
  lesson_connection_link: string;
}

// TutorStudent — matches GET /users/tutor-students/...
// status: "invited" when tutor creates, "active" when student accepts
export interface TutorStudent {
  tutor_id: string;
  student_id: string;
  status: 'invited' | 'active';
  lesson_price_rub?: number;
  lesson_connection_link?: string;
}

// Slot — matches schedule slots
export interface Slot {
  id: string;
  tutor_id: string;
  starts_at: string; // ISO datetime
  ends_at: string;   // ISO datetime
  is_booked: boolean;
}

// Lesson — matches GET /schedule/lessons
export interface Lesson {
  id: string;
  slot_id: string;
  student_id: string;
  status: 'booked' | 'cancelled' | 'completed';
  is_paid: boolean;
  connection_link?: string;
  price_rub?: number;
  payment_info?: string;
}

// Assignment — matches GET /homework/assignments
export interface Assignment {
  id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  description: string;
  file_id?: string;
  due_date: string; // ISO datetime
}

// AssignmentStatus — computed on frontend, NOT from backend
// UNSENT: no submission, due_date in future
// OVERDUE: no submission, due_date in past
// UNREVIEWED: submission exists, no feedback
// REVIEWED: feedback exists
export type AssignmentStatus = 'UNSENT' | 'OVERDUE' | 'UNREVIEWED' | 'REVIEWED';

// Submission — matches GET /homework/submissions
export interface Submission {
  id: string;
  assignment_id: string;
  file_id?: string;
  comment?: string;
  created_at: string;
}

// Feedback — matches GET /homework/feedbacks
export interface Feedback {
  id: string;
  submission_id: string;
  file_id?: string;
  comment?: string;
  grade?: number;
}

// Receipt — matches GET /payment/receipts
export interface Receipt {
  id: string;
  lesson_id: string;
  tutor_id: string;
  student_id: string;
  file_id: string;
  price_rub: number;
  is_verified: boolean;
  created_at: string;
}

// PaymentInfo — matches GET /payment/info/{lesson_id}
export interface PaymentInfo {
  lesson_id: string;
  price_rub: number;
  payment_info: string;
}

// FileInfo — matches GET /files/{id}/meta
export interface FileInfo {
  id: string;
  filename?: string;
  extension: string;
  uploaded_by: string;
  created_at: string;
}

// Notification — local model (backend delivers via Telegram, no API)
export interface Notification {
  id: string;
  type: 'lesson_reminder' | 'assignment_reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// StudentView — composite for UI: user profile + relationship + computed stats
export interface StudentView {
  user: User;
  relationship: TutorStudent;
  stats: {
    totalLessons: number;
    completedLessons: number;
    activeAssignments: number;
  };
}

// Compute assignment status from assignment data
export function computeAssignmentStatus(
  assignment: Assignment,
  submission?: Submission | null,
  feedback?: Feedback | null
): AssignmentStatus {
  if (feedback) return 'REVIEWED';
  if (submission) return 'UNREVIEWED';
  const now = new Date();
  const due = new Date(assignment.due_date);
  if (now > due) return 'OVERDUE';
  return 'UNSENT';
}

// Helper: format ISO datetime to display date
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Helper: format ISO datetime to display time
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
