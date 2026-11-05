'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { User, ApiResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'doctor_tracker_admin_user';
const TOKEN_STORAGE_KEY = 'doctor_tracker_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem(USER_STORAGE_KEY);
    }
    return true;
  });

  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      if (response.data.success && response.data.data?.user) {
        const activeUser = response.data.data.user;
        setUser(activeUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
      } else {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; token?: string }>>('/auth/login', {
        email,
        password,
      });

      if (response.data.success && response.data.data?.user) {
        const activeUser = response.data.data.user;
        setUser(activeUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
        if (response.data.data.token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, response.data.data.token);
        }
        router.push('/dashboard');
      }
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Proceed with cleanup
    } finally {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
