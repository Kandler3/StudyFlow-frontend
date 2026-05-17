import type {
  User, TutorProfile, TutorStudent, Slot, Lesson,
  Assignment, Submission, Feedback, Receipt, PaymentInfo,
  FileInfo, Notification, FAQ,
} from '../types';

import * as mockData from '../data/mockData';
import type {
  SignUpTelegramPayload,
  ApiAuth,
  ApiUsers,
  ApiTutorStudents,
  ApiSlots,
  ApiLessons,
  ApiHomework,
  ApiPayments,
  ApiFiles,
  ApiNotifications,
  ApiFAQ,
  ApiClient,
} from './types';

// ── Helper: simulate network latency ──
const delay = (): Promise<void> =>
  new Promise((r) => setTimeout(r, 200 + Math.random() * 200));

// ── Sequential ID generator ──
const idGen2 = (() => {
  const counters: Record<string, number> = {};
  return {
    next(prefix: string): string {
      if (!counters[prefix]) counters[prefix] = 0;
      counters[prefix] += 1;
      return prefix + counters[prefix];
    },
    seed(prefix: string, existingKeys: string[]) {
      const max = existingKeys.reduce((mx, k) => {
        const n = parseInt(k.slice(prefix.length), 10);
        return isNaN(n) ? mx : Math.max(mx, n);
      }, 0);
      counters[prefix] = max;
    },
  };
})();

// ── In-memory stores ──
const userMap = new Map<string, User>();
const tutorProfileMap = new Map<string, TutorProfile>();
const tutorStudentMap = new Map<string, TutorStudent>();
const slotMap = new Map<string, Slot>();
const lessonMap = new Map<string, Lesson>();
const assignmentMap = new Map<string, Assignment>();
const submissionMap = new Map<string, Submission>();
const feedbackMap = new Map<string, Feedback>();
const receiptMap = new Map<string, Receipt>();
const paymentInfoMap = new Map<string, PaymentInfo>();
const fileInfoMap = new Map<string, FileInfo>();
const notificationMap = new Map<string, Notification>();

// ── Helper: composite key for tutor-student relationships ──
function tsKey(tutorId: string, studentId: string): string {
  return `${tutorId}_${studentId}`;
}

// ── Seed from mockData ──
mockData.users.forEach((u) => userMap.set(u.id, { ...u }));
mockData.tutorProfile && tutorProfileMap.set(mockData.tutorProfile.user_id, { ...mockData.tutorProfile });
mockData.tutorStudents.forEach((ts) => tutorStudentMap.set(tsKey(ts.tutor_id, ts.student_id), { ...ts }));
mockData.slots.forEach((s) => slotMap.set(s.id, { ...s }));
mockData.lessons.forEach((l) => lessonMap.set(l.id, { ...l }));
mockData.assignments.forEach((a) => assignmentMap.set(a.id, { ...a }));
mockData.submissions.forEach((s) => submissionMap.set(s.id, { ...s }));
mockData.feedbacks.forEach((f) => feedbackMap.set(f.id, { ...f }));
mockData.receipts.forEach((r) => receiptMap.set(r.id, { ...r }));
mockData.paymentInfoItems.forEach((p) => paymentInfoMap.set(p.lesson_id, { ...p }));
mockData.fileInfos.forEach((f) => fileInfoMap.set(f.id, { ...f }));
mockData.notifications.forEach((n) => notificationMap.set(n.id, { ...n }));

// ── Pre-seed ID generator counters from existing data ──

// Seed counters from existing data
idGen2.seed('l', Array.from(lessonMap.keys()));
idGen2.seed('a', Array.from(assignmentMap.keys()));
idGen2.seed('sub', Array.from(submissionMap.keys()));
idGen2.seed('fb', Array.from(feedbackMap.keys()));
idGen2.seed('r', Array.from(receiptMap.keys()));
idGen2.seed('file', Array.from(fileInfoMap.keys()));
idGen2.seed('n', Array.from(notificationMap.keys()));
idGen2.seed('slot', Array.from(slotMap.keys()));
idGen2.seed('u', Array.from(userMap.keys()));

