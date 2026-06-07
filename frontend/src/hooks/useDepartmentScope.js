import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Returns the logged-in user's department scope.
 *
 * - isAdmin      → true for ROLE_ADMIN (unrestricted, no dept filter)
 * - departmentId → MongoDB ObjectId string of the user's department, or null
 * - departmentName → Display name, e.g. "Computer Science"
 */
const useDepartmentScope = () => {
  const { user } = useContext(AuthContext);

  const isAdmin  = user?.roles?.includes('ROLE_ADMIN') ?? false;
  const isStudent = user?.roles?.includes('ROLE_STUDENT') ?? false;

  return {
    isAdmin,
    isStudent,
    /** Null for admins and students → means "no restriction / fetch all" */
    departmentId:   isAdmin || isStudent ? null : (user?.departmentId ?? null),
    departmentName: isAdmin || isStudent ? null : (user?.departmentName ?? null),
  };
};

export default useDepartmentScope;
