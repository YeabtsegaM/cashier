'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/utils/api';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    sessionId?: string;
    displayUrl?: string;
  } | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const router = useRouter();

  useEffect(() => {
    // Don't check auth on login page
    if (window.location.pathname === '/') {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('cashierToken');

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        return;
      }

      // Verify token with server
      const response = await apiClient.verifyToken();
      
      if (response.success && response.data?.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          isLoading: false
        });
      } else {
        localStorage.removeItem('cashierToken');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        router.push('/');
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      
      // Handle different types of errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        // Server is not available - keep user logged in if they have a token
        const token = localStorage.getItem('cashierToken');
        if (token) {
          setAuthState({
            isAuthenticated: true,
            user: null, // We don't have user data, but keep them logged in
            isLoading: false
          });
          return;
        }
      }
      
      // Handle 401 errors (invalid/expired token)
      if (error.message?.includes('401') || error.message?.includes('Invalid token') || error.message?.includes('Token expired')) {
        localStorage.removeItem('cashierToken');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        if (window.location.pathname !== '/') {
          router.push('/');
        }
        return;
      }
      
      // For other errors, clear token and redirect
      localStorage.removeItem('cashierToken');
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      if (window.location.pathname !== '/') {
        router.push('/');
      }
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Clear any existing token first
      localStorage.removeItem('cashierToken');
      
      const response = await apiClient.login(username, password);
      
      console.log('🔍 Login response received:', response);
      console.log('🔍 User data from response:', response.data?.user);
      
      if (response.success && response.data?.token && response.data?.user) {
        localStorage.setItem('cashierToken', response.data.token);
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          isLoading: false
        });
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      // Clear token immediately to prevent race conditions
      localStorage.removeItem('cashierToken');
      
      // Update state immediately
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      
      // Try to call server logout (non-blocking)
      try {
        await apiClient.logout();
      } catch (error) {
        console.error('Server logout error:', error);
        // Continue with logout even if server call fails
      }
      
      // Redirect to login page
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure we still logout even if there's an error
      router.push('/');
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth
  };
} 