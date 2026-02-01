import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ title, showBack = false, action, onBack }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--tg-theme-bg-color,#fff)] border-b border-[var(--tg-theme-secondary-bg-color,#f4f4f5)]">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)] transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-[var(--tg-theme-text-color,#000)] truncate">
            {title}
          </h1>
        </div>
        {action && <div className="flex-shrink-0 ml-2">{action}</div>}
      </div>
    </header>
  );
}
