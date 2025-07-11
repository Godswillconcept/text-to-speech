// src/contexts/AuthContext.jsx

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { apiClient, setupRequestInterceptor, setupResponseInterceptor } from '../utils/apiClient';
import { AuthContext } from './auth.context';

// Create the Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Create a ref to store the current logout function
  const logoutRef = useRef(null);

  // Logout function
  const logout = useCallback(() => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear authorization header
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  // Keep the ref updated with the latest logout function
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

    // Set up interceptors and initialize auth state
  useEffect(() => {
    // Setup request interceptor
    const requestInterceptor = setupRequestInterceptor(
      () => token,
      () => {}
    );

    // Setup response interceptor that uses the ref
    const handleUnauthenticated = () => {
      if (logoutRef.current) {
        logoutRef.current();
        // Redirect to login page when unauthorized
        window.location.href = '/login';
      }
    };

    const responseInterceptor = setupResponseInterceptor(handleUnauthenticated);

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken) {
          // Set the default authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Set the token in the state
          setToken(storedToken);
          
          // Set the user from localStorage
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              
              // Optional: Uncomment to validate token with backend on initial load
              // const { data } = await apiClient.get('/auth/me');
              // setUser(data);
              // localStorage.setItem('user', JSON.stringify(data));
            } catch (err) {
              console.error('Failed to parse user data', err);
              // Clear invalid user data
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
        // Clear invalid auth state using the ref
        if (logoutRef.current) {
          logoutRef.current();
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Cleanup interceptors on unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [token]); // Remove logout from dependencies



  // API methods
  const apiRequest = useCallback(async (method, url, data = null) => {
    setIsLoading(true);
    try {
      const response = await apiClient({
        method,
        url,
        data,
      });
      return { data: response.data, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const { data, error } = await apiRequest('post', '/auth/login', credentials);
      
      if (error) {
        return { success: false, error };
      }
      
      const { token: newToken, user: userData } = data;
      
      // Store the token and user data in localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update the state
      setToken(newToken);
      setUser(userData);
      
      // Set the default authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  }, [apiRequest]);

  const register = useCallback(async (userInfo) => {
    try {
      const { data, error } = await apiRequest('post', '/auth/register', userInfo);
      
      if (error) {
        return { success: false, error };
      }
      
      const { token: newToken, user: userData } = data;
      
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [apiRequest]);

  // Get current user data
  const getCurrentUser = useCallback(async () => {
    if (!token) return null;
    
    try {
      const { data } = await apiClient.get('/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      if (logoutRef.current) {
        logoutRef.current();
      }
      return null;
    }
  }, [token]); // Remove logout from dependencies since we use the ref

  // Calculate isAuthenticated based on both token and user
  const isAuthenticated = useMemo(() => {
    return !!(token && user);
  }, [token, user]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    apiRequest,
    login,
    register,
    logout,
    getCurrentUser,
  }), [
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    apiRequest,
    login,
    register,
    logout,
    getCurrentUser
  ]);
  
  // Show loading state while initializing
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  console.log('Auth state:', { isAuthenticated, token, user }); // Debug log

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
