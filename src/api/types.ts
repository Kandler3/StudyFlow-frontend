import type {
  User, TutorProfile, TutorStudent, Slot, Lesson,
  Assignment, Submission, Feedback, Receipt, PaymentInfo,
  FileInfo, Notification, FAQ,
} from '../types';

// ── Auth ──
export interface SignUpTelegramPayload {
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  role?: 'tutor' | 'student';
  username?: string;
  timezone?: string;
}
export interface ApiAuth {
  signUpTelegram(payload: SignUpTelegramPayload): Promise<User>;
  getMe(): Promise<User>;
}

// ── Users ──
export interface ApiUsers {
  getUser(id: string): Promise<User>;
  updateUser(id: string, fields: Partial<Pick<User, 'first_name' | 'last_name' | 'timezone'>>): Promise<User>;
  getTutorProfile(userId: string): Promise<TutorProfile>;
  updateTutorProfile(userId: string, fields: Partial<Pick<TutorProfile, 'payment_info' | 'lesson_price_rub' | 'lesson_connection_link'>>): Promise<TutorProfile>;
}

// ── Tutor-Student ──
export interface ApiTutorStudents {
  getTutorStudents(tutorId: string): Promise<TutorStudent[]>;
  getStudentTutors(studentId: string): Promise<TutorStudent[]>;
  getTutorStudent(tutorId: string, studentId: string): Promise<TutorStudent | undefined>;
  createTutorStudent(payload: { tutor_id: string; student_id: string; lesson_price_rub?: number; lesson_connection_link?: string }): Promise<TutorStudent>;
  acceptInvitation(tutorId: string, studentId: string): Promise<TutorStudent>;
  updateTutorStudent(tutorId: string, studentId: string, fields: Partial<Pick<TutorStudent, 'lesson_price_rub' | 'lesson_connection_link' | 'status'>>): Promise<TutorStudent>;
  deleteTutorStudent(tutorId: string, studentId: string): Promise<void>;
}

// ── Slots ──
export interface ApiSlots {
  createSlot(payload: { tutor_id: string; starts_at: string; ends_at: string }): Promise<Slot>;
  getSlot(id: string): Promise<Slot>;
  updateSlot(id: string, fields: Partial<Pick<Slot, 'starts_at' | 'ends_at'>>): Promise<Slot>;
  deleteSlot(id: string): Promise<void>;
  getTutorSlots(tutorId: string, onlyAvailable?: boolean): Promise<Slot[]>;
}

// ── Lessons ──
export interface ApiLessons {
  getLessons(filters?: { tutor_id?: string; student_id?: string; status?: Lesson['status']; from?: string; to?: string }): Promise<Lesson[]>;
  createLesson(slotId: string, studentId: string): Promise<Lesson>;
  getLesson(id: string): Promise<Lesson>;
  updateLesson(id: string, fields: Partial<Pick<Lesson, 'connection_link' | 'price_rub' | 'payment_info'>>): Promise<Lesson>;
  cancelLesson(id: string): Promise<Lesson>;
  rescheduleLesson(lessonId: string, newSlotId: string): Promise<Lesson>;
}

// ── Homework ──
export interface ApiHomework {
  getAssignments(filters?: { tutor_id?: string; student_id?: string; status_filter?: string }): Promise<Assignment[]>;
  /**
   * Create a new assignment.
   * Note: OpenAPI spec lists `file_id` in `required`, but this is a spec bug --
   * the required array uses snake_case names that don't match the camelCase
   * property names (`fileId`), so the constraint does not apply.
   * The field is effectively optional.
   */
  createAssignment(payload: { tutor_id: string; student_id: string; title: string; description: string; file_id?: string; due_date: string }): Promise<Assignment>;
  getAssignment(id: string, scope: { role: 'tutor' | 'student'; userId: string }): Promise<Assignment>;
  updateAssignment(id: string, fields: Partial<Pick<Assignment, 'title' | 'description' | 'file_id' | 'due_date'>>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  getSubmissions(assignmentId: string): Promise<Submission[]>;
  /**
   * Submit work for an assignment.
   * Note: OpenAPI spec lists `file_id` in `required`, but this is a spec bug --
   * the required array uses snake_case names that don't match the camelCase
   * property names (`fileId`), so the constraint does not apply.
   * The field is effectively optional.
   */
  createSubmission(payload: { assignment_id: string; file_id?: string; comment?: string }): Promise<Submission>;
  getFeedbacks(assignmentId?: string): Promise<Feedback[]>;
  /**
   * Create feedback for a submission.
   * Note: OpenAPI spec lists `file_id` in `required`, but this is a spec bug --
   * the required array uses snake_case names that don't match the camelCase
   * property names (`fileId`), so the constraint does not apply.
   * The field is effectively optional.
   */
  createFeedback(payload: { submission_id: string; file_id?: string; comment?: string; grade?: number }): Promise<Feedback>;
  updateFeedback(id: string, fields: Partial<Pick<Feedback, 'file_id' | 'comment'> & { grade?: number }>): Promise<Feedback>;
  getAssignmentFileUrl(assignmentId: string): Promise<string>;
  getSubmissionFileUrl(submissionId: string): Promise<string>;
  getFeedbackFileUrl(feedbackId: string): Promise<string>;
}

// ── Payments ──
export interface ApiPayments {
  getPaymentInfo(lessonId: string): Promise<PaymentInfo>;
  getReceipts(filters?: { tutor_id?: string; student_id?: string }): Promise<Receipt[]>;
  submitReceipt(payload: { lesson_id: string; file_id: string }): Promise<Receipt>;
  getReceipt(id: string): Promise<Receipt>;
  verifyReceipt(id: string): Promise<Receipt>;
  getReceiptFileUrl(receiptId: string): Promise<string>;
}

// ── Files ──
export interface ApiFiles {
  initUpload(filename: string): Promise<{ file_id: string; upload_url: string }>;
  getFileMeta(id: string): Promise<FileInfo>;
  getFileUrl(id: string): string;
  getFileDownloadUrl(fileId: string): Promise<string>;
  confirmUpload(fileId: string): Promise<FileInfo>;
}

// ── Notifications (local only) ──
export interface ApiNotifications {
  getNotifications(): Promise<Notification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

// ── FAQ ──
export interface ApiFAQ {
  listFAQs(category?: string): Promise<FAQ[]>;
  listCategories(): Promise<string[]>;
  getFAQ(id: string): Promise<FAQ>;
}

// Combined API interface
export interface ApiClient extends ApiAuth, ApiUsers, ApiTutorStudents, ApiSlots, ApiLessons, ApiHomework, ApiPayments, ApiFiles, ApiNotifications, ApiFAQ {}
