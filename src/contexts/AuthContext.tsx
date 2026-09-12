import { createContext, useEffect, useReducer, type ReactNode } from 'react';
import { getIdTokenResult, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export type Role = 'customer' | 'admin';

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: User; role: Role };

type AuthAction =
  { type: 'SESSION_ANONYMOUS' } | { type: 'SESSION_AUTHENTICATED'; user: User; role: Role };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SESSION_ANONYMOUS':
      return { status: 'anonymous' };
    case 'SESSION_AUTHENTICATED':
      return { status: 'authenticated', user: action.user, role: action.role };
    default:
      return state;
  }
}

export type AuthContextValue = AuthState & { logout: () => Promise<void> };

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { status: 'loading' });

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        dispatch({ type: 'SESSION_ANONYMOUS' });
        return;
      }

      getIdTokenResult(user, true)
        .then((tokenResult) => {
          const role: Role = tokenResult.claims.role === 'admin' ? 'admin' : 'customer';
          dispatch({ type: 'SESSION_AUTHENTICATED', user, role });
        })
        .catch(() => {
          dispatch({ type: 'SESSION_AUTHENTICATED', user, role: 'customer' });
        });
    });
  }, []);

  async function logout(): Promise<void> {
    await signOut(auth);
  }

  return <AuthContext.Provider value={{ ...state, logout }}>{children}</AuthContext.Provider>;
}
