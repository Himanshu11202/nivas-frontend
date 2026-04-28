import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set base URL for all API calls
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add axios interceptor to automatically attach token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, id, email: userEmail, name, role, flatNumber, status } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, email: userEmail, name, role, flatNumber, status }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ id, email: userEmail, name, role, flatNumber, status });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      console.log('AuthContext: Registering user with data:', userData);
      const response = await axios.post('/api/auth/register', userData);
      console.log('AuthContext: Registration response:', response.data);
      
      const { token, id, email: userEmail, name, role, flatNumber, status } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, email: userEmail, name, role, flatNumber, status }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({ id, email: userEmail, name, role, flatNumber, status });
      return response.data;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      console.error('AuthContext: Error response:', error.response?.data);
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
