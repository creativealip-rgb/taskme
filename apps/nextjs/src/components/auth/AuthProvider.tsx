'use client';

import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const user: User = {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
