import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../../services/api';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [current, setCurrent] = useState({
    studentId: '', scholarshipName: '', amount: '', provider: '', academicYear: '', status: 'ACTIVE'
  });

  useEffect(() => {
    fetchScholarships();
    fetchStudents();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await api.get('/scholarships');
      setScholarships(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 100 } });
      setStudents(response.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...current,
        student: current.studentId ? { id: parseInt(current.studentId) } : null,
        amount: parseFloat(current.amount)
      };

      if (isEdit) {
        await api.put(`/scholarships/${current.id}`, payload);
      } else {
        await api.post('/scholarships', payload);
      }
      setShowModal(false);
      fetchScholarships();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scholarship record?')) {
      try {
        await api.delete(`/scholarships/${id}`);
        fetchScholarships();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Scholarships Management</h2>
        <Button variant="primary" onClick={() => { setIsEdit(false); setCurrent({ studentId: '', scholarshipName: '', amount: '', provider: '', academicYear: '', status: 'ACTIVE' }); setShowModal(true); }}>
          <i className="bi bi-gift me-2"></i>Award Scholarship
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th>Scholarship Name</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map(s => (
                <tr key={s.id}>
                  <td className="px-4 fw-bold">{s.student?.firstName} {s.student?.lastName}</td>
                  <td>{s.scholarshipName}</td>
                  <td>{s.provider}</td>
                  <td>${s.amount}</td>
                  <td>{s.academicYear}</td>
                  <td>
                    <Badge bg={s.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setIsEdit(true); setCurrent({...s, studentId: s.student?.id || ''}); setShowModal(true); }}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {scholarships.length === 0 && (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No scholarships recorded.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Award Scholarship Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Scholarship' : 'Award Scholarship'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select name="studentId" value={current.studentId} onChange={e => setCurrent({...current, studentId: e.target.value})} required>
                <option value="">Select Student</option>
                {students.map(st => (
                  <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Scholarship Name</Form.Label>
              <Form.Control type="text" name="scholarshipName" value={current.scholarshipName} onChange={e => setCurrent({...current, scholarshipName: e.target.value})} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Control type="text" name="provider" value={current.provider} onChange={e => setCurrent({...current, provider: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control type="number" step="0.01" name="amount" value={current.amount} onChange={e => setCurrent({...current, amount: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control type="text" name="academicYear" value={current.academicYear} onChange={e => setCurrent({...current, academicYear: e.target.value})} placeholder="e.g. 2025-2026" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={current.status} onChange={e => setCurrent({...current, status: e.target.value})}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Scholarships;
