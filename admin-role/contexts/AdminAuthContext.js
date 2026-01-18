import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTokenValid } from '../utils/auth';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const hasValidToken = await isTokenValid();
      setIsAuthenticated(hasValidToken);
    } catch (error) {
      console.error('Error checking admin auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};




