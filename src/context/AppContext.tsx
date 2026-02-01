import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../types';
import { currentUser } from '../data/mockData';

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: typeof currentUser;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('tutor');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{ userRole, setUserRole, currentUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