// ── Auth ──
const authApi: ApiAuth = {
  async signUpTelegram(payload: SignUpTelegramPayload): Promise<User> {
    await delay();
    const id = idGen2.next('u');
    const user: User = {
      id,
      role: 'student',
      first_name: payload.first_name ?? '',
      last_name: payload.last_name ?? '',
      timezone: 'Europe/Moscow',
      status: 'active',
    };
    userMap.set(id, user);
    return { ...user };
  },

  async getMe(): Promise<User> {
    await delay();
    return { ...mockData.currentUser };
  },
};

// ── Users ──
const usersApi: ApiUsers = {
  async getUser(id: string): Promise<User> {
    await delay();
    const user = userMap.get(id);
    if (!user) throw new Error(`User ${id} not found`);
    return { ...user };
  },

  async updateUser(id: string, fields: Partial<Pick<User, 'first_name' | 'last_name' | 'timezone'>>): Promise<User> {
    await delay();
    const existing = userMap.get(id);
    if (!existing) throw new Error(`User ${id} not found`);
    const updated: User = { ...existing, ...fields };
    userMap.set(id, updated);
    return { ...updated };
  },

  async getTutorProfile(userId: string): Promise<TutorProfile> {
    await delay();
    const profile = tutorProfileMap.get(userId);
    if (!profile) throw new Error(`TutorProfile for user ${userId} not found`);
    return { ...profile };
  },

  async updateTutorProfile(userId: string, fields: Partial<Pick<TutorProfile, 'payment_info' | 'lesson_price_rub' | 'lesson_connection_link'>>): Promise<TutorProfile> {
    await delay();
    const existing = tutorProfileMap.get(userId);
    if (!existing) throw new Error(`TutorProfile for user ${userId} not found`);
    const updated: TutorProfile = { ...existing, ...fields };
    tutorProfileMap.set(userId, updated);
    return { ...updated };
  },
};

// ── Tutor-Student ──
const tutorStudentsApi: ApiTutorStudents = {
  async getTutorStudents(tutorId: string): Promise<TutorStudent[]> {
    await delay();
    return Array.from(tutorStudentMap.values())
      .filter((ts) => ts.tutor_id === tutorId)
      .map((ts) => ({ ...ts }));
  },

  async getStudentTutors(studentId: string): Promise<TutorStudent[]> {
    await delay();
    return Array.from(tutorStudentMap.values())
      .filter((ts) => ts.student_id === studentId)
      .map((ts) => ({ ...ts }));
  },

  async getTutorStudent(tutorId: string, studentId: string): Promise<TutorStudent | undefined> {
    await delay();
    const ts = tutorStudentMap.get(tsKey(tutorId, studentId));
    return ts ? { ...ts } : undefined;
  },

  async createTutorStudent(payload: {
    tutor_id: string;
    student_id: string;
    lesson_price_rub?: number;
    lesson_connection_link?: string;
  }): Promise<TutorStudent> {
    await delay();
    const relation: TutorStudent = {
      tutor_id: payload.tutor_id,
      student_id: payload.student_id,
      status: 'invited',
      lesson_price_rub: payload.lesson_price_rub,
      lesson_connection_link: payload.lesson_connection_link,
    };
    tutorStudentMap.set(tsKey(relation.tutor_id, relation.student_id), relation);
    return { ...relation };
  },

  async acceptInvitation(tutorId: string, studentId: string): Promise<TutorStudent> {
    await delay();
    const key = tsKey(tutorId, studentId);
    const existing = tutorStudentMap.get(key);
    if (!existing) throw new Error(`TutorStudent relationship not found for ${key}`);
    const updated: TutorStudent = { ...existing, status: 'active' };
    tutorStudentMap.set(key, updated);
    return { ...updated };
  },

  async updateTutorStudent(
    tutorId: string,
    studentId: string,
    fields: Partial<Pick<TutorStudent, 'lesson_price_rub' | 'lesson_connection_link' | 'status'>>
  ): Promise<TutorStudent> {
    await delay();
    const key = tsKey(tutorId, studentId);
    const existing = tutorStudentMap.get(key);
    if (!existing) throw new Error(`TutorStudent relationship not found for ${key}`);
    const updated: TutorStudent = { ...existing, ...fields };
    tutorStudentMap.set(key, updated);
    return { ...updated };
  },

  async deleteTutorStudent(tutorId: string, studentId: string): Promise<void> {
    await delay();
    tutorStudentMap.delete(tsKey(tutorId, studentId));
  },
};

