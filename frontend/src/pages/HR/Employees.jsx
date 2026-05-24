import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Row, Col, Pagination, Badge, Dropdown, Card } from 'react-bootstrap';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState({
    departmentId: '',
    employeeType: '',
    status: '',
    keyword: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    employeeType: 'TEACHING',
    dateOfBirth: '',
    joiningDate: '',
    basicSalary: '',
    address: '',
    status: 'ACTIVE',
    departmentId: ''
  });

  const { hasPermission } = useContext(AuthContext);

  useEffect(() => {
    if (hasPermission('employees', 'view')) {
      fetchEmployees();
      fetchDepartments();
    }
  }, [currentPage, searchParams]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/search', {
        params: { ...searchParams, page: currentPage, size: 10 }
      });
      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching employees:', error);
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
    setSearchParams({ departmentId: '', employeeType: '', status: '', keyword: '' });
    setCurrentPage(0);
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setCurrentEmployee({
      employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
      designation: '', employeeType: 'TEACHING', dateOfBirth: '', joiningDate: '',
      basicSalary: '', address: '', status: 'ACTIVE', departmentId: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (employee) => {
    setIsEdit(true);
    setCurrentEmployee({
      ...employee,
      departmentId: employee.department?.id || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentEmployee,
        department: currentEmployee.departmentId ? { id: parseInt(currentEmployee.departmentId) } : null
      };
      
      if (isEdit) {
        await api.put(`/employees/${currentEmployee.id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  if (!hasPermission('employees', 'view')) {
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
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <h2 className="text-dark fw-bold mb-0">Employee Directory</h2>
        {hasPermission('employees', 'create') && (
          <Button variant="primary" className="shadow-sm rounded-pill px-4 py-2 fw-semibold" onClick={handleOpenAddModal}>
            <i className="bi bi-person-plus-fill me-2"></i>Add Employee
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
              Type {searchParams.employeeType && <Badge bg="primary" className="ms-1">{searchParams.employeeType.split(',').length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '150px' }}>
              {['TEACHING', 'NON_TEACHING', 'ADMIN'].map(t => (
                <Form.Check 
                  key={t}
                  type="checkbox"
                  label={t}
                  checked={(searchParams.employeeType ? searchParams.employeeType.split(',') : []).includes(t)}
                  onChange={() => toggleFilterArray('employeeType', t)}
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
              {['ACTIVE', 'INACTIVE', 'RESIGNED', 'RETIRED'].map(st => (
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
            placeholder="Search by name, code..."
            name="keyword"
            value={searchParams.keyword}
            onChange={handleSearchChange}
            style={{ maxWidth: '300px' }}
            className="shadow-sm border-white flex-grow-1"
          />

          {(searchParams.departmentId || searchParams.employeeType || searchParams.status || searchParams.keyword) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card.Body>
      </Card>

      <div className="card glass-panel shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th>Name</th>
                <th>Role & Type</th>
                <th>Department</th>
                <th>Email</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? employees.map(emp => (
                <tr key={emp.id}>
                  <td className="px-4 fw-bold text-primary">{emp.employeeCode}</td>
                  <td>
                    <div className="fw-semibold text-dark">{emp.firstName} {emp.lastName}</div>
                    <small className="text-muted">{emp.phone}</small>
                  </td>
                  <td>
                    <div>{emp.designation}</div>
                    <Badge bg="info" className="text-dark bg-opacity-25">{emp.employeeType}</Badge>
                  </td>
                  <td>{emp.department?.name || 'N/A'}</td>
                  <td>{emp.email}</td>
                  <td>
                    <Badge bg={emp.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-pill px-3 py-1">
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    {hasPermission('employees', 'edit') && (
                      <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleOpenEditModal(emp)}>
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                    )}
                    {hasPermission('employees', 'delete') && (
                      <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDeleteEmployee(emp.id)}>
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="text-center py-5 text-muted"><i className="bi bi-inbox fs-2 d-block mb-2"></i>No employees found.</td></tr>
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
          <Modal.Title className="fw-bold">{isEdit ? 'Edit Employee Profile' : 'New Employee Onboarding'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEmployee}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Employee Code</Form.Label>
                  <Form.Control type="text" name="employeeCode" value={currentEmployee.employeeCode} onChange={handleFormChange} required disabled={isEdit} className="rounded-3 bg-light" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Department</Form.Label>
                  <Form.Select name="departmentId" value={currentEmployee.departmentId} onChange={handleFormChange} required className="rounded-3">
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Type</Form.Label>
                  <Form.Select name="employeeType" value={currentEmployee.employeeType} onChange={handleFormChange} className="rounded-3">
                    <option value="TEACHING">Teaching</option>
                    <option value="NON_TEACHING">Non-Teaching</option>
                    <option value="ADMIN">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">First Name</Form.Label>
                  <Form.Control type="text" name="firstName" value={currentEmployee.firstName} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Last Name</Form.Label>
                  <Form.Control type="text" name="lastName" value={currentEmployee.lastName} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Email Address</Form.Label>
                  <Form.Control type="email" name="email" value={currentEmployee.email} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Phone Number</Form.Label>
                  <Form.Control type="text" name="phone" value={currentEmployee.phone} onChange={handleFormChange} className="rounded-3" />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Designation</Form.Label>
                  <Form.Control type="text" name="designation" value={currentEmployee.designation} onChange={handleFormChange} required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Basic Salary</Form.Label>
                  <Form.Control type="number" name="basicSalary" value={currentEmployee.basicSalary} onChange={handleFormChange} className="rounded-3" />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Joining Date</Form.Label>
                  <Form.Control type="date" name="joiningDate" value={currentEmployee.joiningDate} onChange={handleFormChange} className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Status</Form.Label>
                  <Form.Select name="status" value={currentEmployee.status} onChange={handleFormChange} className="rounded-3">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="RETIRED">Retired</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm">{isEdit ? 'Save Changes' : 'Create Employee'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
