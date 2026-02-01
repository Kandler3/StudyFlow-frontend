import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-[var(--tg-theme-hint-color,#999)] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color,#000)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--tg-theme-hint-color,#999)] mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
