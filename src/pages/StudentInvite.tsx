import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const TG_BOT_LINK = 'https://t.me/StudyFlowBot';

export function StudentInvite() {
  const { authUser } = useApp();
  const [copied, setCopied] = useState(false);

  if (!authUser || authUser.role !== 'tutor') {
    return (
      <Layout hideNav>
        <Header title="Пригласить ученика" showBack />
        <div className="p-4">
          <Card>
            <p className="text-center text-[var(--tg-theme-hint-color,#999)]">
              Доступ запрещён. Только преподаватель может приглашать учеников.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  const inviteLink = `${TG_BOT_LINK}?start=invite_${authUser.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Не удалось скопировать ссылку');
    }
  };

  return (
    <Layout hideNav>
      <Header
        title="Пригласить ученика"
        showBack
      />

      <div className="p-4 space-y-4">
        <Card>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-[var(--tg-theme-text-color,#000)] mb-1">
                  Пригласительная ссылка
                </h3>
                <p className="text-sm text-[var(--tg-theme-hint-color,#999)] leading-relaxed">
                  Отправьте эту ссылку ученику. Когда ученик откроет её в Telegram, связь будет создана автоматически.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl p-3">
              <code className="flex-1 text-sm break-all select-all font-mono text-[var(--tg-theme-text-color,#000)]">
                {inviteLink}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h3 className="font-semibold text-[var(--tg-theme-text-color,#000)] mb-1">
                Статус приглашения
              </h3>
              <p className="text-sm text-[var(--tg-theme-hint-color,#999)] leading-relaxed">
                После отправки ссылки, ученик должен открыть её для активации связи.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
