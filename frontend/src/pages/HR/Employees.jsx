import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Card, Spinner, Dropdown, Pagination } from 'react-bootstrap';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

/* Helpers */
const STATUS_COLOR = { ACTIVE: 'success', INACTIVE: 'secondary', RESIGNED: 'danger', RETIRED: 'warning' };
const TYPE_COLOR = { TEACHING: 'primary', NON_TEACHING: 'info', ADMIN: 'dark' };

const MultiSelect = ({ label, options, selected, onToggle, colorMap }) => {
  const count = selected.length;
  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle
        variant="white"
        className="border shadow-sm d-flex align-items-center gap-2 rounded-pill px-3"
        style={{ fontSize: '0.85rem' }}
      >
        <span>{label}</span>
        {count > 0 && <Badge pill bg="primary" style={{ fontSize: '0.7rem' }}>{count}</Badge>}
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-2 shadow-lg border-0 rounded-4" style={{ minWidth: 200, maxHeight: 300, overflowY: 'auto' }}>
        {options.map(opt => (
          <div key={opt.value} className="px-2 py-1 rounded-3 hover-bg d-flex align-items-center gap-2"
               style={{ cursor: 'pointer' }} onClick={() => onToggle(opt.value)}>
            <Form.Check readOnly checked={selected.includes(opt.value)} style={{ pointerEvents: 'none' }} />
            {colorMap ? <Badge bg={colorMap[opt.value] || 'secondary'} style={{ fontSize: '0.7rem' }}>{opt.label}</Badge> : <span style={{ fontSize: '0.87rem' }}>{opt.label}</span>}
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Employees = () => {
  const { hasPermission } = useContext(AuthContext);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchParams, setSearchParams] = useState({
    department: [],
    employeeType: [],
    status: [],
    keyword: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({});

  const debounceRef = useRef(null);

  const fetchEmployees = useCallback(async (page = 0, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {
        page,
        size: 12,
        ...(searchParams.keyword && { keyword: searchParams.keyword }),
        ...(searchParams.department.length && { department: searchParams.department.join(',') }),
        ...(searchParams.employeeType.length && { employeeType: searchParams.employeeType.join(',') }),
        ...(searchParams.status.length && { status: searchParams.status.join(',') }),
      };
      
      const res = await api.get('/employees', { 
        params,
        transformResponse: [(data) => data] 
      });
      const raw = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      
      const content = raw?.data || (Array.isArray(raw) ? raw : []);
      setEmployees(content);
      setTotalPages(raw?.totalPages || 1);
      setTotal(raw?.total || content.length);
    } catch (err) {
      console.error('fetchEmployees error', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(Array.isArray(res.data) ? res.data : (res.data?.content || []));
    } catch { setDepartments([]); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(0);
      fetchEmployees(0);
    }, searchParams.keyword ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [searchParams, fetchEmployees]);

  useEffect(() => { fetchEmployees(currentPage, true); }, [currentPage, fetchEmployees]);

  const toggleFilter = (field, val) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };

  const clearFilters = () => {
    setSearchParams({ department: [], employeeType: [], status: [], keyword: '' });
  };

  const openAdd = () => {
    setIsEdit(false);
    setCurrentEmployee({
      employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
      designation: '', employeeType: 'TEACHING', dateOfBirth: '', joiningDate: '',
      basicSalary: '', address: '', status: 'ACTIVE', departmentId: ''
    });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setIsEdit(true);
    setCurrentEmployee({ ...emp, departmentId: emp.department?.id || emp.department?._id || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...currentEmployee, department: currentEmployee.departmentId ? { id: currentEmployee.departmentId } : null };
      if (isEdit) await api.put(`/employees/${currentEmployee.id || currentEmployee._id}`, payload);
      else await api.post('/employees', payload);
      setShowModal(false);
      fetchEmployees(currentPage, true);
    } catch (error) {
      console.error('save error', error);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees(currentPage, true);
      } catch (err) { console.error('delete error', err); }
    }
  };

  if (!hasPermission('employees', 'view')) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger shadow-sm border-0 rounded-4">
          <i className="bi bi-shield-slash-fill me-2"></i>Access Denied: You do not have permissions to view this module.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0">Employee Directory</h2>
          <p className="text-muted small mb-0">{total} active personnel records</p>
        </div>
        {hasPermission('employees', 'create') && (
          <Button variant="primary" className="rounded-pill shadow-sm px-4 fw-bold" onClick={openAdd}
                  style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', border: 'none' }}>
            <i className="bi bi-person-plus-fill me-2"></i>Add Employee
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <Card.Body className="p-3 bg-light">
          <Row className="g-3 align-items-center">
            <Col lg={4}>
              <div className="position-relative">
                <i className="bi bi-search position-absolute text-muted" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}></i>
                <Form.Control
                  className="rounded-pill border-0 shadow-sm ps-5"
                  placeholder="Search name, code, contact..."
                  value={searchParams.keyword}
                  onChange={e => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                />
              </div>
            </Col>
            <Col lg={8} className="d-flex flex-wrap gap-2 justify-content-lg-end">
              <MultiSelect
                label="Departments"
                options={departments.map(d => ({ value: d.id || d._id, label: d.name }))}
                selected={searchParams.department}
                onToggle={(val) => toggleFilter('department', val)}
              />
              <MultiSelect
                label="Type"
                options={['TEACHING', 'NON_TEACHING', 'ADMIN'].map(t => ({ value: t, label: t }))}
                selected={searchParams.employeeType}
                onToggle={(val) => toggleFilter('employeeType', val)}
                colorMap={TYPE_COLOR}
              />
              <MultiSelect
                label="Status"
                options={['ACTIVE', 'INACTIVE', 'RESIGNED', 'RETIRED'].map(s => ({ value: s, label: s }))}
                selected={searchParams.status}
                onToggle={(val) => toggleFilter('status', val)}
                colorMap={STATUS_COLOR}
              />
              {(searchParams.keyword || searchParams.department.length || searchParams.employeeType.length || searchParams.status.length) && (
                <Button variant="link" className="text-danger text-decoration-none small px-2" onClick={clearFilters}>
                  <i className="bi bi-x-circle me-1"></i>Clear
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0">Personnel Info</th>
                <th className="border-0">Position & Area</th>
                <th className="border-0">Contact Details</th>
                <th className="border-0 text-center">Status</th>
                <th className="text-end px-4 border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
              ) : employees.length > 0 ? employees.map(emp => (
                <tr key={emp.id || emp._id} className="hover-shadow transition">
                  <td className="px-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
                           style={{ width: 40, height: 40, background: `hsl(${(emp.firstName?.[0] || 'A').charCodeAt(0) * 10 % 360}, 60%, 45%)` }}>
                        {(emp.firstName?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{emp.firstName} {emp.lastName}</div>
                        <div className="text-primary small fw-bold" style={{ fontSize: '0.75rem' }}>{emp.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium text-dark">{emp.designation}</div>
                    <div className="d-flex gap-2 align-items-center mt-1">
                      <Badge bg="light" className="text-muted border" style={{ fontSize: '0.7rem' }}>{emp.department?.name || 'No Dept'}</Badge>
                      <Badge pill bg={TYPE_COLOR[emp.employeeType] || 'info'} style={{ fontSize: '0.65rem' }}>{emp.employeeType}</Badge>
                    </div>
                  </td>
                  <td>
                    <div className="small text-dark"><i className="bi bi-envelope me-2 text-muted"></i>{emp.email}</div>
                    <div className="small text-muted mt-1"><i className="bi bi-telephone me-2"></i>{emp.phone || 'N/A'}</div>
                  </td>
                  <td className="text-center">
                    <Badge pill bg={STATUS_COLOR[emp.status] || 'secondary'} className="px-3 shadow-sm" style={{ fontSize: '0.75rem' }}>{emp.status}</Badge>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex gap-1 justify-content-end">
                      {hasPermission('employees', 'edit') && (
                        <Button variant="light" size="sm" className="rounded-3 border action-btn" onClick={() => openEdit(emp)}>
                          <i className="bi bi-pencil-fill text-primary"></i>
                        </Button>
                      )}
                      {hasPermission('employees', 'delete') && (
                        <Button variant="light" size="sm" className="rounded-3 border action-btn" onClick={() => handleDelete(emp.id || emp._id)}>
                          <i className="bi bi-trash-fill text-danger"></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted"><i className="bi bi-inbox fs-1 d-block mb-2"></i>No matching records found</td></tr>
              )}
            </tbody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
            <div className="text-muted small">Showing page {currentPage + 1} of {totalPages}</div>
            <Pagination className="mb-0 shadow-sm">
              <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} />
              {[...Array(totalPages).keys()].map(pg => (
                <Pagination.Item key={pg} active={pg === currentPage} onClick={() => setCurrentPage(pg)}>{pg + 1}</Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} />
            </Pagination>
          </div>
        )}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="glass-modal">
        <Modal.Header closeButton className="border-0 bg-light p-4">
          <Modal.Title className="fw-bold fs-4">
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-3 text-primary`}></i>
            {isEdit ? 'Update Professional Profile' : 'Register New Personnel'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold uppercase">Employee Code *</Form.Label>
                  <Form.Control className="rounded-3" required value={currentEmployee.employeeCode} onChange={e => setCurrentEmployee({...currentEmployee, employeeCode: e.target.value})} disabled={isEdit} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Department *</Form.Label>
                  <Form.Select className="rounded-3" required value={currentEmployee.departmentId} onChange={e => setCurrentEmployee({...currentEmployee, departmentId: e.target.value})}>
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept.id || dept._id} value={dept.id || dept._id}>{dept.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Employee Type</Form.Label>
                  <Form.Select className="rounded-3" value={currentEmployee.employeeType} onChange={e => setCurrentEmployee({...currentEmployee, employeeType: e.target.value})}>
                    <option value="TEACHING">Teaching</option>
                    <option value="NON_TEACHING">Non-Teaching</option>
                    <option value="ADMIN">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">First Name *</Form.Label>
                  <Form.Control className="rounded-3" required value={currentEmployee.firstName} onChange={e => setCurrentEmployee({...currentEmployee, firstName: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Last Name *</Form.Label>
                  <Form.Control className="rounded-3" required value={currentEmployee.lastName} onChange={e => setCurrentEmployee({...currentEmployee, lastName: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Email *</Form.Label>
                  <Form.Control className="rounded-3" type="email" required value={currentEmployee.email} onChange={e => setCurrentEmployee({...currentEmployee, email: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Phone</Form.Label>
                  <Form.Control className="rounded-3" value={currentEmployee.phone || ''} onChange={e => setCurrentEmployee({...currentEmployee, phone: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Designation *</Form.Label>
                  <Form.Control className="rounded-3" required value={currentEmployee.designation} onChange={e => setCurrentEmployee({...currentEmployee, designation: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Status</Form.Label>
                  <Form.Select className="rounded-3" value={currentEmployee.status} onChange={e => setCurrentEmployee({...currentEmployee, status: e.target.value})}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="RETIRED">Retired</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light p-4">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4 border">Discard</Button>
            <Button type="submit" className="rounded-pill px-4 shadow-sm" disabled={saving}
                    style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', border: 'none' }}>
              {saving ? <Spinner size="sm" animation="border" className="me-2"/> : (isEdit ? 'Update Profile' : 'Onboard Employee')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .hover-shadow:hover { background-color: #f8f9ff !important; }
        .action-btn:hover { background-color: #fff !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .transition { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Employees;