// ── Slots ──
const slotsApi: ApiSlots = {
  async createSlot(payload: { tutor_id: string; starts_at: string; ends_at: string }): Promise<Slot> {
    await delay();
    const slot: Slot = {
      id: idGen2.next('slot'),
      tutor_id: payload.tutor_id,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      is_booked: false,
    };
    slotMap.set(slot.id, slot);
    return { ...slot };
  },

  async getSlot(id: string): Promise<Slot> {
    await delay();
    const slot = slotMap.get(id);
    if (!slot) throw new Error(`Slot ${id} not found`);
    return { ...slot };
  },

  async updateSlot(id: string, fields: Partial<Pick<Slot, 'starts_at' | 'ends_at'>>): Promise<Slot> {
    await delay();
    const existing = slotMap.get(id);
    if (!existing) throw new Error(`Slot ${id} not found`);
    const updated: Slot = { ...existing, ...fields };
    slotMap.set(id, updated);
    return { ...updated };
  },

  async deleteSlot(id: string): Promise<void> {
    await delay();
    slotMap.delete(id);
  },

  async getTutorSlots(tutorId: string, onlyAvailable?: boolean): Promise<Slot[]> {
    await delay();
    return Array.from(slotMap.values())
      .filter((s) => s.tutor_id === tutorId)
      .filter((s) => (onlyAvailable ? !s.is_booked : true))
      .map((s) => ({ ...s }));
  },
};

// ── Lessons ──
const lessonsApi: ApiLessons = {
  async getLessons(filters?: { tutor_id?: string; student_id?: string; status?: Lesson['status'] }): Promise<Lesson[]> {
    await delay();
    let result = Array.from(lessonMap.values());
    if (filters?.tutor_id) {
      // Lessons don't have a tutor_id field directly; we derive from the slot
      // For now, filter by checking if the slot belongs to this tutor
      result = result.filter((l) => {
        const slot = slotMap.get(l.slot_id);
        return slot?.tutor_id === filters.tutor_id;
      });
    }
    if (filters?.student_id) {
      result = result.filter((l) => l.student_id === filters.student_id);
    }
    if (filters?.status) {
      result = result.filter((l) => l.status === filters.status);
    }
    return result.map((l) => ({ ...l }));
  },

  async createLesson(slotId: string, studentId: string): Promise<Lesson> {
    await delay();
    const slot = slotMap.get(slotId);
    if (!slot) throw new Error(`Slot ${slotId} not found`);
    if (slot.is_booked) throw new Error(`Slot ${slotId} is already booked`);

    // Find the tutor-student relationship to get default connection link and price
    const tutorStudent = Array.from(tutorStudentMap.values()).find(
      (ts) => ts.tutor_id === slot.tutor_id && ts.student_id === studentId
    );
    const tutorProfile = tutorProfileMap.get(slot.tutor_id);

    const lesson: Lesson = {
      id: idGen2.next('l'),
      slot_id: slotId,
      student_id: studentId,
      status: 'booked',
      is_paid: false,
      connection_link: tutorStudent?.lesson_connection_link ?? tutorProfile?.lesson_connection_link,
      price_rub: tutorStudent?.lesson_price_rub ?? tutorProfile?.lesson_price_rub,
      payment_info: tutorProfile?.payment_info,
    };

    lessonMap.set(lesson.id, lesson);
    slotMap.set(slotId, { ...slot, is_booked: true });
    return { ...lesson };
  },

  async getLesson(id: string): Promise<Lesson> {
    await delay();
    const lesson = lessonMap.get(id);
    if (!lesson) throw new Error(`Lesson ${id} not found`);
    return { ...lesson };
  },

  async updateLesson(id: string, fields: Partial<Pick<Lesson, 'connection_link' | 'price_rub' | 'payment_info'>>): Promise<Lesson> {
    await delay();
    const existing = lessonMap.get(id);
    if (!existing) throw new Error(`Lesson ${id} not found`);
    const updated: Lesson = { ...existing, ...fields };
    lessonMap.set(id, updated);
    return { ...updated };
  },

  async cancelLesson(id: string): Promise<Lesson> {
    await delay();
    const existing = lessonMap.get(id);
    if (!existing) throw new Error(`Lesson ${id} not found`);

    // Cancel the lesson
    const updated: Lesson = { ...existing, status: 'cancelled' };
    lessonMap.set(id, updated);

    // Free the slot
    const slot = slotMap.get(existing.slot_id);
    if (slot) {
      slotMap.set(existing.slot_id, { ...slot, is_booked: false });
    }

    return { ...updated };
  },

  async rescheduleLesson(lessonId: string, newSlotId: string): Promise<Lesson> {
    await delay();
    const existing = lessonMap.get(lessonId);
    if (!existing) throw new Error(`Lesson ${lessonId} not found`);
    const newSlot = slotMap.get(newSlotId);
    if (!newSlot) throw new Error(`Slot ${newSlotId} not found`);
    if (newSlot.is_booked) throw new Error(`Slot ${newSlotId} is already booked`);

    // Cancel old lesson
    const cancelledLesson: Lesson = { ...existing, status: 'cancelled' };
    lessonMap.set(lessonId, cancelledLesson);

    // Free old slot
    const oldSlot = slotMap.get(existing.slot_id);
    if (oldSlot) {
      slotMap.set(oldSlot.id, { ...oldSlot, is_booked: false });
    }

    // Book new slot
    slotMap.set(newSlotId, { ...newSlot, is_booked: true });

    // Create replacement lesson
    const newLesson: Lesson = {
      id: idGen2.next('l'),
      slot_id: newSlotId,
      student_id: existing.student_id,
      status: 'booked',
      is_paid: existing.is_paid,
      connection_link: existing.connection_link,
      price_rub: existing.price_rub,
      payment_info: existing.payment_info,
    };
    lessonMap.set(newLesson.id, newLesson);
    return { ...newLesson };
  },
};

