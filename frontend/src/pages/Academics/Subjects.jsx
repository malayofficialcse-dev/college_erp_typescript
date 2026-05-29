import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Pagination } from 'react-bootstrap';
import api from '../../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState({ keyword: '', courseId: '' });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [current, setCurrent] = useState({ subjectCode: '', name: '', description: '', credits: '', semesterNumber: '', subjectType: 'Theory', courseId: '', semesterId: '', teacherId: '' });

  useEffect(() => { fetchSubjects(); fetchCourses(); fetchSemesters(); fetchTeachers(); }, [currentPage, searchParams]);

  const normalizeSubject = (subject) => ({
    ...subject,
    name: subject.name || subject.subjectName,
  });

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects/search', { params: { ...searchParams, page: currentPage, size: 10 } });
      const data = res.data.content || res.data;
      setSubjects(Array.isArray(data) ? data.map(normalizeSubject) : []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) { console.error(e); }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      const data = res.data.content || res.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchSemesters = async () => {
    try {
      const res = await api.get('/semesters');
      const data = res.data.content || res.data;
      setSemesters(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers/search', { params: { size: 200 } });
      const data = res.data.content || res.data;
      setTeachers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleSearchChange = (e) => { setSearchParams(prev => ({ ...prev, [e.target.name]: e.target.value })); setCurrentPage(0); };

  const openAdd = () => { setIsEdit(false); setCurrent({ subjectCode: '', name: '', description: '', credits: '', semesterNumber: '', subjectType: 'Theory', courseId: '', semesterId: '', teacherId: '' }); setShowModal(true); };
  const openEdit = (s) => {
    const normalized = normalizeSubject(s);
    setIsEdit(true);
    setCurrent({ ...normalized, courseId: normalized.course?.id || '', semesterId: normalized.semester?.id || '', teacherId: normalized.teacher?.id || '' });
    setShowModal(true);
  };

  const handleChange = (e) => setCurrent(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find(course => course.id === current.courseId);
      const payload = {
        subjectCode: current.subjectCode,
        subjectName: current.name,
        description: current.description,
        department: selectedCourse?.department?.id,
        course: current.courseId,
        semester: current.semesterId,
        teacher: current.teacherId || undefined,
        semesterNumber: Number(current.semesterNumber),
        credits: Number(current.credits),
        subjectType: current.subjectType,
      };
      if (isEdit) await api.put(`/subjects/${current.id}`, payload);
      else await api.post('/subjects', payload);
      setShowModal(false); fetchSubjects();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); fetchSubjects(); } catch (e) { console.error(e); }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Subject Management</h2>
        <Button variant="primary" onClick={openAdd}><i className="bi bi-plus-lg me-2"></i>Add Subject</Button>
      </div>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}><Form.Control placeholder="Search by name, code..." name="keyword" value={searchParams.keyword} onChange={handleSearchChange} /></Col>
            <Col md={4}><Form.Select name="courseId" value={searchParams.courseId} onChange={handleSearchChange}>
              <option value="">All Courses</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Form.Select></Col>
          </Row>
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead><tr><th className="px-4 py-3">Code</th><th>Name</th><th>Course</th><th>Sem</th><th>Credits</th><th>Type</th><th className="text-end px-4">Actions</th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td className="px-4 fw-bold">{s.subjectCode}</td><td>{s.name}</td>
                  <td>{s.course?.name || 'N/A'}</td><td>{s.semesterNumber}</td><td>{s.credits}</td>
                  <td><Badge bg={s.subjectType === 'Theory' ? 'primary' : s.subjectType === 'Practical' ? 'success' : 'warning'}>{s.subjectType}</Badge></td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEdit(s)}><i className="bi bi-pencil"></i></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id)}><i className="bi bi-trash"></i></Button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan="7" className="text-center py-4 text-muted">No subjects found.</td></tr>}
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
        <Modal.Header closeButton><Modal.Title>{isEdit ? 'Edit Subject' : 'Add Subject'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label>Subject Code</Form.Label><Form.Control name="subjectCode" value={current.subjectCode} onChange={handleChange} required disabled={isEdit} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Subject Name</Form.Label><Form.Control name="name" value={current.name} onChange={handleChange} required /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Course</Form.Label>
                <Form.Select name="courseId" value={current.courseId} onChange={handleChange} required>
                  <option value="">Select Course</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Semester</Form.Label>
                <Form.Select name="semesterId" value={current.semesterId} onChange={handleChange} required>
                  <option value="">Select Semester</option>{semesters.map(s => <option key={s.id} value={s.id}>{s.name || s.semesterName}</option>)}
                </Form.Select></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Assign Teacher</Form.Label>
                <Form.Select name="teacherId" value={current.teacherId} onChange={handleChange}>
                  <option value="">Select Teacher</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </Form.Select></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Semester No.</Form.Label><Form.Control type="number" name="semesterNumber" value={current.semesterNumber} onChange={handleChange} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Credits</Form.Label><Form.Control type="number" name="credits" value={current.credits} onChange={handleChange} required /></Form.Group></Col>
              <Col md={4}><Form.Group><Form.Label>Type</Form.Label>
                <Form.Select name="subjectType" value={current.subjectType} onChange={handleChange}>
                  <option value="Theory">Theory</option><option value="Practical">Practical</option><option value="Lab">Lab</option>
                </Form.Select></Form.Group></Col>
              <Col md={12}><Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={2} name="description" value={current.description} onChange={handleChange} /></Form.Group></Col>
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

export default Subjects;
