import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import api from '../../services/api';

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const [currentSemester, setCurrentSemester] = useState({
    semesterName: '', semesterNumber: '', academicYearId: '', isCurrent: false
  });

  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/semesters');
      setSemesters(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await api.get('/academic-years');
      setAcademicYears(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentSemester({ semesterName: '', semesterNumber: '', academicYearId: '', isCurrent: false });
    setShowModal(true);
  };

  const handleOpenEdit = (semester) => {
    setIsEdit(true);
    setCurrentSemester({
      ...semester,
      academicYearId: semester.academicYear?.id || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSemester(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentSemester,
        academicYear: currentSemester.academicYearId ? { id: parseInt(currentSemester.academicYearId) } : null
      };
      
      if (isEdit) {
        await api.put(`/semesters/${currentSemester.id}`, payload);
      } else {
        await api.post('/semesters', payload);
      }
      setShowModal(false);
      fetchSemesters();
    } catch (error) {
      console.error('Error saving semester:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this semester?')) {
      try {
        await api.delete(`/semesters/${id}`);
        fetchSemesters();
      } catch (error) {
        console.error('Error deleting semester:', error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Semesters</h2>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Add Semester
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th>Number</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(semester => (
                <tr key={semester.id}>
                  <td className="px-4 fw-bold">{semester.semesterName}</td>
                  <td>{semester.semesterNumber}</td>
                  <td>{semester.academicYear?.yearLabel || 'N/A'}</td>
                  <td>
                    <Badge bg={semester.current || semester.isCurrent ? 'success' : 'secondary'}>
                      {semester.current || semester.isCurrent ? 'Current' : 'Past'}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(semester)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(semester.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Semester' : 'Add Semester'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Semester Name</Form.Label>
              <Form.Control type="text" name="semesterName" value={currentSemester.semesterName} onChange={handleFormChange} required placeholder="e.g. Semester I"/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Semester Number</Form.Label>
              <Form.Control type="number" name="semesterNumber" value={currentSemester.semesterNumber} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Academic Year</Form.Label>
              <Form.Select name="academicYearId" value={currentSemester.academicYearId} onChange={handleFormChange} required>
                <option value="">Select Academic Year</option>
                {academicYears.map(ay => (
                  <option key={ay.id} value={ay.id}>{ay.yearLabel}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Set as Current Semester" name="isCurrent" checked={currentSemester.current || currentSemester.isCurrent} onChange={handleFormChange} />
            </Form.Group>
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

export default Semesters;
