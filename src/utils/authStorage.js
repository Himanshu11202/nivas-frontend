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
  const { token, id, email, name, role, flatNumber, status, societyId } = authData;
  const userPayload = { id, email, name, role, flatNumber, status, societyId };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userPayload));

  return userPayload;
};