// ── Homework ──
const homeworkApi: ApiHomework = {
  async getAssignments(filters?: { tutor_id?: string; student_id?: string; status_filter?: string }): Promise<Assignment[]> {
    await delay();
    let result = Array.from(assignmentMap.values());
    if (filters?.tutor_id) {
      result = result.filter((a) => a.tutor_id === filters.tutor_id);
    }
    if (filters?.student_id) {
      result = result.filter((a) => a.student_id === filters.student_id);
    }
    return result.map((a) => ({ ...a }));
  },

  async createAssignment(payload: {
    tutor_id: string;
    student_id: string;
    title: string;
    description: string;
    file_id?: string;
    due_date: string;
  }): Promise<Assignment> {
    await delay();
    const assignment: Assignment = {
      id: idGen2.next('a'),
      tutor_id: payload.tutor_id,
      student_id: payload.student_id,
      title: payload.title,
      description: payload.description,
      file_id: payload.file_id,
      due_date: payload.due_date,
    };
    assignmentMap.set(assignment.id, assignment);
    return { ...assignment };
  },

  async getAssignment(id: string, _scope?: { role: 'tutor' | 'student'; userId: string }): Promise<Assignment> {
    await delay();
    const assignment = assignmentMap.get(id);
    if (!assignment) throw new Error(`Assignment ${id} not found`);
    return { ...assignment };
  },

  async updateAssignment(id: string, fields: Partial<Pick<Assignment, 'title' | 'description' | 'file_id' | 'due_date'>>): Promise<Assignment> {
    await delay();
    const existing = assignmentMap.get(id);
    if (!existing) throw new Error(`Assignment ${id} not found`);
    const updated: Assignment = { ...existing, ...fields };
    assignmentMap.set(id, updated);
    return { ...updated };
  },

  async deleteAssignment(id: string): Promise<void> {
    await delay();
    assignmentMap.delete(id);
  },

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    await delay();
    return Array.from(submissionMap.values())
      .filter((s) => s.assignment_id === assignmentId)
      .map((s) => ({ ...s }));
  },

  async createSubmission(payload: { assignment_id: string; file_id?: string; comment?: string }): Promise<Submission> {
    await delay();
    const submission: Submission = {
      id: idGen2.next('sub'),
      assignment_id: payload.assignment_id,
      file_id: payload.file_id,
      comment: payload.comment,
      created_at: new Date().toISOString(),
    };
    submissionMap.set(submission.id, submission);
    return { ...submission };
  },

  async getFeedbacks(assignmentId?: string): Promise<Feedback[]> {
    await delay();
    if (!assignmentId) {
      return Array.from(feedbackMap.values()).map((f) => ({ ...f }));
    }
    // Find submissions for this assignment, then find feedbacks for those submissions
    const assignmentSubmissions = Array.from(submissionMap.values()).filter(
      (s) => s.assignment_id === assignmentId
    );
    const submissionIds = new Set(assignmentSubmissions.map((s) => s.id));
    return Array.from(feedbackMap.values())
      .filter((f) => submissionIds.has(f.submission_id))
      .map((f) => ({ ...f }));
  },

  async createFeedback(payload: { submission_id: string; file_id?: string; comment?: string; grade?: number }): Promise<Feedback> {
    await delay();
    const feedback: Feedback = {
      id: idGen2.next('fb'),
      submission_id: payload.submission_id,
      file_id: payload.file_id,
      comment: payload.comment,
      grade: payload.grade,
    };
    feedbackMap.set(feedback.id, feedback);
    return { ...feedback };
  },

  async updateFeedback(id: string, fields: Partial<Pick<Feedback, 'file_id' | 'comment'> & { grade?: number }>): Promise<Feedback> {
    await delay();
    const existing = feedbackMap.get(id);
    if (!existing) throw new Error(`Feedback ${id} not found`);
    const updated: Feedback = { ...existing, ...fields };
    feedbackMap.set(id, updated);
    return { ...updated };
  },

  async getAssignmentFileUrl(assignmentId: string): Promise<string> {
    await delay();
    return `https://mock-file.example.com/assignment/${assignmentId}`;
  },

  async getSubmissionFileUrl(submissionId: string): Promise<string> {
    await delay();
    return `https://mock-file.example.com/submission/${submissionId}`;
  },

  async getFeedbackFileUrl(feedbackId: string): Promise<string> {
    await delay();
    return `https://mock-file.example.com/feedback/${feedbackId}`;
  },
};

