import httpClient from './httpClient';
import type { PaymentInfo, Receipt } from '../types';

// ---------------------------------------------------------------------------
// Mapping helpers — backend returns camelCase, frontend uses snake_case
// ---------------------------------------------------------------------------

function toReceipt(data: any): Receipt {
  return {
    id: String(data.id),
    lesson_id: String(data.lessonId ?? data.lesson_id),
    tutor_id: String(data.tutorId ?? data.tutor_id ?? ''),
    student_id: String(data.studentId ?? data.student_id ?? ''),
    file_id: String(data.fileId ?? data.file_id),
    price_rub: data.priceRub ?? data.price_rub ?? 0,
    is_verified: data.isVerified ?? data.is_verified ?? false,
    created_at: data.createdAt ?? data.created_at ?? '',
  };
}

function toPaymentInfo(data: any): PaymentInfo {
  return {
    lesson_id: String(data.lessonId ?? data.lesson_id),
    price_rub: data.priceRub ?? data.price_rub ?? 0,
    payment_info: data.paymentInfo ?? data.payment_info ?? '',
  };
}

// ---------------------------------------------------------------------------
// Payment endpoints
// ---------------------------------------------------------------------------

/**
 * GET /payment/info/{lesson_id} → PaymentInfo
 */
export async function getPaymentInfo(lessonId: string): Promise<PaymentInfo> {
  const { data } = await httpClient.get(`/payment/info/${lessonId}`);
  return toPaymentInfo(data);
}

/**
 * GET /payment/receipts?tutor_id=... OR ?student_id=...
 *
 * Exactly one of tutor_id or student_id should be provided.
 * The response is wrapped in { receipts: [...] } — unwrap to return Receipt[].
 */
export async function getReceipts(
  filters?: { tutor_id?: string; student_id?: string },
): Promise<Receipt[]> {
  const params: Record<string, string> = {};
  if (filters?.tutor_id) params.tutor_id = filters.tutor_id;
  if (filters?.student_id) params.student_id = filters.student_id;

  const { data } = await httpClient.get('/payment/receipts', { params });
  const items: any[] = data.receipts ?? data ?? [];
  return items.map(toReceipt);
}

/**
 * POST /payment/receipts
 *
 * Only { lessonId, fileId } is sent to the backend — the rest
 * (tutor_id, student_id, price_rub) is inferred from the lesson server-side.
 */
export async function submitReceipt(payload: {
  lesson_id: string;
  file_id: string;
}): Promise<Receipt> {
  const body = {
    lessonId: payload.lesson_id,
    fileId: payload.file_id,
  };
  const { data } = await httpClient.post('/payment/receipts', body);
  return toReceipt(data);
}

/**
 * GET /payment/receipts/{id} → Receipt
 */
export async function getReceipt(id: string): Promise<Receipt> {
  const { data } = await httpClient.get(`/payment/receipts/${id}`);
  return toReceipt(data);
}

/**
 * POST /payment/receipts/{id}/verify → Receipt (with is_verified=true)
 */
export async function verifyReceipt(id: string): Promise<Receipt> {
  const { data } = await httpClient.post(`/payment/receipts/${id}/verify`);
  return toReceipt(data);
}

/**
 * GET /payment/receipts/{id}/file-url -> { url: string }
 */
export async function getReceiptFileUrl(receiptId: string): Promise<string> {
  const response = await httpClient.get(`/payment/receipts/${receiptId}/file-url`);
  return response.data.url;
}
