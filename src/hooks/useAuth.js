import { useContext } from 'react';
import AuthContext from '../contexts/auth.context';

/**
 * Custom hook to access the authentication context
 * @returns {Object} The authentication context containing user, loading, and auth methods
 * @throws {Error} If used outside of an AuthProvider
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };
