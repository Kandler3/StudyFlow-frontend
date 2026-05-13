let cachedHeader: string | null = null;
let cachedTelegramId: string | null = null;

async function generateAuthHeader(telegramId: string): Promise<string> {
  const secret = import.meta.env.VITE_TELEGRAM_SECRET as string;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${telegramId}:${timestamp}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hmac = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `telegram ${telegramId}:${timestamp}:${hmac}`;
}

export function setTelegramId(telegramId: string): void {
  if (telegramId !== cachedTelegramId) {
    cachedTelegramId = telegramId;
    cachedHeader = null;
    localStorage.setItem('telegram_id', telegramId);
  }
}

export function clearTelegramId(): void {
  cachedTelegramId = null;
  cachedHeader = null;
  localStorage.removeItem('telegram_id');
}

export async function refreshAuthHeader(): Promise<string> {
  const telegramId = cachedTelegramId || localStorage.getItem('telegram_id');
  if (!telegramId) throw new Error('No telegram_id found');
  cachedTelegramId = telegramId;
  cachedHeader = await generateAuthHeader(telegramId);
  return cachedHeader;
}

export function getCachedAuthHeader(): string | null {
  return cachedHeader;
}

export function getCachedTelegramId(): string | null {
  return cachedTelegramId || localStorage.getItem('telegram_id');
}
