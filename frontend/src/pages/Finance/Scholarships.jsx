import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import api from '../../services/api';

const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

const defaultForm = {
  student: '',
  scholarshipName: '',
  amount: '',
  provider: '',
  academicYear: '',
  status: 'ACTIVE',
  remarks: '',
};

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [current, setCurrent] = useState(defaultForm);
  const [alert, setAlert] = useState(null);

  const fetchScholarships = async () => {
    try {
      const response = await api.get('/scholarships');
      setScholarships(response.data.content || response.data || []);
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to fetch scholarships.' });
    }
  };

  const fetchLookups = async () => {
    try {
      const [studentResponse, yearResponse] = await Promise.all([
        api.get('/students/search', { params: { size: 300 } }),
        api.get('/academic-years'),
      ]);
      setStudents(studentResponse.data.content || studentResponse.data || []);
      setAcademicYears(yearResponse.data.content || yearResponse.data || []);
    } catch {
      setStudents([]);
      setAcademicYears([]);
    }
  };

  useEffect(() => {
    fetchScholarships();
    fetchLookups();
  }, []);

  const openAdd = () => {
    setIsEdit(false);
    setCurrent(defaultForm);
    setShowModal(true);
  };

  const openEdit = (scholarship) => {
    setIsEdit(true);
    setCurrent({
      id: scholarship.id || scholarship._id,
      student: scholarship.student?.id || scholarship.student?._id || '',
      scholarshipName: scholarship.scholarshipName || '',
      amount: scholarship.amount || '',
      provider: scholarship.provider || '',
      academicYear: scholarship.academicYear?.id || scholarship.academicYear?._id || '',
      status: scholarship.status || 'ACTIVE',
      remarks: scholarship.remarks || '',
    });
    setShowModal(true);
  };

  const saveScholarship = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...current,
        amount: Number(current.amount),
        academicYear: current.academicYear || undefined,
      };

      if (isEdit) {
        await api.put(`/scholarships/${current.id}`, payload);
      } else {
        await api.post('/scholarships', payload);
      }
      setAlert({ type: 'success', message: 'Scholarship saved successfully.' });
      setShowModal(false);
      fetchScholarships();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to save scholarship.' });
    }
  };

  const deleteScholarship = async (id) => {
    if (!window.confirm('Delete this scholarship record?')) return;
    try {
      await api.delete(`/scholarships/${id}`);
      setAlert({ type: 'success', message: 'Scholarship deleted.' });
      fetchScholarships();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to delete scholarship.' });
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Scholarships</h2>
          <p className="text-muted mb-0 small">Award, edit, and track student scholarships.</p>
        </div>
        <Button variant="primary" className="rounded-pill px-4" onClick={openAdd}>
          <i className="bi bi-gift me-2"></i>Award Scholarship
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type} className="border-0 shadow-sm" onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th>Scholarship</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.length ? scholarships.map((scholarship) => (
                <tr key={scholarship.id || scholarship._id}>
                  <td className="px-4">
                    <div className="fw-bold">{scholarship.student?.firstName} {scholarship.student?.lastName}</div>
                    <small className="text-muted">{scholarship.student?.enrollmentNumber}</small>
                  </td>
                  <td>{scholarship.scholarshipName}</td>
                  <td>{scholarship.provider || 'N/A'}</td>
                  <td className="fw-bold">{currency(scholarship.amount)}</td>
                  <td>{scholarship.academicYear?.name || 'N/A'}</td>
                  <td>
                    <Badge bg={scholarship.status === 'ACTIVE' ? 'success' : scholarship.status === 'EXPIRED' ? 'secondary' : 'danger'}>
                      {scholarship.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEdit(scholarship)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => deleteScholarship(scholarship.id || scholarship._id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No scholarships recorded.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Scholarship' : 'Award Scholarship'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveScholarship}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Student</Form.Label>
                <Form.Select value={current.student} onChange={(e) => setCurrent({ ...current, student: e.target.value })} required>
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id || student._id} value={student.id || student._id}>
                      [{student.enrollmentNumber}] {student.firstName} {student.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Academic Year</Form.Label>
                <Form.Select value={current.academicYear} onChange={(e) => setCurrent({ ...current, academicYear: e.target.value })}>
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id || year._id} value={year.id || year._id}>{year.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Scholarship Name</Form.Label>
                <Form.Control value={current.scholarshipName} onChange={(e) => setCurrent({ ...current, scholarshipName: e.target.value })} required />
              </Col>
              <Col md={3}>
                <Form.Label>Amount</Form.Label>
                <Form.Control type="number" min="0" value={current.amount} onChange={(e) => setCurrent({ ...current, amount: e.target.value })} required />
              </Col>
              <Col md={3}>
                <Form.Label>Status</Form.Label>
                <Form.Select value={current.status} onChange={(e) => setCurrent({ ...current, status: e.target.value })}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="REVOKED">REVOKED</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Provider</Form.Label>
                <Form.Control value={current.provider} onChange={(e) => setCurrent({ ...current, provider: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label>Remarks</Form.Label>
                <Form.Control value={current.remarks} onChange={(e) => setCurrent({ ...current, remarks: e.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Scholarships;