// ── Payments ──
const paymentsApi: ApiPayments = {
  async getPaymentInfo(lessonId: string): Promise<PaymentInfo> {
    await delay();
    // Check if already cached
    const cached = paymentInfoMap.get(lessonId);
    if (cached) return { ...cached };

    // Dynamically construct from lesson + tutor data
    const lesson = lessonMap.get(lessonId);
    if (!lesson) throw new Error(`Lesson ${lessonId} not found`);
    const slot = slotMap.get(lesson.slot_id);
    const tutorProfile = slot ? tutorProfileMap.get(slot.tutor_id) : undefined;

    const info: PaymentInfo = {
      lesson_id: lessonId,
      price_rub: lesson.price_rub ?? tutorProfile?.lesson_price_rub ?? 0,
      payment_info: lesson.payment_info ?? tutorProfile?.payment_info ?? '',
    };
    paymentInfoMap.set(lessonId, info);
    return { ...info };
  },

  async getReceipts(filters?: { tutor_id?: string; student_id?: string }): Promise<Receipt[]> {
    await delay();
    let result = Array.from(receiptMap.values());
    if (filters?.tutor_id) {
      result = result.filter((r) => r.tutor_id === filters.tutor_id);
    }
    if (filters?.student_id) {
      result = result.filter((r) => r.student_id === filters.student_id);
    }
    return result.map((r) => ({ ...r }));
  },

  async submitReceipt(payload: {
    lesson_id: string;
    file_id: string;
  }): Promise<Receipt> {
    await delay();
    // Derive tutor_id, student_id, price_rub from the lesson (server-side behaviour)
    const lesson = lessonMap.get(payload.lesson_id);
    const slot = lesson ? slotMap.get(lesson.slot_id) : undefined;
    const tutorProfile = slot ? tutorProfileMap.get(slot.tutor_id) : undefined;

    const receipt: Receipt = {
      id: idGen2.next('r'),
      lesson_id: payload.lesson_id,
      tutor_id: slot?.tutor_id ?? '',
      student_id: lesson?.student_id ?? '',
      file_id: payload.file_id,
      price_rub: lesson?.price_rub ?? tutorProfile?.lesson_price_rub ?? 0,
      is_verified: false,
      created_at: new Date().toISOString(),
    };
    receiptMap.set(receipt.id, receipt);
    return { ...receipt };
  },

  async getReceipt(id: string): Promise<Receipt> {
    await delay();
    const receipt = receiptMap.get(id);
    if (!receipt) throw new Error(`Receipt ${id} not found`);
    return { ...receipt };
  },

  async verifyReceipt(id: string): Promise<Receipt> {
    await delay();
    const existing = receiptMap.get(id);
    if (!existing) throw new Error(`Receipt ${id} not found`);
    const updated: Receipt = { ...existing, is_verified: true };
    receiptMap.set(id, updated);
    return { ...updated };
  },

  async getReceiptFileUrl(receiptId: string): Promise<string> {
    await delay();
    return `https://mock-receipt-file.example.com/${receiptId}`;
  },
};

