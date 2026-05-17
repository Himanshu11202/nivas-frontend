import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getStoredUser, getStoredToken, saveAuthSession } from '../utils/authStorage';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://nivas-backend-we28.onrender.com';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const userPayload = saveAuthSession(response.data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(userPayload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const userPayload = saveAuthSession(response.data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(userPayload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
