import httpClient from './httpClient';
import type { User } from '../types';
import type { SignUpTelegramPayload } from './types';

/**
 * Normalize backend response to match frontend User type.
 * Backend returns camelCase (Go), frontend uses snake_case.
 */
function toUser(data: Record<string, unknown>): User {
  return {
    id: typeof data.id === 'number' ? String(data.id) : (data.id as string),
    role: (data.role as User['role']) || 'student',
    first_name: (data.firstName as string) ?? (data.first_name as string) ?? '',
    last_name: (data.lastName as string) ?? (data.last_name as string) ?? '',
    timezone: (data.timezone as string) ?? '',
    status: (data.status as User['status']) ?? 'active',
  };
}

/**
 * POST /users/sign-up/telegram
 *
 * Creates a new user via Telegram auth.
 * The backend expects camelCase JSON with telegramId as int64.
 */
export async function signUpTelegram(
  payload: SignUpTelegramPayload
): Promise<User> {
  const body: Record<string, unknown> = {
    telegramId: parseInt(payload.telegram_id, 10),
    role: payload.role || 'tutor',
  };
  if (payload.first_name) body.firstName = payload.first_name;
  if (payload.last_name) body.lastName = payload.last_name;
  if (payload.username) body.username = payload.username;
  if (payload.timezone) body.timezone = payload.timezone;

  const response = await httpClient.post('/users/sign-up/telegram', body);
  return toUser(response.data);
}

/**
 * GET /users/users/me
 *
 * Returns the current authenticated user based on HMAG telegram auth header.
 */
export async function getMe(): Promise<User> {
  const response = await httpClient.get('/users/users/me');
  return toUser(response.data);
}
