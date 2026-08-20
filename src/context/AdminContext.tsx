import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        setIsAdmin(true);
        // By default, turn on admin mode if logged in
        setIsAdminMode(true);
      } else {
        setIsAdmin(false);
        setIsAdminMode(false);
      }
    } catch (err) {
      setIsAdmin(false);
      setIsAdminMode(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = () => {
    setIsAdmin(true);
    setIsAdminMode(true);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAdmin(false);
    setIsAdminMode(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isAdminMode, setIsAdminMode, login, logout, checkAuth }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
