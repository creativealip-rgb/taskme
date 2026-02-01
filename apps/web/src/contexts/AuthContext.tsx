import { createContext, useContext, ReactNode } from 'react';
import { authClient, useSession } from '../lib/auth-client';
import { User } from '../types/task';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signUp: (email: string, password: string, name?: string, onSuccess?: () => void, onError?: (error: Error) => void) => Promise<void>;
  signIn: (email: string, password: string, onSuccess?: () => void, onError?: (error: Error) => void) => Promise<void>;
  signOut: (onSuccess?: () => void, onError?: (error: Error) => void) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const session = useSession();

  const user: User | null = session.data?.user 
    ? {
        id: session.data.user.id,
        email: session.data.user.email,
        name: session.data.user.name || undefined,
      }
    : null;

  const signUp = async (
    email: string, 
    password: string, 
    name?: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await authClient.signUp.email(
      {
        email,
        password,
        name: name || '',
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (ctx: { error: Error }) => {
          onError?.(ctx.error);
        },
      }
    );
  };

  const signIn = async (
    email: string, 
    password: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (ctx: { error: Error }) => {
          onError?.(ctx.error);
        },
      }
    );
  };

  const signOut = async (
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (ctx: { error: Error }) => {
          onError?.(ctx.error);
        },
      }
    });
  };

  const refreshSession = async () => {
    await session.refetch();
  };

  const value: AuthContextType = {
    user,
    isLoading: session.isPending,
    isAuthenticated: !!user,
    error: session.error || null,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
