import { useState } from 'react';
import { AuthContext } from '@/auth/auth.hooks';
import api from '@/lib/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('lead_crm_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(null);


  const parseJwt = (tokenValue) => {
    try {
      const base64Url = tokenValue.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken } = response.data;

    sessionStorage.setItem('lead_crm_token', receivedToken);
    setToken(receivedToken);

    const decoded = parseJwt(receivedToken);
    const userPayload = {
      id: decoded?.userId,
      role: decoded?.role,
      email,
    };

    sessionStorage.setItem('lead_crm_user', JSON.stringify(userPayload));
    setUser(userPayload);

    return userPayload;
  };

  const register = async (name, email, password, role) => {
    await api.post('/auth/register', { name, email, password, role });
  };

  const logout = () => {
    sessionStorage.removeItem('lead_crm_token');
    sessionStorage.removeItem('lead_crm_user');
    setToken(null);
    setUser(null);
  };

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}
