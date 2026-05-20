import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Trash2, Plus, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import type { Invitation } from '../types';

const TG_BOT_LINK = 'https://t.me/sstudyflowbot';

const statusLabels: Record<Invitation['status'], string> = {
  active: 'Активно',
  used: 'Использовано',
  revoked: 'Отозвано',
};

const statusBadgeVariants: Record<Invitation['status'], 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  used: 'warning',
  revoked: 'secondary',
};

function buildInviteLink(token: string): string {
  return `${TG_BOT_LINK}?startapp=invite_${token}`;
}

export function StudentInvite() {
  const { authUser } = useApp();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const list = await apiClient.listInvitations();
      setInvitations(list);
    } catch {
      toast.error('Не удалось загрузить приглашения');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

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

  const handleCreate = async () => {
    try {
      setCreating(true);
      const invitation = await apiClient.createInvitation();
      setInvitations((prev) => [invitation, ...prev]);
      toast.success('Приглашение создано!');
    } catch {
      toast.error('Не удалось создать приглашение');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      setRevoking(id);
      await apiClient.revokeInvitation(id);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, status: 'revoked' as const, edited_at: new Date().toISOString() } : inv,
        ),
      );
      toast.success('Приглашение отозвано');
    } catch {
      toast.error('Не удалось отозвать приглашение');
    } finally {
      setRevoking(null);
    }
  };

  const handleCopy = async (token: string, id: string) => {
    try {
      await navigator.clipboard.writeText(buildInviteLink(token));
      setCopiedId(id);
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const activeInvitations = invitations.filter((inv) => inv.status === 'active');

  return (
    <Layout hideNav>
      <Header title="Пригласить ученика" showBack />

      <div className="p-4 space-y-4">
        {/* Create button */}
        <Button
          onClick={handleCreate}
          disabled={creating}
          className="w-full"
          size="lg"
        >
          {creating ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Plus className="w-5 h-5 mr-2" />
          )}
          Создать приглашение
        </Button>

        {/* Instructions */}
        {activeInvitations.length === 0 && !loading && (
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-semibold text-[var(--tg-theme-text-color,#000)] mb-1">
                  Как это работает
                </h3>
                <p className="text-sm text-[var(--tg-theme-hint-color,#999)] leading-relaxed">
                  Нажмите «Создать приглашение», чтобы получить ссылку.
                  Отправьте её ученику в Telegram. Когда ученик откроет ссылку,
                  связь будет создана автоматически.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--tg-theme-hint-color,#999)]" />
          </div>
        )}

        {/* Invitation list */}
        {invitations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--tg-theme-hint-color,#999)] px-1">
              Приглашения ({invitations.length})
            </h3>
            {invitations.map((inv) => {
              const isRevoking = revoking === inv.id;
              const isCopied = copiedId === inv.id;

              return (
                <Card key={inv.id}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={statusBadgeVariants[inv.status]} size="sm">
                        {statusLabels[inv.status]}
                      </Badge>
                      <span className="text-xs text-[var(--tg-theme-hint-color,#999)]">
                        {new Date(inv.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>

                    {inv.status === 'active' && (
                      <>
                        <div className="flex items-center gap-2 bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] rounded-xl p-3">
                          <code className="flex-1 text-sm break-all select-all font-mono text-[var(--tg-theme-text-color,#000)]">
                            {buildInviteLink(inv.token)}
                          </code>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopy(inv.token, inv.id)}
                            className="flex-1"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            {isCopied ? 'Скопировано' : 'Копировать'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(inv.id)}
                            disabled={isRevoking}
                            className="text-[#ff3b30]"
                          >
                            {isRevoking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
