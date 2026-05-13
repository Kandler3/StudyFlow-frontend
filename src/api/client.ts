import { mockApi } from './mockStore';
import type { ApiClient } from './types';
import { signUpTelegram, getMe } from './auth';
import * as users from './users';
import * as schedule from './schedule';
import * as homework from './homework';
import * as payments from './payments';
import * as files from './files';

const useMock = import.meta.env.VITE_USE_MOCKS === 'true';

function buildRealApi(): ApiClient {
  return {
    // Auth
    signUpTelegram,
    getMe,

    // Users
    getUser: users.getUser,
    updateUser: users.updateUser,
    getTutorProfile: users.getTutorProfile,
    updateTutorProfile: users.updateTutorProfile,

    // Tutor-Student
    getTutorStudents: users.getTutorStudents,
    getStudentTutors: users.getStudentTutors,
    getTutorStudent: users.getTutorStudent,
    createTutorStudent: users.createTutorStudent,
    acceptInvitation: users.acceptInvitation,
    updateTutorStudent: users.updateTutorStudent,
    deleteTutorStudent: users.deleteTutorStudent,

    // Slots
    createSlot: schedule.createSlot,
    getSlot: schedule.getSlot,
    updateSlot: schedule.updateSlot,
    deleteSlot: schedule.deleteSlot,
    getTutorSlots: schedule.getTutorSlots,

    // Lessons
    getLessons: schedule.getLessons,
    createLesson: schedule.createLesson,
    getLesson: schedule.getLesson,
    updateLesson: schedule.updateLesson,
    cancelLesson: schedule.cancelLesson,

    // Homework
    getAssignments: homework.getAssignments,
    createAssignment: homework.createAssignment,
    getAssignment: homework.getAssignment,
    updateAssignment: homework.updateAssignment,
    deleteAssignment: homework.deleteAssignment,
    getSubmissions: homework.getSubmissions,
    createSubmission: homework.createSubmission,
    getFeedbacks: homework.getFeedbacks,
    createFeedback: homework.createFeedback,
    updateFeedback: homework.updateFeedback,

    // Payments
    getPaymentInfo: payments.getPaymentInfo,
    getReceipts: payments.getReceipts,
    submitReceipt: payments.submitReceipt,
    getReceipt: payments.getReceipt,
    verifyReceipt: payments.verifyReceipt,

    // Files
    initUpload: files.initUpload,
    getFileMeta: files.getFileMeta,
    getFileUrl: files.getFileUrl,

    // Notifications — local only, use mock
    getNotifications: mockApi.getNotifications,
    markRead: mockApi.markRead,
    markAllRead: mockApi.markAllRead,
  };
}

// Build the real API client and attach extra functions not in the ApiClient interface
const realApi = buildRealApi();

// Extra domain-specific file URL functions (not in ApiClient interface)
(realApi as any).getAssignmentFileUrl = homework.getAssignmentFileUrl;
(realApi as any).getSubmissionFileUrl = homework.getSubmissionFileUrl;
(realApi as any).getFeedbackFileUrl = homework.getFeedbackFileUrl;
(realApi as any).getReceiptFileUrl = payments.getReceiptFileUrl;
(realApi as any).confirmUpload = files.confirmUpload;

const apiClient: ApiClient = useMock ? mockApi : realApi;

if (!useMock) {
  console.log('StudyFlow: running in REAL API mode');
}

export { apiClient };
export default apiClient;
