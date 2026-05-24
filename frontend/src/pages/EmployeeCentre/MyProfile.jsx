import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      // Fetch employee by email linked to the logged-in user
      const res = await api.get('/employees/search', { params: { keyword: user?.email, size: 1 } });
      const emp = res.data.content?.[0] || null;
      setEmployee(emp);
      if (emp) setFormData({ ...emp, departmentId: emp.department?.id || '' });
    } catch (err) {
      setError('Failed to load your employee profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/employees/${employee.id}`, {
        ...formData,
        department: formData.departmentId ? { id: parseInt(formData.departmentId) } : null
      });
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchMyProfile();
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" variant="primary" className="me-2" />
      <span className="text-muted">Loading your profile...</span>
    </div>
  );

  if (!employee) return (
    <div className="container-fluid mt-4">
      <Alert variant="warning" className="border-0 shadow-sm">
        <i className="bi bi-person-exclamation me-2"></i>
        No employee profile found for your account. Please contact HR.
      </Alert>
    </div>
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="fw-bold text-dark mb-0">My Profile</h2>
          <p className="text-muted mb-0 small">View and update your personal & professional details</p>
        </div>
        {!editMode ? (
          <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => setEditMode(true)}>
            <i className="bi bi-pencil-fill me-2"></i>Edit Profile
          </Button>
        ) : (
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => { setEditMode(false); setFormData({ ...employee }); }}>
            <i className="bi bi-x-lg me-2"></i>Cancel
          </Button>
        )}
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Profile Hero Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Card.Body className="p-4 text-white">
          <div className="d-flex align-items-center gap-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2"
              style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h3 className="fw-bold mb-1 text-white">{employee.firstName} {employee.lastName}</h3>
              <p className="mb-1 opacity-75"><i className="bi bi-briefcase me-2"></i>{employee.designation}</p>
              <p className="mb-1 opacity-75"><i className="bi bi-building me-2"></i>{employee.department?.name || 'N/A'}</p>
              <div className="d-flex gap-2 mt-2">
                <Badge bg="light" text="dark" className="rounded-pill px-3">{employee.employeeCode}</Badge>
                <Badge bg={employee.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-pill px-3">{employee.status}</Badge>
                <Badge bg="light" text="dark" className="rounded-pill px-3">{employee.employeeType}</Badge>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSave}>
        <Row className="g-4">
          {/* Personal Details */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-primary mb-3"><i className="bi bi-person-circle me-2"></i>Personal Information</h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="text-muted small fw-bold">First Name</Form.Label>
                    <Form.Control name="firstName" value={formData.firstName || ''} onChange={handleChange} disabled={!editMode} className="rounded-3" />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="text-muted small fw-bold">Last Name</Form.Label>
                    <Form.Control name="lastName" value={formData.lastName || ''} onChange={handleChange} disabled={!editMode} className="rounded-3" />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="text-muted small fw-bold">Date of Birth</Form.Label>
                    <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} disabled={!editMode} className="rounded-3" />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="text-muted small fw-bold">Address</Form.Label>
                    <Form.Control as="textarea" rows={2} name="address" value={formData.address || ''} onChange={handleChange} disabled={!editMode} className="rounded-3" />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact & Professional */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-primary mb-3"><i className="bi bi-telephone-fill me-2"></i>Contact & Professional</h6>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label className="text-muted small fw-bold">Official Email</Form.Label>
                    <Form.Control type="email" value={employee.email || ''} disabled className="rounded-3 bg-light" />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="text-muted small fw-bold">Phone Number</Form.Label>
                    <Form.Control name="phone" value={formData.phone || ''} onChange={handleChange} disabled={!editMode} className="rounded-3" />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="text-muted small fw-bold">Designation</Form.Label>
                    <Form.Control value={employee.designation || ''} disabled className="rounded-3 bg-light" />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="text-muted small fw-bold">Joining Date</Form.Label>
                    <Form.Control type="date" value={employee.joiningDate || ''} disabled className="rounded-3 bg-light" />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {editMode && (
          <div className="text-end mt-4">
            <Button variant="primary" type="submit" className="rounded-pill px-5 shadow-sm" disabled={saving}>
              {saving ? <><Spinner size="sm" className="me-2" />Saving...</> : <><i className="bi bi-check-circle-fill me-2"></i>Save Changes</>}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default MyProfile;
