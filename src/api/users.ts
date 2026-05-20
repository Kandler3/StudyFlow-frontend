import httpClient from './httpClient';
import type { User, TutorProfile, TutorStudent, Invitation } from '../types';

// ---------------------------------------------------------------------------
// Mapping helpers — backend and frontend live on different planets
// ---------------------------------------------------------------------------

// GET /users/users/{id} returns { id, role, firstName, lastName }
// (camelCase from Go, despite the rest of the API using snake_case)
function toUser(data: any): User {
  return {
    id: String(data.id),
    role: data.role,
    first_name: data.firstName ?? data.first_name ?? '',
    last_name: data.lastName ?? data.last_name ?? '',
    timezone: data.timezone ?? '',
    status: data.status ?? 'active',
  };
}

function toTutorProfile(data: any): TutorProfile {
  return {
    user_id: String(data.userId ?? data.user_id),
    payment_info: data.paymentInfo ?? data.payment_info ?? '',
    lesson_price_rub: data.lessonPriceRub ?? data.lesson_price_rub ?? 0,
    lesson_connection_link:
      data.lessonConnectionLink ?? data.lesson_connection_link ?? '',
  };
}

function toTutorStudent(data: any): TutorStudent {
  return {
    tutor_id: String(data.tutorId ?? data.tutor_id),
    student_id: String(data.studentId ?? data.student_id),
    lesson_price_rub: data.lessonPriceRub ?? data.lesson_price_rub,
    lesson_connection_link:
      data.lessonConnectionLink ?? data.lesson_connection_link,
    status: data.status,
  };
}

// ---------------------------------------------------------------------------
// User endpoints
// ---------------------------------------------------------------------------

export async function getUser(id: string): Promise<User> {
  const { data } = await httpClient.get(`/users/users/${id}`);
  return toUser(data);
}

export async function updateUser(
  id: string,
  fields: Partial<Pick<User, 'first_name' | 'last_name' | 'timezone'>>,
): Promise<User> {
  // Backend PATCH /users/users/{id} expects camelCase keys
  const body: Record<string, string | undefined> = {};
  if (fields.first_name !== undefined) body.firstName = fields.first_name;
  if (fields.last_name !== undefined) body.lastName = fields.last_name;
  if (fields.timezone !== undefined) body.timezone = fields.timezone;

  await httpClient.patch(`/users/users/${id}`, body);

  // PATCH returns 200 with no body — refetch to get the updated record
  return getUser(id);
}

// ---------------------------------------------------------------------------
// Tutor-profile endpoints
// ---------------------------------------------------------------------------

export async function getTutorProfile(userId: string): Promise<TutorProfile> {
  const { data } = await httpClient.get(`/users/tutor-profiles/${userId}`);
  return toTutorProfile(data);
}

export async function updateTutorProfile(
  userId: string,
  fields: Partial<
    Pick<TutorProfile, 'payment_info' | 'lesson_price_rub' | 'lesson_connection_link'>
  >,
): Promise<TutorProfile> {
  const body: Record<string, any> = {};
  if (fields.payment_info !== undefined) body.paymentInfo = fields.payment_info;
  if (fields.lesson_price_rub !== undefined)
    body.lessonPriceRub = fields.lesson_price_rub;
  if (fields.lesson_connection_link !== undefined)
    body.lessonConnectionLink = fields.lesson_connection_link;

  await httpClient.patch(`/users/tutor-profiles/${userId}`, body);

  return getTutorProfile(userId);
}

// ---------------------------------------------------------------------------
// Tutor-student endpoints
// ---------------------------------------------------------------------------

export async function getTutorStudents(tutorId: string): Promise<TutorStudent[]> {
  const { data } = await httpClient.get(
    `/users/tutor-students/by-tutor/${tutorId}`,
  );
  return (data.students ?? []).map(toTutorStudent);
}

export async function getStudentTutors(studentId: string): Promise<TutorStudent[]> {
  const { data } = await httpClient.get(
    `/users/tutor-students/by-student/${studentId}`,
  );
  return (data.tutors ?? []).map(toTutorStudent);
}

export async function getTutorStudent(
  tutorId: string,
  studentId: string,
): Promise<TutorStudent | undefined> {
  try {
    const { data } = await httpClient.get(
      `/users/tutor-students/${tutorId}/${studentId}`,
    );
    return toTutorStudent(data);
  } catch (error: any) {
    if (error.response?.status === 404) return undefined;
    throw error;
  }
}

export async function createTutorStudent(payload: {
  tutor_id: string;
  student_id: string;
  lesson_price_rub?: number;
  lesson_connection_link?: string;
}): Promise<TutorStudent> {
  // Backend expects camelCase
  const body: Record<string, any> = {
    tutorId: payload.tutor_id,
    studentId: payload.student_id,
  };
  if (payload.lesson_price_rub !== undefined)
    body.lessonPriceRub = payload.lesson_price_rub;
  if (payload.lesson_connection_link !== undefined)
    body.lessonConnectionLink = payload.lesson_connection_link;

  const { data } = await httpClient.post('/users/tutor-students', body);
  return toTutorStudent(data);
}

export async function updateTutorStudent(
  tutorId: string,
  studentId: string,
  fields: Partial<
    Pick<TutorStudent, 'lesson_price_rub' | 'lesson_connection_link' | 'status'>
  >,
): Promise<TutorStudent> {
  const body: Record<string, any> = {};
  if (fields.lesson_price_rub !== undefined)
    body.lessonPriceRub = fields.lesson_price_rub;
  if (fields.lesson_connection_link !== undefined)
    body.lessonConnectionLink = fields.lesson_connection_link;
  if (fields.status !== undefined)
    body.status = fields.status;

  const { data } = await httpClient.patch(
    `/users/tutor-students/${tutorId}/${studentId}`,
    body,
  );
  return toTutorStudent(data);
}

export async function deleteTutorStudent(
  tutorId: string,
  studentId: string,
): Promise<void> {
  await httpClient.delete(`/users/tutor-students/${tutorId}/${studentId}`);
}

// ---------------------------------------------------------------------------
// Invitation endpoints (token-based scheme)
// ---------------------------------------------------------------------------

function toInvitation(data: any): Invitation {
  return {
    id: String(data.id),
    token: data.token,
    tutor_id: String(data.tutorId ?? data.tutor_id),
    status: data.status,
    created_at: data.createdAt ?? data.created_at,
    edited_at: data.editedAt ?? data.edited_at,
  };
}

export async function createInvitation(): Promise<Invitation> {
  const { data } = await httpClient.post('/users/users/invitations');
  return toInvitation(data);
}

export async function listInvitations(): Promise<Invitation[]> {
  const { data } = await httpClient.get('/users/users/invitations');
  return (data.invitations ?? []).map(toInvitation);
}

export async function revokeInvitation(id: string): Promise<void> {
  await httpClient.delete(`/users/users/invitations/${id}`);
}

export async function acceptInvitationByToken(token: string): Promise<TutorStudent> {
  const { data } = await httpClient.post(`/users/users/invitations/${token}/accept`);
  return toTutorStudent(data);
}
