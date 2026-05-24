import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import api from '../../services/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentNotice, setCurrentNotice] = useState({
    title: '', content: '', noticeType: 'GENERAL', targetAudience: 'ALL', departmentId: '', expiryDate: '', isActive: true
  });

  useEffect(() => {
    fetchNotices();
    fetchDepartments();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await api.get('/notices');
      setNotices(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentNotice({ title: '', content: '', noticeType: 'GENERAL', targetAudience: 'ALL', departmentId: '', expiryDate: '', isActive: true });
    setShowModal(true);
  };

  const handleOpenEdit = (notice) => {
    setIsEdit(true);
    setCurrentNotice({
      ...notice,
      departmentId: notice.department?.id || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentNotice(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentNotice,
        department: currentNotice.departmentId ? { id: parseInt(currentNotice.departmentId) } : null
      };
      
      if (isEdit) {
        await api.put(`/notices/${currentNotice.id}`, payload);
      } else {
        await api.post('/notices', payload);
      }
      setShowModal(false);
      fetchNotices();
    } catch (error) {
      console.error('Error saving notice:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        fetchNotices();
      } catch (error) {
        console.error('Error deleting notice:', error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Notice Board</h2>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Create Notice
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th>Type</th>
                <th>Target</th>
                <th>Expiry</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(notice => (
                <tr key={notice.id}>
                  <td className="px-4 fw-bold">{notice.title}</td>
                  <td>{notice.noticeType}</td>
                  <td>{notice.targetAudience === 'DEPARTMENT' ? `Dept: ${notice.department?.name}` : notice.targetAudience}</td>
                  <td>{notice.expiryDate || 'No Expiry'}</td>
                  <td>
                    <Badge bg={notice.isActive ? 'success' : 'secondary'}>
                      {notice.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(notice)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(notice.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Notice' : 'Create Notice'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={currentNotice.title} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control as="textarea" rows={4} name="content" value={currentNotice.content} onChange={handleFormChange} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notice Type</Form.Label>
                  <Form.Select name="noticeType" value={currentNotice.noticeType} onChange={handleFormChange}>
                    <option value="GENERAL">General</option>
                    <option value="EXAM">Exam</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="CIRCULAR">Circular</option>
                    <option value="URGENT">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Audience</Form.Label>
                  <Form.Select name="targetAudience" value={currentNotice.targetAudience} onChange={handleFormChange}>
                    <option value="ALL">All</option>
                    <option value="STUDENTS">Students</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="STAFF">Staff</option>
                    <option value="DEPARTMENT">Specific Department</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {currentNotice.targetAudience === 'DEPARTMENT' && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Select name="departmentId" value={currentNotice.departmentId} onChange={handleFormChange} required>
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control type="date" name="expiryDate" value={currentNotice.expiryDate} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-center">
                <Form.Check type="switch" label="Is Active" name="isActive" checked={currentNotice.isActive} onChange={handleFormChange} />
              </Col>
            </Row>
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

export default Notices;
