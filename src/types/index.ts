export type UserRole = 'tutor' | 'student' | 'parent';

export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export type LessonType = 'individual' | 'group';

export type AssignmentStatus = 'new' | 'in_progress' | 'submitted' | 'reviewed';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  telegramId?: string;
}

export interface Student {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'trial';
  avatar?: string;
  nextLesson?: string;
  balance?: number;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: LessonType;
  status: LessonStatus;
  studentIds: string[];
  studentNames: string[];
  location?: string;
  notes?: string;
  hasHomework?: boolean;
  isPaid?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: AssignmentStatus;
  studentId: string;
  studentName: string;
  attachments?: string[];
  submission?: {
    text?: string;
    files?: string[];
    submittedAt?: string;
  };
  feedback?: {
    grade?: number;
    comment?: string;
  };
}

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  studentId: string;
  studentName: string;
  description: string;
  paidAt?: string;
}

export interface Notification {
  id: string;
  type: 'lesson' | 'assignment' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId: string;
}

export interface AnalyticsData {
  revenue: number;
  lessonsCount: number;
  activeStudents: number;
  newStudents: number;
  attendance: number;
}
