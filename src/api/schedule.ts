import httpClient from './httpClient';
import type { Slot, Lesson } from '../types';

// ---------------------------------------------------------------------------
// Mapping helpers — backend returns camelCase JSON (Go), frontend uses
// snake_case internally.  Each mapper handles both naming conventions to
// stay resilient against backend inconsistencies.
// ---------------------------------------------------------------------------

function toSlot(data: any): Slot {
  return {
    id: String(data.id),
    tutor_id: data.tutorId ?? data.tutor_id ?? '',
    starts_at: data.startsAt ?? data.starts_at ?? '',
    ends_at: data.endsAt ?? data.ends_at ?? '',
    is_booked: data.isBooked ?? data.is_booked ?? false,
  };
}

function toLesson(data: any): Lesson {
  return {
    id: String(data.id),
    slot_id: data.slotId ?? data.slot_id ?? '',
    student_id: data.studentId ?? data.student_id ?? '',
    status: data.status ?? 'booked',
    is_paid: data.isPaid ?? data.is_paid ?? false,
    connection_link: data.connectionLink ?? data.connection_link,
    price_rub: data.priceRub ?? data.price_rub,
    payment_info: data.paymentInfo ?? data.payment_info,
  };
}

// ---------------------------------------------------------------------------
// Slots API
// ---------------------------------------------------------------------------

export async function createSlot(payload: {
  tutor_id: string;
  starts_at: string;
  ends_at: string;
}): Promise<Slot> {
  const { data } = await httpClient.post('/schedule/slots', {
    tutorId: payload.tutor_id,
    startsAt: payload.starts_at,
    endsAt: payload.ends_at,
  });
  return toSlot(data);
}

export async function getSlot(id: string): Promise<Slot> {
  const { data } = await httpClient.get(`/schedule/slots/${id}`);
  return toSlot(data);
}

export async function updateSlot(
  id: string,
  fields: Partial<Pick<Slot, 'starts_at' | 'ends_at'>>,
): Promise<Slot> {
  const body: Record<string, string> = {};
  if (fields.starts_at !== undefined) body.startsAt = fields.starts_at;
  if (fields.ends_at !== undefined) body.endsAt = fields.ends_at;
  const { data } = await httpClient.patch(`/schedule/slots/${id}`, body);
  return toSlot(data);
}

export async function deleteSlot(id: string): Promise<void> {
  await httpClient.delete(`/schedule/slots/${id}`);
}

export async function getTutorSlots(
  tutorId: string,
  onlyAvailable?: boolean,
): Promise<Slot[]> {
  const { data } = await httpClient.get(`/schedule/slots/by-tutor/${tutorId}`);
  const slots: Slot[] = (data.slots ?? []).map(toSlot);
  return onlyAvailable ? slots.filter(s => !s.is_booked) : slots;
}

// ---------------------------------------------------------------------------
// Lessons API
// ---------------------------------------------------------------------------

export async function getLessons(
  filters?: {
    tutor_id?: string;
    student_id?: string;
    status?: Lesson['status'];
    from?: string;
    to?: string;
  },
): Promise<Lesson[]> {
  const params: Record<string, string> = {};
  if (filters?.tutor_id !== undefined) params.tutor_id = filters.tutor_id;
  if (filters?.student_id !== undefined) params.student_id = filters.student_id;
  if (filters?.status !== undefined) params.status_filter = filters.status;
  if (filters?.from !== undefined) params.from = filters.from;
  if (filters?.to !== undefined) params.to = filters.to;
  const { data } = await httpClient.get('/schedule/lessons', { params });
  return (data.lessons ?? []).map(toLesson);
}

export async function createLesson(
  slotId: string,
  studentId: string,
): Promise<Lesson> {
  const { data } = await httpClient.post('/schedule/lessons', {
    slotId,
    studentId,
  });
  return toLesson(data);
}

export async function getLesson(id: string): Promise<Lesson> {
  const { data } = await httpClient.get(`/schedule/lessons/${id}`);
  return toLesson(data);
}

export async function updateLesson(
  id: string,
  fields: Partial<
    Pick<Lesson, 'connection_link' | 'price_rub' | 'payment_info'>
  >,
): Promise<Lesson> {
  const body: Record<string, any> = {};
  if (fields.connection_link !== undefined)
    body.connectionLink = fields.connection_link;
  if (fields.price_rub !== undefined) body.priceRub = fields.price_rub;
  if (fields.payment_info !== undefined)
    body.paymentInfo = fields.payment_info;
  const { data } = await httpClient.patch(`/schedule/lessons/${id}`, body);
  return toLesson(data);
}

export async function cancelLesson(id: string): Promise<Lesson> {
  const { data } = await httpClient.post(`/schedule/lessons/${id}/cancel`);
  return toLesson(data);
}

export async function rescheduleLesson(
  lessonId: string,
  newSlotId: string,
): Promise<Lesson> {
  const { data } = await httpClient.post(
    `/schedule/lessons/${lessonId}/reschedule`,
    { newSlotId },
  );
  return toLesson(data);
}
