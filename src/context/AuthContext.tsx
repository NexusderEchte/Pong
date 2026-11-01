import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'pp_auth_user';

function loadStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

function persistUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

const DELAY = 600;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await delay(DELAY);
      if (!email || !password) {
        throw new Error('E-Mail und Passwort sind erforderlich.');
      }
      const loggedInUser: User = {
        id: 'usr_1',
        username: email.split('@')[0],
        email,
      };
      setUser(loggedInUser);
      persistUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setLoading(true);
      try {
        await delay(DELAY);
        if (!username || !email || !password) {
          throw new Error('Alle Felder sind erforderlich.');
        }
        const newUser: User = {
          id: 'usr_' + Math.random().toString(36).slice(2, 9),
          username,
          email,
        };
        setUser(newUser);
        persistUser(newUser);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
