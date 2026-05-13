import httpClient from './httpClient';
import type { Assignment, Submission, Feedback } from '../types';

// ---------------------------------------------------------------------------
// Mapping helpers — backend camelCase -> frontend snake_case
// ---------------------------------------------------------------------------

function toAssignment(data: any): Assignment {
  return {
    id: String(data.id),
    tutor_id: String(data.tutorId ?? data.tutor_id),
    student_id: String(data.studentId ?? data.student_id),
    title: data.title,
    description: data.description,
    file_id: data.fileId ?? data.file_id,
    due_date: data.dueDate ?? data.due_date,
  };
}

function toSubmission(data: any): Submission {
  return {
    id: String(data.id),
    assignment_id: String(data.assignmentId ?? data.assignment_id),
    file_id: data.fileId ?? data.file_id,
    comment: data.comment,
    created_at: data.submittedAt ?? data.created_at ?? data.submitted_at,
  };
}

function toFeedback(data: any): Feedback {
  return {
    id: String(data.id),
    submission_id: String(data.submissionId ?? data.submission_id),
    file_id: data.fileId ?? data.file_id,
    comment: data.comment,
    grade: data.grade,
  };
}

// ---------------------------------------------------------------------------
// Assignment endpoints
// ---------------------------------------------------------------------------

/**
 * GET /homework/assignments
 *
 * Query params use snake_case per the OpenAPI spec.
 */
export async function getAssignments(
  filters?: {
    tutor_id?: string;
    student_id?: string;
    status_filter?: string;
  },
): Promise<Assignment[]> {
  const params: Record<string, string> = {};
  if (filters?.tutor_id) params.tutor_id = filters.tutor_id;
  if (filters?.student_id) params.student_id = filters.student_id;
  if (filters?.status_filter) params.status_filter = filters.status_filter;

  const { data } = await httpClient.get('/homework/assignments', { params });
  return (data as any[]).map(toAssignment);
}

/**
 * POST /homework/assignments
 *
 * Request body uses camelCase per the OpenAPI spec.
 */
export async function createAssignment(payload: {
  tutor_id: string;
  student_id: string;
  title: string;
  description: string;
  file_id?: string;
  due_date: string;
}): Promise<Assignment> {
  const body: Record<string, unknown> = {
    tutorId: payload.tutor_id,
    studentId: payload.student_id,
    title: payload.title,
    description: payload.description,
    dueDate: payload.due_date,
  };
  if (payload.file_id !== undefined) body.fileId = payload.file_id;

  const { data } = await httpClient.post('/homework/assignments', body);
  return toAssignment(data);
}

/**
 * There is no GET /homework/assignments/{id} endpoint in the OpenAPI spec.
 * Fetch all assignments and filter locally by id.
 */
export async function getAssignment(id: string): Promise<Assignment> {
  const assignments = await getAssignments({});
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) throw new Error(`Assignment ${id} not found`);
  return assignment;
}

/**
 * PATCH /homework/assignments/{id}
 *
 * Request body uses camelCase.
 */
export async function updateAssignment(
  id: string,
  fields: Partial<Pick<Assignment, 'title' | 'description' | 'file_id' | 'due_date'>>,
): Promise<Assignment> {
  const body: Record<string, unknown> = {};
  if (fields.title !== undefined) body.title = fields.title;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.file_id !== undefined) body.fileId = fields.file_id;
  if (fields.due_date !== undefined) body.dueDate = fields.due_date;

  const { data } = await httpClient.patch(`/homework/assignments/${id}`, body);
  return toAssignment(data);
}

/**
 * DELETE /homework/assignments/{id}
 *
 * Returns 200 with no body on success.
 */
export async function deleteAssignment(id: string): Promise<void> {
  await httpClient.delete(`/homework/assignments/${id}`);
}

// ---------------------------------------------------------------------------
// Submission endpoints
// ---------------------------------------------------------------------------

