import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Row, Col, InputGroup, Pagination, Badge, Dropdown, Card } from 'react-bootstrap';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState({
    departmentId: '',
    semester: '',
    status: '',
    keyword: ''
  });

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    currentSemester: 1,
    status: 'ACTIVE',
    department: null
  });

  const { hasPermission } = useContext(AuthContext);

  useEffect(() => {
    if (hasPermission('students', 'view')) {
      fetchStudents();
      fetchDepartments();
    }
  }, [currentPage, searchParams]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', {
        params: {
          ...searchParams,
          page: currentPage,
          size: 10
        }
      });
      setStudents(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      // If endpoint returns Page<Department> or List<Department>
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

  const toggleFilterArray = (field, value) => {
    setSearchParams(prev => {
      const current = prev[field] ? prev[field].split(',') : [];
      let next;
      if (current.includes(value.toString())) {
        next = current.filter(item => item !== value.toString());
      } else {
        next = [...current, value.toString()];
      }
      return { ...prev, [field]: next.join(',') };
    });
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setSearchParams({ departmentId: '', semester: '', status: '', keyword: '' });
    setCurrentPage(0);
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setCurrentStudent({
      enrollmentNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
      currentSemester: 1,
      status: 'ACTIVE',
      department: null
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (student) => {
    setIsEdit(true);
    setCurrentStudent({
      ...student,
      departmentId: student.department?.id || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentStudent,
        department: currentStudent.departmentId ? { id: parseInt(currentStudent.departmentId) } : null
      };
      
      if (isEdit) {
        await api.put(`/students/${currentStudent.id}`, payload);
      } else {
        await api.post('/students', payload);
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  if (!hasPermission('students', 'view')) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger shadow-sm border-0">
          <i className="bi bi-shield-slash-fill me-2"></i>
          <strong>Access Denied:</strong> You do not have permissions to view this module.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Student Management</h2>
        {hasPermission('students', 'create') && (
          <Button variant="primary" onClick={handleOpenAddModal}>
            <i className="bi bi-plus-lg me-2"></i>Add Student
          </Button>
        )}
      </div>

      {/* Advanced Multi-Select Filters */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-center bg-light rounded">
          <div className="fw-semibold text-secondary me-2"><i className="bi bi-funnel-fill me-1"></i> Filters:</div>
          
          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Departments {searchParams.departmentId && <Badge bg="primary" className="ms-1">{searchParams.departmentId.split(',').length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '220px', maxHeight: '300px', overflowY: 'auto' }}>
              {departments.map(dept => (
                <Form.Check 
                  key={dept.id}
                  type="checkbox"
                  label={dept.name}
                  checked={(searchParams.departmentId ? searchParams.departmentId.split(',') : []).includes(dept.id.toString())}
                  onChange={() => toggleFilterArray('departmentId', dept.id)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Semesters {searchParams.semester && <Badge bg="primary" className="ms-1">{searchParams.semester.split(',').length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '150px', maxHeight: '300px', overflowY: 'auto' }}>
              {[1,2,3,4,5,6,7,8].map(sem => (
                <Form.Check 
                  key={sem}
                  type="checkbox"
                  label={`Semester ${sem}`}
                  checked={(searchParams.semester ? searchParams.semester.split(',') : []).includes(sem.toString())}
                  onChange={() => toggleFilterArray('semester', sem)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Status {searchParams.status && <Badge bg="primary" className="ms-1">{searchParams.status.split(',').length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '150px' }}>
              {['ACTIVE', 'GRADUATED', 'DROPPED', 'SUSPENDED'].map(st => (
                <Form.Check 
                  key={st}
                  type="checkbox"
                  label={st}
                  checked={(searchParams.status ? searchParams.status.split(',') : []).includes(st)}
                  onChange={() => toggleFilterArray('status', st)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control
            type="text"
            placeholder="Search by name, email..."
            name="keyword"
            value={searchParams.keyword}
            onChange={handleSearchChange}
            style={{ maxWidth: '300px' }}
            className="shadow-sm border-white flex-grow-1"
          />

          {(searchParams.departmentId || searchParams.semester || searchParams.status || searchParams.keyword) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Student List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Enrollment No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map(student => (
                  <tr key={student.id}>
                    <td className="px-4 fw-bold">{student.enrollmentNumber}</td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.department?.name || 'N/A'}</td>
                    <td>Sem {student.currentSemester}</td>
                    <td>
                      <Badge bg={student.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="text-end px-4">
                      {hasPermission('students', 'edit') && (
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEditModal(student)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                      )}
                      {hasPermission('students', 'delete') && (
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Student' : 'Add Student'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveStudent}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Enrollment Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="enrollmentNumber"
                    value={currentStudent.enrollmentNumber}
                    onChange={handleFormChange}
                    required
                    disabled={isEdit}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="departmentId"
                    value={currentStudent.departmentId || ''}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={currentStudent.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={currentStudent.lastName}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={currentStudent.email}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={currentStudent.phone || ''}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={currentStudent.gender || 'Male'}
                    onChange={handleFormChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Current Semester</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentSemester"
                    min="1"
                    max="8"
                    value={currentStudent.currentSemester || 1}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={currentStudent.status || 'ACTIVE'}
                    onChange={handleFormChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="DROPPED">Dropped</option>
                    <option value="SUSPENDED">Suspended</option>
                  </Form.Select>
                </Form.Group>
              </Col>
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

export default Students;
