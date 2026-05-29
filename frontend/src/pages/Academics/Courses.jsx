import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import api from '../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState({
    departmentId: '',
    courseType: '',
    status: '',
    keyword: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({
    courseCode: '',
    title: '',
    description: '',
    totalSemesters: 8,
    durationYears: 4,
    credits: '',
    fees: '',
    courseType: 'UNDERGRADUATE',
    status: 'ACTIVE',
    departmentId: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, [currentPage, searchParams]);

  const normalizeCourse = (course) => ({
    ...course,
    courseCode: course.courseCode || course.code,
    title: course.title || course.name,
    departmentId: course.department?.id || course.departmentId || '',
  });

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/search', {
        params: { ...searchParams, page: currentPage, size: 10 }
      });
      setCourses(Array.isArray(response.data.content) ? response.data.content.map(normalizeCourse) : []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const data = response.data.content || response.data;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
    setCurrentPage(0);
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setCurrentCourse({
      courseCode: '', title: '', description: '', totalSemesters: 8, durationYears: 4,
      credits: '', fees: '', courseType: 'UNDERGRADUATE', status: 'ACTIVE', departmentId: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (course) => {
    setIsEdit(true);
    setCurrentCourse(normalizeCourse(course));
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: currentCourse.title,
        code: currentCourse.courseCode,
        description: currentCourse.description,
        totalSemesters: Number(currentCourse.totalSemesters),
        durationYears: Number(currentCourse.durationYears),
        duration: `${currentCourse.durationYears} Years`,
        credits: currentCourse.credits === '' ? undefined : Number(currentCourse.credits),
        fees: currentCourse.fees === '' ? 0 : Number(currentCourse.fees),
        courseType: currentCourse.courseType,
        status: currentCourse.status,
        department: currentCourse.departmentId,
      };
      
      if (isEdit) {
        await api.put(`/courses/${currentCourse.id}`, payload);
      } else {
        await api.post('/courses', payload);
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h2 className="text-dark fw-bold mb-0">Course Management</h2>
        <Button variant="primary" className="shadow-sm rounded-pill px-4 py-2 fw-semibold" onClick={handleOpenAddModal}>
          <i className="bi bi-journal-plus me-2"></i>Add Course
        </Button>
      </div>

      <div className="card glass-panel mb-4">
        <div className="card-body">
          <Row className="g-3">
            <Col md={3}>
              <Form.Control type="text" placeholder="Search course title or code..." name="keyword" value={searchParams.keyword} onChange={handleSearchChange} className="rounded-3" />
            </Col>
            <Col md={3}>
              <Form.Select name="departmentId" value={searchParams.departmentId} onChange={handleSearchChange} className="rounded-3">
                <option value="">All Departments</option>
                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select name="courseType" value={searchParams.courseType} onChange={handleSearchChange} className="rounded-3">
                <option value="">All Types</option>
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="POSTGRADUATE">Postgraduate</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="CERTIFICATE">Certificate</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select name="status" value={searchParams.status} onChange={handleSearchChange} className="rounded-3">
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </Form.Select>
            </Col>
          </Row>
        </div>
      </div>

      <div className="card glass-panel shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th>Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Semesters / Years</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? courses.map(course => (
                <tr key={course.id}>
                  <td className="px-4 fw-bold text-primary">{course.courseCode}</td>
                  <td className="fw-semibold text-dark">{course.title}</td>
                  <td>{course.department?.name || 'N/A'}</td>
                  <td>
                    <Badge bg="info" className="text-dark bg-opacity-25">{course.courseType}</Badge>
                  </td>
                  <td>{course.totalSemesters} Semesters / {course.durationYears} Years</td>
                  <td>
                    <Badge bg={course.status === 'ACTIVE' ? 'success' : course.status === 'INACTIVE' ? 'warning' : 'secondary'} className="rounded-pill px-3 py-1">
                      {course.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleOpenEditModal(course)}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDeleteCourse(course.id)}>
                      <i className="bi bi-trash-fill"></i>
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center py-5 text-muted"><i className="bi bi-journals fs-2 d-block mb-2"></i>No courses found.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination className="shadow-sm">
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">{isEdit ? 'Edit Course' : 'Create Course'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCourse}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Course Code</Form.Label>
                  <Form.Control type="text" name="courseCode" value={currentCourse.courseCode} onChange={handleFormChange} required disabled={isEdit} className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Course Title</Form.Label>
                  <Form.Control type="text" name="title" value={currentCourse.title} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Department</Form.Label>
                  <Form.Select name="departmentId" value={currentCourse.departmentId} onChange={handleFormChange} required className="rounded-3">
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Course Type</Form.Label>
                  <Form.Select name="courseType" value={currentCourse.courseType} onChange={handleFormChange} className="rounded-3">
                    <option value="UNDERGRADUATE">Undergraduate</option>
                    <option value="POSTGRADUATE">Postgraduate</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="CERTIFICATE">Certificate</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Status</Form.Label>
                  <Form.Select name="status" value={currentCourse.status} onChange={handleFormChange} className="rounded-3">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Total Semesters</Form.Label>
                  <Form.Control type="number" name="totalSemesters" value={currentCourse.totalSemesters} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Duration (Years)</Form.Label>
                  <Form.Control type="number" name="durationYears" value={currentCourse.durationYears} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Total Credits</Form.Label>
                  <Form.Control type="number" name="credits" value={currentCourse.credits} onChange={handleFormChange} className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Fees</Form.Label>
                  <Form.Control type="number" name="fees" value={currentCourse.fees} onChange={handleFormChange} className="rounded-3" min="0" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" value={currentCourse.description} onChange={handleFormChange} className="rounded-3" />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm">{isEdit ? 'Save Changes' : 'Create Course'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Courses;
