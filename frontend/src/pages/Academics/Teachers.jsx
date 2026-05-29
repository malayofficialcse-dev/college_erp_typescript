import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Pagination } from 'react-bootstrap';
import api from '../../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState({ keyword: '', departmentId: '' });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState({
    employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
    designation: '', qualification: '', joiningDate: '', status: 'ACTIVE', departmentId: ''
  });

  useEffect(() => { fetchTeachers(); fetchDepartments(); }, [currentPage, searchParams]);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers/search', { params: { ...searchParams, page: currentPage, size: 10 } });
      const data = res.data.content || res.data;
      setTeachers(Array.isArray(data) ? data : []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) { console.error(e); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      const data = res.data.content || res.data;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleSearchChange = (e) => {
    setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(0);
  };

  const openAdd = () => {
    setIsEdit(false);
    setCurrentTeacher({ employeeCode: '', firstName: '', lastName: '', email: '', phone: '', designation: '', qualification: '', joiningDate: '', status: 'ACTIVE', departmentId: '' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setIsEdit(true);
    setCurrentTeacher({ ...t, departmentId: t.department?.id || '' });
    setShowModal(true);
  };

  const handleChange = (e) => setCurrentTeacher(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employeeCode: currentTeacher.employeeCode,
        firstName: currentTeacher.firstName,
        lastName: currentTeacher.lastName,
        email: currentTeacher.email,
        phone: currentTeacher.phone,
        designation: currentTeacher.designation,
        qualification: currentTeacher.qualification,
        joiningDate: currentTeacher.joiningDate || undefined,
        status: currentTeacher.status,
        department: currentTeacher.departmentId,
      };
      if (isEdit) await api.put(`/teachers/${currentTeacher.id}`, payload);
      else await api.post('/teachers', payload);
      setShowModal(false); fetchTeachers();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await api.delete(`/teachers/${id}`); fetchTeachers(); } catch (e) { console.error(e); }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Teacher Management</h2>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Teacher</Button>
      </div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}><Form.Control placeholder="Search by name, code..." name="keyword" value={searchParams.keyword} onChange={handleSearchChange} /></Col>
            <Col md={4}>
              <Form.Select name="departmentId" value={searchParams.departmentId} onChange={handleSearchChange}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead><tr>
              <th className="px-4 py-3">Code</th><th>Name</th><th>Department</th>
              <th>Designation</th><th>Status</th><th className="text-end px-4">Actions</th>
            </tr></thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id}>
                  <td className="px-4 fw-bold">{t.employeeCode}</td>
                  <td>{t.firstName} {t.lastName}</td>
                  <td>{t.department?.name || 'N/A'}</td>
                  <td>{t.designation}</td>
                  <td><Badge bg={t.status === 'ACTIVE' ? 'success' : 'secondary'}>{t.status}</Badge></td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEdit(t)}><i className="bi bi-pencil"></i></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}><i className="bi bi-trash"></i></Button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No teachers found.</td></tr>}
            </tbody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <Pagination>
            <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} />
            {[...Array(totalPages).keys()].map(p => <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p + 1}</Pagination.Item>)}
            <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} />
          </Pagination>
        </div>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{isEdit ? 'Edit Teacher' : 'Add Teacher'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Employee Code</Form.Label><Form.Control name="employeeCode" value={currentTeacher.employeeCode} onChange={handleChange} required disabled={isEdit} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Department</Form.Label>
                <Form.Select name="departmentId" value={currentTeacher.departmentId} onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>First Name</Form.Label><Form.Control name="firstName" value={currentTeacher.firstName} onChange={handleChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Last Name</Form.Label><Form.Control name="lastName" value={currentTeacher.lastName} onChange={handleChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={currentTeacher.email} onChange={handleChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Phone</Form.Label><Form.Control name="phone" value={currentTeacher.phone} onChange={handleChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Designation</Form.Label><Form.Control name="designation" value={currentTeacher.designation} onChange={handleChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Joining Date</Form.Label><Form.Control type="date" name="joiningDate" value={currentTeacher.joiningDate} onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Status</Form.Label>
                <Form.Select name="status" value={currentTeacher.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </Form.Select>
              </Form.Group></Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Teachers;
