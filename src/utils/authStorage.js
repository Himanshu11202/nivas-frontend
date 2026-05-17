import axios from 'axios';

export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem('token');

export const getRouteForRole = (role) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'SOCIETY_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'RESIDENT':
      return '/resident';
    case 'GUARD':
      return '/guard';
    default:
      return null;
  }
};

export const saveAuthSession = (authData) => {
  const {
    token,
    id,
    email,
    name,
    role,
    flatNumber,
    status,
    societyId,
    societyName,
    societyCode
  } = authData;

  const userPayload = {
    id,
    email,
    name,
    role,
    flatNumber,
    status,
    societyId,
    societyName,
    societyCode
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userPayload));

  return userPayload;
};

/** Refresh profile from server (society name, societyId, etc.) */
export const refreshUserProfile = async () => {
  const token = getStoredToken();
  if (!token) return null;

  const response = await axios.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = response.data;
  const existing = getStoredUser() || {};
  const userPayload = {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    flatNumber: data.flatNumber,
    status: data.status,
    societyId: data.societyId,
    societyName: data.societyName,
    societyCode: data.societyCode
  };

  localStorage.setItem('user', JSON.stringify(userPayload));
  if (existing.token || token) {
    localStorage.setItem('token', token);
  }

  return userPayload;
};