// ── Files ──
const filesApi: ApiFiles = {
  async initUpload(_uploadedBy: string, filename: string): Promise<{ file_id: string; upload_url: string }> {
    await delay();
    const fileId = idGen2.next('file');
    return {
      file_id: fileId,
      upload_url: `https://mock-upload.example.com/${fileId}`,
    };
  },

  async uploadFile(_uploadUrl: string, _file: File): Promise<void> {
    await delay();
  },

  async confirmUpload(fileId: string): Promise<FileInfo> {
    await delay();
    const meta = fileInfoMap.get(fileId);
    if (!meta) throw new Error(`File ${fileId} not found`);
    const confirmed = { ...meta, isUploaded: true };
    fileInfoMap.set(fileId, confirmed);
    return confirmed;
  },

  async getFileMeta(id: string): Promise<FileInfo> {
    await delay();
    const meta = fileInfoMap.get(id);
    if (!meta) throw new Error(`File ${id} not found`);
    return { ...meta };
  },

};

// ── Notifications ──
const notificationsApi: ApiNotifications = {
  async getNotifications(): Promise<Notification[]> {
    await delay();
    return Array.from(notificationMap.values())
      .map((n) => ({ ...n }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async markRead(id: string): Promise<void> {
    await delay();
    const existing = notificationMap.get(id);
    if (existing) {
      notificationMap.set(id, { ...existing, read: true });
    }
  },

  async markAllRead(): Promise<void> {
    await delay();
    for (const [id, n] of notificationMap) {
      notificationMap.set(id, { ...n, read: true });
    }
  },
};

// ── FAQ ──
const faqMap = new Map<string, FAQ>();
mockData.faqData.forEach((f) => faqMap.set(f.id, { ...f }));

const faqApi: ApiFAQ = {
  async listFAQs(category?: string): Promise<FAQ[]> {
    await delay();
    const all = [...faqMap.values()];
    return category ? all.filter((f) => f.category === category) : all;
  },
  async listCategories(): Promise<string[]> {
    await delay();
    const cats = new Set([...faqMap.values()].map((f) => f.category));
    return [...cats];
  },
  async getFAQ(id: string): Promise<FAQ> {
    await delay();
    const faq = faqMap.get(id);
    if (!faq) throw new Error('FAQ not found');
    return { ...faq };
  },
};

// ── Combined mock API ──
export const mockApi: ApiClient = {
  ...authApi,
  ...usersApi,
  ...tutorStudentsApi,
  ...slotsApi,
  ...lessonsApi,
  ...homeworkApi,
  ...paymentsApi,
  ...filesApi,
  ...notificationsApi,
  ...faqApi,
};
