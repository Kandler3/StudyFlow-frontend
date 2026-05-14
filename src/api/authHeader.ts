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
 * window.Telegram.WebApp.platform is always set in Telegram's webview,
 * even before initData is populated.
 */
export function isInTelegramContext(): boolean {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg) return false;
    // platform is the most reliable indicator: it's set immediately by Telegram's webview
    return !!tg.platform;
  } catch {
    return false;
  }
}

/**
 * Return the initData string synchronously.
 *
 * Priority:
 *  1. Dev initData set via setDevInitData() (for loginWithTelegramId dev helper)
 *  2. window.Telegram.WebApp.initData (real Telegram context, with hash)
 *  3. window.Telegram.WebApp.initDataUnsafe (fallback, without hash — less secure)
 *  4. VITE_DEV_TELEGRAM_INIT_DATA env var (dev fallback, optional)
 */
export function getInitData(): string | null {
  if (cachedInitData) return cachedInitData;

  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.initData) return tg.initData;
    // initDataUnsafe exists but without hash — only use as last resort
    // when no dev fallback is configured
  } catch {
    // Not in Telegram context
  }

  const devInitData = import.meta.env.VITE_DEV_TELEGRAM_INIT_DATA as string | undefined;
  if (devInitData) return devInitData;

  // Only use unsafe initData if no dev fallback is available
  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe) {
      console.warn('Using initDataUnsafe — auth may fail on backend hash check');
      return tg.initDataUnsafe;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Wait for initData to become available (polls up to `maxWaitMs`).
 * Telegram WebView may not have populated initData immediately on page load.
 * Use this when you know you're in a Telegram context but initData is empty.
 */
export async function waitForInitData(maxWaitMs = 3000): Promise<string | null> {
  // Check immediately first
  const immediate = getInitData();
  if (immediate) return immediate;

  // If we're not even in Telegram, don't bother waiting
  if (!isInTelegramContext() && !cachedInitData && !import.meta.env.VITE_DEV_TELEGRAM_INIT_DATA) {
    return null;
  }

  // Poll with increasing delays
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 200));
    const initData = getInitData();
    if (initData) return initData;
  }

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
