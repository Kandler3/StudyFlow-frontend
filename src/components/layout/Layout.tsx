import React, { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children?: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color,#f4f4f5)]">
      <main className={hideNav ? '' : 'pb-20'}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