/**
 * GET /homework/assignments/{assignment_id}/submissions
 */
export async function getSubmissions(assignmentId: string): Promise<Submission[]> {
  const { data } = await httpClient.get(
    `/homework/assignments/${assignmentId}/submissions`,
  );
  return (data as any[]).map(toSubmission);
}

/**
 * POST /homework/submissions
 *
 * Request body uses camelCase.
 */
export async function createSubmission(payload: {
  assignment_id: string;
  file_id?: string;
  comment?: string;
}): Promise<Submission> {
  const body: Record<string, unknown> = {
    assignmentId: payload.assignment_id,
  };
  if (payload.file_id !== undefined) body.fileId = payload.file_id;
  if (payload.comment !== undefined) body.comment = payload.comment;

  const { data } = await httpClient.post('/homework/submissions', body);
  return toSubmission(data);
}

// ---------------------------------------------------------------------------
// Feedback endpoints
// ---------------------------------------------------------------------------

/**
 * GET /homework/assignments/{assignment_id}/feedbacks
 *
 * The real backend endpoint requires assignmentId in the path.
 * Throws if assignmentId is not provided.
 */
export async function getFeedbacks(assignmentId?: string): Promise<Feedback[]> {
  if (!assignmentId) {
    throw new Error(
      'getFeedbacks requires assignmentId in real mode. ' +
        'The backend endpoint is GET /homework/assignments/{assignment_id}/feedbacks.',
    );
  }
  const { data } = await httpClient.get(
    `/homework/assignments/${assignmentId}/feedbacks`,
  );
  return (data as any[]).map(toFeedback);
}

/**
 * POST /homework/feedbacks
 *
 * Request body uses camelCase. The backend accepts an optional grade (1-5).
 */
export async function createFeedback(payload: {
  submission_id: string;
  file_id?: string;
  comment?: string;
  grade?: number;
}): Promise<Feedback> {
  const body: Record<string, unknown> = {
    submissionId: payload.submission_id,
  };
  if (payload.file_id !== undefined) body.fileId = payload.file_id;
  if (payload.comment !== undefined) body.comment = payload.comment;
  if (payload.grade !== undefined) body.grade = payload.grade;

  const { data } = await httpClient.post('/homework/feedbacks', body);
  return toFeedback(data);
}

/**
 * PATCH /homework/feedbacks/{id}
 *
 * Request body uses camelCase. The backend accepts an optional grade (1-5).
 */
export async function updateFeedback(
  id: string,
  fields: Partial<Pick<Feedback, 'file_id' | 'comment'> & { grade?: number }>,
): Promise<Feedback> {
  const body: Record<string, unknown> = {};
  if (fields.file_id !== undefined) body.fileId = fields.file_id;
  if (fields.comment !== undefined) body.comment = fields.comment;
  if (fields.grade !== undefined) body.grade = fields.grade;

  const { data } = await httpClient.patch(`/homework/feedbacks/${id}`, body);
  return toFeedback(data);
}

// ---------------------------------------------------------------------------
// File URL endpoints
// ---------------------------------------------------------------------------

/**
 * GET /homework/assignments/{assignment_id}/file-url -> { url: string }
 */
export async function getAssignmentFileUrl(assignmentId: string): Promise<string> {
  const response = await httpClient.get(`/homework/assignments/${assignmentId}/file-url`);
  return response.data.url;
}

/**
 * GET /homework/submissions/{submission_id}/file-url -> { url: string }
 */
export async function getSubmissionFileUrl(submissionId: string): Promise<string> {
  const response = await httpClient.get(`/homework/submissions/${submissionId}/file-url`);
  return response.data.url;
}

/**
 * GET /homework/feedbacks/{feedback_id}/file-url -> { url: string }
 */
export async function getFeedbackFileUrl(feedbackId: string): Promise<string> {
  const response = await httpClient.get(`/homework/feedbacks/${feedbackId}/file-url`);
  return response.data.url;
}
