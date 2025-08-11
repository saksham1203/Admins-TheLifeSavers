import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';

interface User {
  userId: any;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobileNumber: string;
  bloodGroup: string;
  gender: string;
  availability: boolean;
  country: string;
  state: string;
  district: string;
  city: string;
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  reviewId?: string;
}

interface UserReview {
  _id: string;
  username: string;
  rating: number;
  comment: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userReview: UserReview | false | null;
  login: (token: string, user: User, userReview: UserReview | false) => void;
  logout: () => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userReview, setUserReview] = useState<UserReview | false | null>(null);

  const loadStoredAuth = async () => {
    const { value: token } = await Preferences.get({ key: 'token' });
    const { value: tokenExpiration } = await Preferences.get({ key: 'tokenExpiration' });

    if (token && tokenExpiration) {
      const now = new Date();
      const expirationDate = new Date(tokenExpiration);

      if (now < expirationDate) {
        setIsAuthenticated(true);
        const { value: storedUser } = await Preferences.get({ key: 'user' });
        const { value: storedUserReview } = await Preferences.get({ key: 'userReview' });

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedUserReview && storedUserReview !== 'false') {
          setUserReview(JSON.parse(storedUserReview));
        } else {
          setUserReview(false);
        }
      } else {
        logout();
      }
    }
  };

  const login = async (
    token: string,
    user: User,
    userReview: UserReview | false
  ) => {
    setIsAuthenticated(true);
    setUser(user);
    setUserReview(userReview);

    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // ✅ 1 month
    const expirationString = expirationDate.toISOString();

    await Preferences.set({ key: 'token', value: token });
    await Preferences.set({ key: 'tokenExpiration', value: expirationString });
    await Preferences.set({ key: 'user', value: JSON.stringify(user) });
    await Preferences.set({
      key: 'userReview',
      value: userReview ? JSON.stringify(userReview) : 'false',
    });
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserReview(null);

    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'tokenExpiration' });
    await Preferences.remove({ key: 'user' });
    await Preferences.remove({ key: 'userReview' });
  };

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
  };

  useEffect(() => {
    let listenerHandle: PluginListenerHandle;

    loadStoredAuth();

    const setupListener = async () => {
      listenerHandle = await App.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          const { value: token } = await Preferences.get({ key: 'token' });
          const { value: tokenExpiration } = await Preferences.get({ key: 'tokenExpiration' });

          if (!token || (tokenExpiration && new Date() > new Date(tokenExpiration))) {
            logout();
          }
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) listenerHandle.remove();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userReview,
        login,
        logout,
        setAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
