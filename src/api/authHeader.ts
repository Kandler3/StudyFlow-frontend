/**
 * authHeader.ts — TMA initData authentication.
 *
 * The client NEVER has access to TELEGRAM_SECRET.
 * It simply passes window.Telegram.WebApp.initData as the Authorization header.
 * The backend validates the HMAC signature inside initData using its own TELEGRAM_SECRET.
 */

let cachedInitData: string | null = null;

/**
 * Check whether we are running inside a Telegram Mini App context.
 * Must be called after the Telegram WebApp SDK has initialised.
 */
export function isInTelegramContext(): boolean {
  try {
    return !!(window.Telegram?.WebApp?.initData);
  } catch {
    return false;
  }
}

/**
 * Return the initData string.
 *
 * Priority:
 *  1. Dev initData set via setDevInitData() (for loginWithTelegramId dev helper)
 *  2. window.Telegram.WebApp.initData (real Telegram context)
 *  3. VITE_DEV_TELEGRAM_INIT_DATA env var (dev fallback, optional)
 */
export function getInitData(): string | null {
  if (cachedInitData) return cachedInitData;

  try {
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) return initData;
  } catch {
    // Not in Telegram context
  }

  const devInitData = import.meta.env.VITE_DEV_TELEGRAM_INIT_DATA as string | undefined;
  if (devInitData) return devInitData;

  return null;
}

/**
 * Build the Authorization header value: "tma <initData>".
 * Returns null when initData is not available.
 */
export function getAuthHeader(): string | null {
  const initData = getInitData();
  if (!initData) return null;
  return `tma ${initData}`;
}

/**
 * Parse the telegram user id from an initData string.
 * The `user` parameter is a URL-encoded JSON object containing Telegram user info.
 */
export function parseTelegramId(initData: string): string | null {
  try {
    const params = new URLSearchParams(initData);
    const userRaw = params.get('user');
    if (!userRaw) return null;
    const user = JSON.parse(decodeURIComponent(userRaw));
    return String(user.id);
  } catch {
    return null;
  }
}

/**
 * Parse the full Telegram user object from an initData string.
 * Returns the parsed user object or null on failure.
 */
export function parseTelegramUser(initData: string): Record<string, unknown> | null {
  try {
    const params = new URLSearchParams(initData);
    const userRaw = params.get('user');
    if (!userRaw) return null;
    return JSON.parse(decodeURIComponent(userRaw));
  } catch {
    return null;
  }
}

/**
 * Extract Telegram user name fields from initData.
 * Returns first_name, last_name, username from the `user` JSON parameter.
 */
export function parseTelegramUserNames(
  initData: string
): { first_name?: string; last_name?: string; username?: string } {
  try {
    const user = parseTelegramUser(initData);
    if (!user) return {};
    return {
      first_name: (user.first_name as string) || undefined,
      last_name: (user.last_name as string) || undefined,
      username: (user.username as string) || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Clear cached auth state (used on logout).
 * Does NOT touch localStorage — initData is never persisted.
 */
export function clearAuth(): void {
  cachedInitData = null;
}

/**
 * Set a dev initData string (for use by loginWithTelegramId in real mode).
 * This allows testing outside of the Telegram context.
 */
export function setDevInitData(initData: string): void {
  cachedInitData = initData;
}
