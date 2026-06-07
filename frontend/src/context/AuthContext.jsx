import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getPageKeyFromPath, PAGE_BY_KEY } from '../config/pagePermissions';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]             = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  const fetchPermissions = async (userId) => {
    const id = userId || user?.id;
    if (!id) { setPermissions([]); return; }
    try {
      const response = await api.get(`/users/${id}/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
      setPermissions([]);
    }
  };

  /* ── resolve department for employee accounts ──────────────────────── */
  const resolveDepartment = async (userId, roles) => {
    console.log('[AuthContext] resolveDepartment called for userId:', userId, 'roles:', roles);
    // Admins are unrestricted — no dept scoping
    if (roles?.includes('ROLE_ADMIN')) {
      console.log('[AuthContext] User is admin, returning null scope');
      return { departmentId: null, departmentName: null };
    }
    // Students already have dept in their student profile, resolved elsewhere
    if (roles?.includes('ROLE_STUDENT')) {
      console.log('[AuthContext] User is student, returning null scope');
      return { departmentId: null, departmentName: null };
    }

    try {
      const res = await api.get(`/users/${userId}/employee`);
      console.log('[AuthContext] fetched employee profile:', res.data);
      const employee = res.data?.data || res.data;
      if (employee?.department) {
        const dept = employee.department;
        console.log('[AuthContext] resolved department:', dept);
        return {
          departmentId:   dept._id || dept.id || null,
          departmentName: dept.name || null,
        };
      } else {
        console.warn('[AuthContext] employee profile has no department linked!');
      }
    } catch (err) {
      console.error('[AuthContext] failed to fetch employee department:', err);
    }
    return { departmentId: null, departmentName: null };
  };

  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      console.log('[AuthContext] restoreSession, storedUser:', storedUser, 'hasToken:', !!token);
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        try {
          const { departmentId, departmentName } = await resolveDepartment(parsed.id, parsed.roles);
          console.log('[AuthContext] resolved scope in restoreSession:', { departmentId, departmentName });
          const updatedUser = { ...parsed, departmentId, departmentName };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (err) {
          console.error("[AuthContext] Failed to restore department scope:", err);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (user?.id) {
      console.log('[AuthContext] user changed, fetching permissions for:', user.id);
      fetchPermissions(user.id);
    } else {
      setPermissions([]);
    }
  }, [user]);

  /* ── login ─────────────────────────────────────────────────────────── */
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { id, email, roles } = response.data;
      const token = response.data.accessToken || response.data.token;
      if (!token) console.warn('No token returned from backend!');

      localStorage.setItem('token', token);

      const departmentScope = response.data.departmentId
        ? {
            departmentId: response.data.departmentId,
            departmentName: response.data.departmentName || null,
          }
        : await resolveDepartment(id, roles);

      const userData = {
        username: response.data.username,
        id,
        email,
        roles,
        departmentId: departmentScope.departmentId,
        departmentName: departmentScope.departmentName,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
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
    if (PAGE_BY_KEY[pageKey]?.alwaysVisible) return true;
    if (user.roles?.includes('ROLE_STUDENT') && pageKey?.startsWith('student-portal')) return true;

    const permission = permissions.find((item) => item.moduleName === pageKey);
    if (!permission) return false;

    const actionMap = { view: 'canView', create: 'canCreate', edit: 'canEdit', delete: 'canDelete' };
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
