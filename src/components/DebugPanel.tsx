import React from 'react';

interface DebugPanelProps {
  lastAuthError?: string | null;
}

export function DebugPanel({ lastAuthError }: DebugPanelProps) {
  const [expanded, setExpanded] = React.useState(false);

  const tg = (window as any).Telegram;
  const webApp = tg?.WebApp;

  const rows: [string, string][] = [
    ['User Agent', navigator.userAgent],
    ['Current URL', window.location.href],
    ['VITE_USE_MOCKS', import.meta.env.VITE_USE_MOCKS ?? 'undefined'],
    ['VITE_API_URL', import.meta.env.VITE_API_URL ?? 'undefined'],
    ['VITE_NGROK_SKIP_WARNING', import.meta.env.VITE_NGROK_SKIP_WARNING ?? 'undefined'],
    ['window.Telegram', tg ? 'exists' : 'NOT FOUND'],
    ['WebApp', webApp ? 'exists' : 'NOT FOUND'],
    ['WebApp.platform', webApp?.platform ?? '(empty)'],
    ['WebApp.version', webApp?.version ?? '(empty)'],
    ['initData', webApp?.initData || '(empty)'],
    ['initData length', String((webApp?.initData || '').length)],
    ['initDataUnsafe', webApp?.initDataUnsafe ? JSON.stringify(webApp.initDataUnsafe).slice(0, 200) : '(empty)'],
    ['WebApp.colorScheme', webApp?.colorScheme ?? '(empty)'],
    ['WebApp.viewportHeight', String(webApp?.viewportHeight ?? 0)],
    ['WebApp.viewportStableHeight', String(webApp?.viewportStableHeight ?? 0)],
    ['WebApp.isExpanded', String(webApp?.isExpanded ?? false)],
    ['Last Auth Error', lastAuthError ?? '(none)'],
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-3 mb-3 border border-gray-700">
      <div
        className="flex items-center justify-between cursor-pointer py-1"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs font-mono text-green-400 font-bold">Debug Info</span>
        <span className="text-xs text-green-400">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs font-mono">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="text-gray-400 shrink-0">{label}:</span>
              <span
                className="break-all"
                style={{
                  color: value === 'NOT FOUND' || value === '(empty)' ? '#f87171' : '#e2e8f0',
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
