import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../../services/api';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchParams, setSearchParams] = useState({ date: new Date().toISOString().split('T')[0], subjectId: '' });
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({
    studentId: '', subjectId: '', date: new Date().toISOString().split('T')[0], status: 'PRESENT', remarks: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchStudents();
    fetchSubjects();
  }, [searchParams]);

  const fetchRecords = async () => {
    try {
      // Basic fetch, assuming backend has search by date and subject
      const response = await api.get('/attendance', { params: searchParams });
      setRecords(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 100 } });
      setStudents(response.data.content || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/search', { params: { size: 100 } });
      setSubjects(response.data.content || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentRecord({ studentId: '', subjectId: searchParams.subjectId, date: searchParams.date, status: 'PRESENT', remarks: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (record) => {
    setIsEdit(true);
    setCurrentRecord({
      ...record,
      studentId: record.student?.id || '',
      subjectId: record.subject?.id || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentRecord,
        student: currentRecord.studentId ? { id: parseInt(currentRecord.studentId) } : null,
        subject: currentRecord.subjectId ? { id: parseInt(currentRecord.subjectId) } : null
      };
      
      if (isEdit) {
        await api.put(`/attendance/${currentRecord.id}`, payload);
      } else {
        await api.post('/attendance', payload);
      }
      setShowModal(false);
      fetchRecords();
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Attendance</h2>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Mark Attendance
        </Button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}>
              <Form.Control type="date" name="date" value={searchParams.date} onChange={handleSearchChange} />
            </Col>
            <Col md={4}>
              <Form.Select name="subjectId" value={searchParams.subjectId} onChange={handleSearchChange}>
                <option value="">Select Subject to filter</option>
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td className="px-4 fw-bold">{record.student?.firstName} {record.student?.lastName}</td>
                  <td>{record.subject?.name}</td>
                  <td>{record.date}</td>
                  <td>
                    <Badge bg={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : 'warning'}>
                      {record.status}
                    </Badge>
                  </td>
                  <td>{record.remarks}</td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEdit(record)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No records found for selected date/subject.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Record' : 'Mark Attendance'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select name="studentId" value={currentRecord.studentId} onChange={handleFormChange} required disabled={isEdit}>
                <option value="">Select Student</option>
                {students.map(st => <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Select name="subjectId" value={currentRecord.subjectId} onChange={handleFormChange} required>
                <option value="">Select Subject</option>
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="date" value={currentRecord.date} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={currentRecord.status} onChange={handleFormChange}>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="EXCUSED">Excused</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control type="text" name="remarks" value={currentRecord.remarks} onChange={handleFormChange} />
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

export default Attendance;
