import httpClient from './httpClient';
import type { User } from '../types';
import type { SignUpTelegramPayload } from './types';

/**
 * Normalize backend response to match frontend User type.
 * Go may serialize int64 IDs as numbers — convert to string.
 */
function toUser(data: Record<string, unknown>): User {
  return {
    ...(data as unknown as User),
    id: typeof data.id === 'number' ? String(data.id) : (data.id as string),
  };
}

/**
 * POST /users/sign-up/telegram
 *
 * Creates a new user via Telegram auth.
 * The backend expects snake_case JSON with telegram_id as int64.
 */
export async function signUpTelegram(
  payload: SignUpTelegramPayload
): Promise<User> {
  const body: Record<string, unknown> = {
    telegram_id: parseInt(payload.telegram_id, 10),
    role: payload.role || 'tutor',
  };
  if (payload.first_name) body.first_name = payload.first_name;
  if (payload.last_name) body.last_name = payload.last_name;
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
