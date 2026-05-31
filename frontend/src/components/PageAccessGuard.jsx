import React, { useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { PAGE_BY_KEY } from '../config/pagePermissions';

const PageAccessGuard = ({ pageKey, action = 'view', children }) => {
  const { hasPermission } = useContext(AuthContext);
  const pageLabel = PAGE_BY_KEY[pageKey]?.label || pageKey;

  if (!hasPermission(pageKey, action)) {
    return (
      <div className="container-fluid mt-4">
        <Alert variant="warning" className="border-0 shadow-sm">
          <i className="bi bi-shield-lock me-2"></i>
          You do not have permission to {action} the <strong>{pageLabel}</strong> page.
        </Alert>
      </div>
    );
  }

  return children;
};

export default PageAccessGuard;
