import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getPageKeyFromPath, PAGE_BY_KEY } from '../config/pagePermissions';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPermissions = async (userId) => {
    const id = userId || user?.id;
    if (!id) {
      setPermissions([]);
      return;
    }

    try {
      const response = await api.get(`/users/${id}/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      setPermissions([]);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchPermissions(user.id);
    } else {
      setPermissions([]);
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { accessToken, id, email, roles } = response.data; // Adapting to JwtResponse structure
      const token = response.data.accessToken || response.data.token;
      if (!token) {
         console.warn("No token returned from backend!");
      }
      localStorage.setItem('token', token);
      const userData = { username: response.data.username, id, email, roles };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions([]);
    navigate('/login');
  };

  const hasPermission = (pageKey, action) => {
    if (!user) return false;
    if (user.roles?.includes('ROLE_ADMIN')) return true;

    const permission = permissions.find((item) => item.moduleName === pageKey);
    if (!permission) return false;

    const actionMap = {
      view: 'canView',
      create: 'canCreate',
      edit: 'canEdit',
      delete: 'canDelete',
    };

    return !!permission[actionMap[action]];
  };

  const hasPageAccess = (path, action = 'view') => {
    const pageKey = getPageKeyFromPath(path);
    if (!pageKey) return true;
    if (PAGE_BY_KEY[pageKey]?.alwaysVisible) return true;
    return hasPermission(pageKey, action);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, hasPermission, hasPageAccess, fetchPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};
