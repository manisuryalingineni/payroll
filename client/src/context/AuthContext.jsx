import { createContext, useContext, useState } from 'react';
import api from '../api';

const Ctx = createContext(null);

export const useAuth = () => useContext(Ctx);

function readStoredUser() {
  try {
    // No token means not logged in, whatever else is stored
    if (!localStorage.getItem('token')) return null;

    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined') return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error('Invalid stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}