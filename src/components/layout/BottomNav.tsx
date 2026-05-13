import React from 'react';
import { NavLink } from 'react-router';
import { Calendar, Users, ClipboardList, CreditCard, MoreHorizontal, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function BottomNav() {
  const { authUser } = useApp();

  const tutorNav = [
    { to: '/schedule', icon: Calendar, label: 'Расписание' },
    { to: '/students', icon: Users, label: 'Ученики' },
    { to: '/assignments', icon: ClipboardList, label: 'Задания' },
    { to: '/payments', icon: CreditCard, label: 'Оплаты' },
    { to: '/more', icon: MoreHorizontal, label: 'Ещё' },
  ];

  const studentNav = [
    { to: '/schedule', icon: Calendar, label: 'Расписание' },
    { to: '/assignments', icon: ClipboardList, label: 'Задания' },
    { to: '/payments', icon: CreditCard, label: 'Оплаты' },
    { to: '/settings', icon: Settings, label: 'Настройки' },
  ];

  const navItems = authUser?.role === 'tutor' ? tutorNav : studentNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--tg-theme-bg-color,#fff)] border-t border-[var(--tg-theme-secondary-bg-color,#f4f4f5)] safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all flex-1 max-w-[80px] ${
                isActive
                  ? 'text-[var(--tg-theme-button-color,#3390ec)]'
                  : 'text-[var(--tg-theme-hint-color,#999)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
