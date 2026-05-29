import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import api from '../../services/api';

const AcademicYears = () => {
  const [years, setYears] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentYear, setCurrentYear] = useState({
    yearLabel: '', startYear: '', endYear: '', isCurrent: false
  });

  useEffect(() => {
    fetchYears();
  }, [currentPage]);

  const normalizeYear = (year) => ({
    ...year,
    yearLabel: year.yearLabel || year.name,
    startYear: year.startYear || (year.startDate ? new Date(year.startDate).getFullYear() : ''),
    endYear: year.endYear || (year.endDate ? new Date(year.endDate).getFullYear() : ''),
    isCurrent: year.isCurrent || year.current || year.isActive,
  });

  const fetchYears = async () => {
    try {
      const response = await api.get('/academic-years', {
        params: { page: currentPage, size: 10 }
      });
      const items = Array.isArray(response.data)
        ? response.data.map(normalizeYear)
        : [];
      setYears(items);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentYear({ yearLabel: '', startYear: '', endYear: '', isCurrent: false });
    setShowModal(true);
  };

  const handleOpenEdit = (year) => {
    setIsEdit(true);
    setCurrentYear(normalizeYear(year));
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentYear(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: currentYear.yearLabel,
      code: currentYear.code || currentYear.yearLabel,
      startDate: `${currentYear.startYear}-01-01`,
      endDate: `${currentYear.endYear}-12-31`,
      isActive: currentYear.isCurrent,
    };

    try {
      if (isEdit) {
        await api.put(`/academic-years/${currentYear.id}`, payload);
      } else {
        await api.post('/academic-years', payload);
      }
      setShowModal(false);
      fetchYears();
    } catch (error) {
      console.error('Error saving academic year:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        await api.delete(`/academic-years/${id}`);
        fetchYears();
      } catch (error) {
        console.error('Error deleting academic year:', error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Academic Years</h2>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Add Session
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th>Start Year</th>
                <th>End Year</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {years.map(year => (
                <tr key={year.id}>
                  <td className="px-4 fw-bold">{year.yearLabel}</td>
                  <td>{year.startYear}</td>
                  <td>{year.endYear}</td>
                  <td>
                    <Badge bg={year.isCurrent ? 'success' : 'secondary'}>
                      {year.isCurrent ? 'Current' : 'Past'}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(year)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(year.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {years.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No academic years found.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Session' : 'Add Session'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Session Label</Form.Label>
              <Form.Control type="text" name="yearLabel" value={currentYear.yearLabel} onChange={handleFormChange} required placeholder="e.g. 2025-2026"/>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Year</Form.Label>
                  <Form.Control type="number" name="startYear" value={currentYear.startYear} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Year</Form.Label>
                  <Form.Control type="number" name="endYear" value={currentYear.endYear} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Set as Current Academic Year" name="isCurrent" checked={currentYear.current || currentYear.isCurrent} onChange={handleFormChange} />
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

export default AcademicYears;
