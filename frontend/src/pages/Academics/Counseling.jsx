import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Row, Col, Pagination, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Counseling = () => {
  const navigate = useNavigate();
  const [counselings, setCounselings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ keyword: '', status: '' });
  const [alert, setAlert] = useState(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    previousQualification: '',
    desiredCourseId: '',
    counselorName: '',
    remarks: '',
    status: 'PENDING'
  });
  const [submitting, setSubmitting] = useState(false);

  const { hasPermission } = useContext(AuthContext);

  useEffect(() => {
    // We assume academics view permission gives access to counseling
    if (hasPermission('counseling', 'view')) {
      fetchCounselings();
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [currentPage, searchParams]);

  const fetchCounselings = async () => {
    try {
      setLoading(true);
      const activeParams = {};
      if (searchParams.status) activeParams.status = searchParams.status;
      
      const response = await api.get('/counseling', {
        params: activeParams
      });
      const records = response.data.content || response.data || [];
      const keyword = searchParams.keyword.trim().toLowerCase();
      const filteredRecords = keyword
        ? records.filter((item) =>
            [item.firstName, item.lastName, item.email, item.phone]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(keyword))
          )
        : records;
      setCounselings(filteredRecords);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching counselings:', error);
      setAlert({ type: 'danger', msg: 'Failed to load counseling records.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
    setCurrentPage(0);
  };

  const handleOpenModal = (counseling = null) => {
    if (counseling) {
      setIsEdit(true);
      setForm({
        ...counseling,
        desiredCourseId: counseling.desiredCourse?.id || counseling.desiredCourse || ''
      });
    } else {
      setIsEdit(false);
      setForm({
        firstName: '', lastName: '', email: '', phone: '',
        gender: 'Male', dateOfBirth: '', previousQualification: '',
        desiredCourseId: '', counselorName: '', remarks: '', status: 'PENDING'
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        desiredCourse: form.desiredCourseId || undefined
      };

      if (isEdit) {
        await api.put(`/counseling/${form.id}`, payload);
        setAlert({ type: 'success', msg: 'Counseling record updated.' });
      } else {
        await api.post('/counseling', payload);
        setAlert({ type: 'success', msg: 'Counseling record created.' });
      }
      setShowModal(false);
      fetchCounselings();
    } catch (error) {
      console.error('Error saving counseling:', error);
      setAlert({ type: 'danger', msg: 'Failed to save record.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/counseling/${id}`);
        fetchCounselings();
        setAlert({ type: 'success', msg: 'Record deleted.' });
      } catch (error) {
        console.error('Error deleting record:', error);
        setAlert({ type: 'danger', msg: 'Failed to delete record.' });
      }
    }
  };

  const handleAdmit = (counseling) => {
    // Navigate to admissions page and pass counseling state
    navigate('/admissions', { state: { counselingData: counseling } });
  };

  if (!hasPermission('counseling', 'view')) {
    return (
      <div className="container-fluid mt-4">
        <Alert variant="danger" className="shadow-sm border-0">
          <i className="bi bi-shield-slash-fill me-2"></i>
          <strong>Access Denied:</strong> You do not have permissions to view this module.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="text-dark fw-bold mb-0">Counseling Desk</h2>
          <p className="text-muted small mb-0">Manage prospective students and admission inquiries</p>
        </div>
        {hasPermission('counseling', 'create') && (
          <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-circle-fill me-2"></i>New Inquiry
          </Button>
        )}
      </div>

      {alert && <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <Card className="mb-4 shadow-sm border-0 rounded-4">
        <Card.Body className="bg-light rounded-4 p-3 d-flex gap-3 align-items-center flex-wrap">
          <Form.Control
            type="text"
            placeholder="Search name, email, phone..."
            name="keyword"
            value={searchParams.keyword}
            onChange={handleSearchChange}
            className="rounded-3 shadow-sm border-0"
            style={{ maxWidth: '300px' }}
          />
          <Form.Select
            name="status"
            value={searchParams.status}
            onChange={handleSearchChange}
            className="rounded-3 shadow-sm border-0"
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ADMITTED">Admitted</option>
            <option value="REJECTED">Rejected</option>
          </Form.Select>
          {(searchParams.keyword || searchParams.status) && (
            <Button variant="link" className="text-danger text-decoration-none" onClick={() => setSearchParams({keyword: '', status: ''})}>
              Clear Filters
            </Button>
          )}
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th>Contact Info</th>
                  <th>Desired Course</th>
                  <th>Counselor</th>
                  <th>Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {counselings.length > 0 ? (
                  counselings.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 fw-bold text-primary">{item.firstName} {item.lastName}</td>
                      <td>
                        <div className="small fw-semibold">{item.email}</div>
                        <div className="small text-muted"><i className="bi bi-telephone-fill me-1"></i>{item.phone}</div>
                      </td>
                      <td>{item.desiredCourse?.title || item.desiredCourse?.name || '-'}</td>
                      <td>{item.counselorName || '-'}</td>
                      <td>
                        <Badge bg={item.status === 'ADMITTED' ? 'success' : item.status === 'PENDING' ? 'warning' : 'danger'} className="rounded-pill px-3 py-2">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        {item.status === 'PENDING' && (
                          <Button variant="success" size="sm" className="rounded-pill me-2 fw-semibold shadow-sm" onClick={() => handleAdmit(item)}>
                            <i className="bi bi-check-circle-fill me-1"></i> Admit
                          </Button>
                        )}
                        <Button variant="light" size="sm" className="rounded-circle border me-2" onClick={() => handleOpenModal(item)}>
                          <i className="bi bi-pencil text-primary"></i>
                        </Button>
                        <Button variant="light" size="sm" className="rounded-circle border" onClick={() => handleDelete(item.id)}>
                          <i className="bi bi-trash text-danger"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-2 d-block mb-2"></i>No counseling records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-4">
          <Pagination>
            <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} />
            {[...Array(totalPages).keys()].map(page => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                {page + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)} />
          </Pagination>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="fw-bold"><i className="bi bi-person-lines-fill me-2 text-primary"></i>{isEdit ? 'Edit Counseling Record' : 'New Admission Inquiry'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">First Name *</Form.Label>
                  <Form.Control type="text" className="rounded-3" name="firstName" value={form.firstName} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Last Name *</Form.Label>
                  <Form.Control type="text" className="rounded-3" name="lastName" value={form.lastName} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Email Address *</Form.Label>
                  <Form.Control type="email" className="rounded-3" name="email" value={form.email} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Phone Number *</Form.Label>
                  <Form.Control type="text" className="rounded-3" name="phone" value={form.phone} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Date of Birth</Form.Label>
                  <Form.Control type="date" className="rounded-3" name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Gender</Form.Label>
                  <Form.Select className="rounded-3" name="gender" value={form.gender} onChange={handleFormChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Desired Course</Form.Label>
                  <Form.Select className="rounded-3" name="desiredCourseId" value={form.desiredCourseId} onChange={handleFormChange}>
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {[c.code || c.courseCode, c.name || c.title].filter(Boolean).join(' - ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Previous Qualification</Form.Label>
                  <Form.Control type="text" className="rounded-3" name="previousQualification" value={form.previousQualification} onChange={handleFormChange} placeholder="e.g. High School" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Counselor Name</Form.Label>
                  <Form.Control type="text" className="rounded-3" name="counselorName" value={form.counselorName} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Status</Form.Label>
                  <Form.Select className="rounded-3" name="status" value={form.status} onChange={handleFormChange}>
                    <option value="PENDING">Pending</option>
                    <option value="ADMITTED">Admitted</option>
                    <option value="REJECTED">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Remarks / Notes</Form.Label>
                  <Form.Control as="textarea" rows={3} className="rounded-3" name="remarks" value={form.remarks} onChange={handleFormChange} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Record'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Counseling;
