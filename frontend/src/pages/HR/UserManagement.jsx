import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Permission Modal State
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  // Edit Roles/Status State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    id: '',
    fullName: '',
    roles: [],
    enabled: true
  });
  const [savingUser, setSavingUser] = useState(false);

  const availableModules = [
    { key: 'students', label: 'Student Directory' },
    { key: 'employees', label: 'Staff Registry' },
    { key: 'departments', label: 'Departments' },
    { key: 'payroll', label: 'Payroll & Salary' },
    { key: 'academics', label: 'Academics & Timetable' },
    { key: 'library', label: 'Library Management' },
    { key: 'hostel', label: 'Hostel & Housing' },
    { key: 'transport', label: 'Transportation' },
    { key: 'finance', label: 'Finance & Invoices' },
    { key: 'notices', label: 'Notice & Campus Events' }
  ];

  const availableRoles = [
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_PRINCIPAL', label: 'Principal' },
    { value: 'ROLE_HOD', label: 'HOD (Head of Dept)' },
    { value: 'ROLE_TEACHER', label: 'Teacher' },
    { value: 'ROLE_ACCOUNTANT', label: 'Accountant' },
    { value: 'ROLE_LIBRARIAN', label: 'Librarian' },
    { value: 'ROLE_HOSTEL_WARDEN', label: 'Hostel Warden' },
    { value: 'ROLE_STAFF', label: 'Staff' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      // In the real backend, user list is a List, but handle any page/array structure just in case
      const data = response.data.content || response.data;
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch user accounts. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setEditUserData({
      id: user.id,
      fullName: user.fullName || user.username,
      roles: user.roles || [],
      enabled: user.enabled
    });
    setShowEditModal(true);
  };

  const handleRoleToggle = (role) => {
    setEditUserData(prev => {
      const currentRoles = [...prev.roles];
      if (currentRoles.includes(role)) {
        return { ...prev, roles: currentRoles.filter(r => r !== role) };
      } else {
        return { ...prev, roles: [...currentRoles, role] };
      }
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setSavingUser(true);
      await api.put(`/users/${editUserData.id}`, {
        roles: editUserData.roles,
        enabled: editUserData.enabled
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user data:', err);
      alert('Failed to update user account details.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleOpenPermissions = async (user) => {
    setSelectedUser(user);
    try {
      setSavingPerms(true);
      setShowPermModal(true);
      const response = await api.get(`/users/${user.id}/permissions`);
      
      // Map returned permissions to include all modules
      const fetchedPerms = response.data || [];
      const initializedPerms = availableModules.map(mod => {
        const found = fetchedPerms.find(p => p.moduleName === mod.key);
        return found ? {
          ...found
        } : {
          moduleName: mod.key,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false
        };
      });
      
      setUserPermissions(initializedPerms);
    } catch (err) {
      console.error('Error loading permissions:', err);
      alert('Failed to load user permissions.');
      setShowPermModal(false);
    } finally {
      setSavingPerms(false);
    }
  };

  const handlePermissionChange = (moduleKey, action) => {
    setUserPermissions(prev => prev.map(p => {
      if (p.moduleName === moduleKey) {
        return { ...p, [action]: !p[action] };
      }
      return p;
    }));
  };

  const handleToggleAllForModule = (moduleKey, setAllTo) => {
    setUserPermissions(prev => prev.map(p => {
      if (p.moduleName === moduleKey) {
        return {
          ...p,
          canView: setAllTo,
          canCreate: setAllTo,
          canEdit: setAllTo,
          canDelete: setAllTo
        };
      }
      return p;
    }));
  };

  const handleSavePermissions = async () => {
    try {
      setSavingPerms(true);
      await api.put(`/users/${selectedUser.id}/permissions`, userPermissions);
      setShowPermModal(false);
      // Optional: show a beautiful toast
    } catch (err) {
      console.error('Error saving permissions:', err);
      alert('Failed to update user permissions.');
    } finally {
      setSavingPerms(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you absolutely sure you want to delete the user account for ${user.fullName || user.username}? This will also wipe their custom access permissions.`)) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user account.');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="text-dark fw-bold mb-0">User Access Management</h2>
          <p className="text-muted mb-0 small">Manage user login credentials, security roles, and granular module permissions.</p>
        </div>
        <Button variant="outline-primary" className="rounded-pill px-3 shadow-none fw-semibold" onClick={fetchUsers} disabled={loading}>
          <i className={`bi bi-arrow-clockwise me-2 ${loading ? 'spin-animation' : ''}`}></i>Refresh List
        </Button>
      </div>

      {error && <Alert variant="danger" className="shadow-sm border-0">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" className="me-2" />
          <span className="text-muted fw-medium">Loading security accounts...</span>
        </div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light text-secondary small fw-bold uppercase">
                <tr>
                  <th className="px-4 py-3">User / Employee Code</th>
                  <th>Full Name</th>
                  <th>Official College Email</th>
                  <th>Security Roles</th>
                  <th>Account Status</th>
                  <th className="text-end px-4">Access Control</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(user => (
                  <tr key={user.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="user-avatar-sm bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          {user.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="fw-bold text-dark d-block">{user.username}</span>
                          <span className="text-muted small">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{user.fullName || 'N/A'}</span>
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`} className="text-decoration-none text-secondary">
                        <i className="bi bi-envelope-at me-2 text-muted"></i>{user.email}
                      </a>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map(role => (
                            <Badge key={role} bg="primary" className="bg-opacity-15 text-primary border border-primary border-opacity-25 rounded-pill px-2.5 py-1">
                              {role.replace('ROLE_', '')}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted small">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-1.5 ${user.enabled ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        <span className={`status-dot me-1.5 bg-${user.enabled ? 'success' : 'danger'}`}></span>
                        {user.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-end px-4">
                      <Button variant="light" size="sm" className="me-2 text-primary shadow-sm rounded-pill px-3 py-1.5 border" onClick={() => handleOpenPermissions(user)}>
                        <i className="bi bi-shield-lock-fill me-1.5"></i>Permissions
                      </Button>
                      <Button variant="light" size="sm" className="me-2 text-secondary shadow-sm rounded-pill px-2" onClick={() => handleOpenEditModal(user)}>
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button variant="light" size="sm" className="text-danger shadow-sm rounded-pill px-2" onClick={() => handleDeleteUser(user)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-shield-slash fs-2 d-block mb-2 text-muted"></i>
                      No user accounts found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Account Info & Roles Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">Modify Access Settings</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveUser}>
          <Modal.Body className="px-4 py-4">
            <h6 className="fw-bold text-secondary mb-3">User: {editUserData.fullName}</h6>
            
            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold">Login Enabled</Form.Label>
              <Form.Check 
                type="switch"
                id="user-enabled-switch"
                label={editUserData.enabled ? "Account is active and allowed to login" : "Account is suspended/disabled"}
                checked={editUserData.enabled}
                onChange={(e) => setEditUserData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="fw-medium text-dark"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="text-muted small fw-bold mb-2">Security Roles</Form.Label>
              <div className="d-flex flex-column gap-2 p-3 bg-light rounded-3 border">
                {availableRoles.map(role => (
                  <Form.Check 
                    key={role.value}
                    type="checkbox"
                    id={`role-check-${role.value}`}
                    label={role.label}
                    checked={editUserData.roles.includes(role.value)}
                    onChange={() => handleRoleToggle(role.value)}
                    className="fw-medium text-dark"
                  />
                ))}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowEditModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm" disabled={savingUser}>
              {savingUser ? 'Saving...' : 'Update Settings'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Permissions Management Matrix Modal */}
      <Modal show={showPermModal} onHide={() => setShowPermModal(false)} size="xl" centered scrollable>
        <Modal.Header closeButton className="border-0 bg-light px-4">
          <div>
            <Modal.Title className="fw-bold">Dynamic Permission Matrix</Modal.Title>
            <p className="text-muted mb-0 small">Assign custom system access privileges for {selectedUser?.fullName || selectedUser?.username}.</p>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          {savingPerms && userPermissions.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span>Loading authorization model...</span>
            </div>
          ) : (
            <div>
              {selectedUser?.roles?.includes('ROLE_ADMIN') && (
                <Alert variant="warning" className="border-0 shadow-sm mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Notice:</strong> This user has the **Admin** role. Administrators automatically possess full override permissions (Create, Edit, Delete, View) across all systems, regardless of the matrix below.
                </Alert>
              )}

              <Table responsive borderless className="align-middle">
                <thead>
                  <tr className="border-bottom text-muted small">
                    <th className="py-2.5" style={{ width: '30%' }}>System Module</th>
                    <th className="text-center">View (Read)</th>
                    <th className="text-center">Create (Write)</th>
                    <th className="text-center">Edit (Update)</th>
                    <th className="text-center">Delete (Destroy)</th>
                    <th className="text-end px-3">Module Access</th>
                  </tr>
                </thead>
                <tbody>
                  {userPermissions.map(p => {
                    const mod = availableModules.find(m => m.key === p.moduleName) || { label: p.moduleName };
                    const hasAll = p.canView && p.canCreate && p.canEdit && p.canDelete;
                    const hasNone = !p.canView && !p.canCreate && !p.canEdit && !p.canDelete;
                    
                    return (
                      <tr key={p.moduleName} className="border-bottom hover-row">
                        <td className="py-3">
                          <span className="fw-bold text-dark d-block">{mod.label}</span>
                          <code className="text-muted small" style={{ fontSize: '0.75rem' }}>module: {p.moduleName}</code>
                        </td>
                        <td className="text-center">
                          <Form.Check 
                            type="checkbox"
                            checked={p.canView}
                            onChange={() => handlePermissionChange(p.moduleName, 'canView')}
                            inline
                          />
                        </td>
                        <td className="text-center">
                          <Form.Check 
                            type="checkbox"
                            checked={p.canCreate}
                            onChange={() => handlePermissionChange(p.moduleName, 'canCreate')}
                            inline
                          />
                        </td>
                        <td className="text-center">
                          <Form.Check 
                            type="checkbox"
                            checked={p.canEdit}
                            onChange={() => handlePermissionChange(p.moduleName, 'canEdit')}
                            inline
                          />
                        </td>
                        <td className="text-center">
                          <Form.Check 
                            type="checkbox"
                            checked={p.canDelete}
                            onChange={() => handlePermissionChange(p.moduleName, 'canDelete')}
                            inline
                          />
                        </td>
                        <td className="text-end px-3">
                          <div className="btn-group btn-group-sm">
                            <Button 
                              variant={hasAll ? 'success' : 'outline-secondary'} 
                              size="sm"
                              className="px-2"
                              onClick={() => handleToggleAllForModule(p.moduleName, true)}
                            >
                              Allow All
                            </Button>
                            <Button 
                              variant={hasNone ? 'danger' : 'outline-secondary'} 
                              size="sm"
                              className="px-2"
                              onClick={() => handleToggleAllForModule(p.moduleName, false)}
                            >
                              Deny All
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light px-4">
          <Button variant="light" onClick={() => setShowPermModal(false)} className="rounded-pill px-4">Cancel</Button>
          <Button variant="primary" onClick={handleSavePermissions} className="rounded-pill px-4 shadow-sm" disabled={savingPerms}>
            {savingPerms ? 'Saving Changes...' : 'Save Matrix Rules'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
