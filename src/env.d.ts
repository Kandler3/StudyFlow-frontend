/// <reference types="vite/client" />

interface TelegramWebApp {
  platform: string;
  version: string;
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_NGROK_SKIP_WARNING: string;
  // Optional: dev initData for testing outside Telegram (Stage 2 TMA auth)
  readonly VITE_DEV_TELEGRAM_INIT_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
