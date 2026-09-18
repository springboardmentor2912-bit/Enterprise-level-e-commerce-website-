import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopstack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shopstack_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('shopstack_token', token);
    } else {
      localStorage.removeItem('shopstack_token');
      localStorage.removeItem('shopstack_user');
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      const data = res.data;
      setToken(data.accessToken);
      setUser(data);
      localStorage.setItem('shopstack_user', JSON.stringify(data));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      const data = res.data;
      setToken(data.accessToken);
      setUser(data);
      localStorage.setItem('shopstack_user', JSON.stringify(data));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('shopstack_token');
    localStorage.removeItem('shopstack_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isVendor = user?.role === 'VENDOR';
  const isCustomer = user?.role === 'CUSTOMER';
  const isWarehouseStaff = user?.role === 'WAREHOUSE_STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isVendor,
        isCustomer,
        isWarehouseStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
