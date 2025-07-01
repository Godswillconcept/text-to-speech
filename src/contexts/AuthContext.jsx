// src/contexts/AuthContext.jsx

import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { loginUser as apiLogin, signupUser as apiSignup } from '../utils/api';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to load user info from token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          // Here you would typically decode the token to get user info or fetch it from a /me endpoint
          // For now, we'll just store the user in localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
        // Clear invalid auth state
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token: newToken, user: userData } = await apiLogin(credentials);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      const { token: newToken, user: userData } = await apiSignup(userInfo);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // useMemo ensures the context value object is only recreated when its dependencies change
  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    isInitialized,
    login,
    register,
    logout,
  }), [user, token, isInitialized, isLoading, error]);

  // Show loading state while initializing
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy consumption of the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
