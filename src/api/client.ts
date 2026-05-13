import { mockApi } from './mockStore';
import type { ApiClient } from './types';
import { signUpTelegram, getMe } from './auth';
import * as users from './users';
import * as schedule from './schedule';
import * as homework from './homework';
import * as payments from './payments';
import * as files from './files';
import * as faq from './faq';

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
    rescheduleLesson: schedule.rescheduleLesson,

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
    getAssignmentFileUrl: homework.getAssignmentFileUrl,
    getSubmissionFileUrl: homework.getSubmissionFileUrl,
    getFeedbackFileUrl: homework.getFeedbackFileUrl,

    // Payments
    getPaymentInfo: payments.getPaymentInfo,
    getReceipts: payments.getReceipts,
    submitReceipt: payments.submitReceipt,
    getReceipt: payments.getReceipt,
    verifyReceipt: payments.verifyReceipt,
    getReceiptFileUrl: payments.getReceiptFileUrl,

    // Files
    initUpload: files.initUpload,
    getFileMeta: files.getFileMeta,
    getFileUrl: files.getFileUrl,
    getFileDownloadUrl: files.getFileDownloadUrl,
    confirmUpload: files.confirmUpload,

    // Notifications — local only, use mock
    getNotifications: mockApi.getNotifications,
    markRead: mockApi.markRead,
    markAllRead: mockApi.markAllRead,

    // FAQ
    listFAQs: faq.listFAQs,
    listCategories: faq.listCategories,
    getFAQ: faq.getFAQ,
  };
}

// Build the real API client
const realApi = buildRealApi();

const apiClient: ApiClient = useMock ? mockApi : realApi;

if (!useMock) {
  console.log('StudyFlow: running in REAL API mode');
}

export { apiClient };
export default apiClient;
