import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Badge, Card, Spinner,
  Dropdown, Pagination, Nav, Tab, InputGroup
} from 'react-bootstrap';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import EmployeeLetters from './EmployeeLetters';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const STATUS_COLOR  = { ACTIVE: 'success', INACTIVE: 'secondary', RESIGNED: 'danger', RETIRED: 'warning', TERMINATED: 'danger', ON_LEAVE: 'warning' };
const TYPE_COLOR    = { TEACHING: 'primary', NON_TEACHING: 'info', ADMIN: 'dark', SUPPORT: 'secondary' };

const GENDER_OPTIONS        = ['MALE', 'FEMALE', 'OTHER'];
const BLOOD_GROUP_OPTIONS   = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MARITAL_OPTIONS       = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'];
const CONTRACT_OPTIONS      = ['PERMANENT', 'CONTRACT', 'TEMPORARY', 'PROBATION'];
const STATUS_OPTIONS        = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED', 'RETIRED'];
const TYPE_OPTIONS          = ['TEACHING', 'NON_TEACHING', 'ADMIN', 'SUPPORT'];

const EMPTY_EMPLOYEE = {
  employeeCode: '', firstName: '', lastName: '', email: '', phone: '',
  designation: '', employeeType: 'TEACHING', status: 'ACTIVE',
  departmentId: '',
  // Personal
  dateOfBirth: '', gender: '', bloodGroup: '', maritalStatus: '', nationality: 'Indian',
  address: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
  panNumber: '', aadharNumber: '',
  // Professional
  joiningDate: '', relievingDate: '', contractType: 'PERMANENT',
  contractEndDate: '', probationEndDate: '',
  // Qualifications
  qualifications: [],
  // Bank
  bankName: '', bankAccountNumber: '', ifscCode: '',
  // Salary
  basicSalary: '', hra: 0, da: 0, ta: 0, bonus: 0, otherAllowances: 0,
  pfDeduction: 0, taxDeduction: 0, esiDeduction: 0, otherDeductions: 0,
};

/* ─── MultiSelect Filter Dropdown ───────────────────────────────────────── */
const MultiSelect = ({ label, options, selected, onToggle, colorMap }) => {
  const count = selected.length;
  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle
        variant="light"
        className="border shadow-sm d-flex align-items-center gap-2 rounded-pill px-3 bg-white"
        style={{ fontSize: '0.85rem' }}
      >
        <span>{label}</span>
        {count > 0 && <Badge pill bg="primary" style={{ fontSize: '0.7rem' }}>{count}</Badge>}
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-2 shadow-lg border-0 rounded-4" style={{ minWidth: 200, maxHeight: 300, overflowY: 'auto' }}>
        {options.length === 0 ? (
          <div className="text-muted px-2 py-1" style={{ fontSize: '0.85rem' }}>No options available</div>
        ) : (
          options.map(opt => (
            <Dropdown.Item
              key={opt.value} as="div"
              className="px-2 py-1 rounded-3 d-flex align-items-center gap-2"
              style={{ cursor: 'pointer' }}
              onClick={() => onToggle(opt.value)}
            >
              <Form.Check readOnly checked={selected.includes(opt.value)} style={{ pointerEvents: 'none' }} />
              {colorMap ? (
                <Badge bg={colorMap[opt.value] || 'secondary'} style={{ fontSize: '0.7rem' }}>{opt.label}</Badge>
              ) : (
                <span style={{ fontSize: '0.87rem' }}>{opt.label}</span>
              )}
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

/* ─── Section Header ─────────────────────────────────────────────────────── */
const SectionHeader = ({ icon, title }) => (
  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
    <div className="rounded-3 d-flex align-items-center justify-content-center"
         style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#4318FF,#868CFF)' }}>
      <i className={`bi ${icon} text-white`} style={{ fontSize: '0.85rem' }}></i>
    </div>
    <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{title}</span>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
const Employees = () => {
  const { hasPermission } = useContext(AuthContext);

  const [employees, setEmployees]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentDesignations, setDepartmentDesignations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchParams, setSearchParams] = useState({
    department: [], employeeType: [], status: [], keyword: ''
  });

  // Form modal
  const [showModal, setShowModal]             = useState(false);
  const [isEdit, setIsEdit]                   = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(EMPTY_EMPLOYEE);
  const [activeTab, setActiveTab]             = useState('personal');
  const [newQual, setNewQual]                 = useState('');

  // Letters modal
  const [letterEmployee, setLetterEmployee]   = useState(null);
  const [showLetters, setShowLetters]         = useState(false);

  const debounceRef = useRef(null);

  /* ── Data Fetching ──────────────────────────────────────────────────────── */
  const fetchEmployees = useCallback(async (page = 0, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {
        page, size: 12,
        ...(searchParams.keyword && { keyword: searchParams.keyword }),
        ...(searchParams.department.length && { department: searchParams.department.join(',') }),
        ...(searchParams.employeeType.length && { employeeType: searchParams.employeeType.join(',') }),
        ...(searchParams.status.length && { status: searchParams.status.join(',') }),
      };
      const res = await api.get('/employees', { params, transformResponse: [(data) => data] });
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
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setDepartments(list);
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

  /* ── Filters ────────────────────────────────────────────────────────────── */
  const toggleFilter = (field, val) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field].filter(x => x !== val) : [...prev[field], val]
    }));
  };
  const clearFilters = () => setSearchParams({ department: [], employeeType: [], status: [], keyword: '' });

  /* ── Form Open ──────────────────────────────────────────────────────────── */
  const openAdd = () => {
    setIsEdit(false);
    setCurrentEmployee({ ...EMPTY_EMPLOYEE });
    setActiveTab('personal');
    setNewQual('');
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setIsEdit(true);
    const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
    const departmentId = emp.department?.id || emp.department?._id || '';
    setCurrentEmployee({
      ...EMPTY_EMPLOYEE,
      ...emp,
      departmentId,
      dateOfBirth:    fmt(emp.dateOfBirth),
      joiningDate:    fmt(emp.joiningDate),
      relievingDate:  fmt(emp.relievingDate),
      contractEndDate:  fmt(emp.contractEndDate),
      probationEndDate: fmt(emp.probationEndDate),
      qualifications: Array.isArray(emp.qualifications) ? emp.qualifications : [],
    });
    setDepartmentDesignations(departments.find(d => (d.id || d._id) === departmentId)?.designations || []);
    setActiveTab('personal');
    setNewQual('');
    setShowModal(true);
  };

  /* ── Qualification helpers ──────────────────────────────────────────────── */
  const addQualification = () => {
    if (!newQual.trim()) return;
    setCurrentEmployee(prev => ({ ...prev, qualifications: [...prev.qualifications, newQual.trim()] }));
    setNewQual('');
  };
  const removeQualification = (idx) => {
    setCurrentEmployee(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== idx)
    }));
  };

  /* ── Save ───────────────────────────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const numField = (v) => v === '' || v === undefined ? undefined : Number(v) || 0;
      const dateField = (v) => v || undefined;

      const payload = {
        ...currentEmployee,
        department: currentEmployee.departmentId || undefined,
        // Salary
        basicSalary:    numField(currentEmployee.basicSalary),
        hra:            numField(currentEmployee.hra),
        da:             numField(currentEmployee.da),
        ta:             numField(currentEmployee.ta),
        bonus:          numField(currentEmployee.bonus),
        otherAllowances: numField(currentEmployee.otherAllowances),
        pfDeduction:    numField(currentEmployee.pfDeduction),
        taxDeduction:   numField(currentEmployee.taxDeduction),
        esiDeduction:   numField(currentEmployee.esiDeduction),
        otherDeductions: numField(currentEmployee.otherDeductions),
        // Dates
        dateOfBirth:      dateField(currentEmployee.dateOfBirth) || undefined,
        joiningDate:      dateField(currentEmployee.joiningDate) || undefined,
        relievingDate:    dateField(currentEmployee.relievingDate) || undefined,
        contractEndDate:  dateField(currentEmployee.contractEndDate) || undefined,
        probationEndDate: dateField(currentEmployee.probationEndDate) || undefined,
      };
      delete payload.departmentId;

      if (!isEdit) {
        if (!payload.employeeCode) delete payload.employeeCode;
        if (!payload.email)        delete payload.email;
      }

      if (isEdit) {
        await api.put(`/employees/${currentEmployee.id || currentEmployee._id}`, payload);
      } else {
        const response = await api.post('/employees', payload);
        const loginHint    = response.data?.loginHint;
        const tempPassword = response.data?.tempPassword;
        if (loginHint || tempPassword) {
          window.alert(
            `Employee created successfully.\n\nLogin details:\nEmployee Code: ${loginHint?.username || response.data?.userAccount?.username || 'N/A'}\nEmail: ${loginHint?.email || response.data?.userAccount?.email || 'N/A'}\nPassword: ${tempPassword || loginHint?.password || 'Use employee code'}`
          );
        }
      }
      setShowModal(false);
      fetchEmployees(currentPage, true);
    } catch (error) {
      console.error('save error', error);
    } finally { setSaving(false); }
  };

  /* ── Delete ─────────────────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees(currentPage, true);
      } catch (err) { console.error('delete error', err); }
    }
  };

  /* ── Letters ────────────────────────────────────────────────────────────── */
  const openLetters = (emp) => {
    setLetterEmployee(emp);
    setShowLetters(true);
  };

  /* ── Helper ─────────────────────────────────────────────────────────────── */
  const setField = (key, val) => setCurrentEmployee(prev => ({ ...prev, [key]: val }));

  const getDesignationsForDepartment = (departmentId) => {
    const dept = departments.find((d) => (d.id || d._id) === departmentId);
    return Array.isArray(dept?.designations) ? dept.designations : [];
  };

  useEffect(() => {
    if (currentEmployee.departmentId) {
      const designations = getDesignationsForDepartment(currentEmployee.departmentId);
      setDepartmentDesignations(designations);
      if (designations.length > 0 && !designations.includes(currentEmployee.designation)) {
        setCurrentEmployee((prev) => ({ ...prev, designation: '' }));
      }
    } else {
      setDepartmentDesignations([]);
    }
  }, [currentEmployee.departmentId, departments]);

  /* ── Guard ──────────────────────────────────────────────────────────────── */
  if (!hasPermission('employees', 'view')) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger shadow-sm border-0 rounded-4">
          <i className="bi bi-shield-slash-fill me-2"></i>Access Denied: You do not have permissions to view this module.
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="container-fluid py-4">
      {/* ── Header ── */}
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

      {/* ── Filters ── */}
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
              <MultiSelect label="Departments" options={departments.map(d => ({ value: d.id || d._id, label: d.name }))}
                selected={searchParams.department} onToggle={(val) => toggleFilter('department', val)} />
              <MultiSelect label="Type" options={TYPE_OPTIONS.map(t => ({ value: t, label: t }))}
                selected={searchParams.employeeType} onToggle={(val) => toggleFilter('employeeType', val)} colorMap={TYPE_COLOR} />
              <MultiSelect label="Status" options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                selected={searchParams.status} onToggle={(val) => toggleFilter('status', val)} colorMap={STATUS_COLOR} />
              {!!(searchParams.keyword || searchParams.department.length || searchParams.employeeType.length || searchParams.status.length) && (
                <Button variant="link" className="text-danger text-decoration-none small px-2" onClick={clearFilters}>
                  <i className="bi bi-x-circle me-1"></i>Clear
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Table ── */}
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
                           style={{ width: 42, height: 42, background: `hsl(${(emp.firstName?.[0] || 'A').charCodeAt(0) * 10 % 360}, 60%, 45%)`, flexShrink: 0 }}>
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
                      {/* Letters Button */}
                      <Button
                        variant="light" size="sm" className="rounded-3 border action-btn"
                        title="Generate Letters"
                        onClick={() => openLetters(emp)}
                      >
                        <i className="bi bi-file-earmark-text-fill text-success"></i>
                      </Button>
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
              {[...Array(Math.min(totalPages, 7)).keys()].map(pg => (
                <Pagination.Item key={pg} active={pg === currentPage} onClick={() => setCurrentPage(pg)}>{pg + 1}</Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} />
            </Pagination>
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          EMPLOYEE FORM MODAL — 4 Tabs
      ══════════════════════════════════════════════════════════════════════ */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered className="glass-modal">
        <Modal.Header closeButton className="border-0 p-4" style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)' }}>
          <Modal.Title className="fw-bold fs-5 text-white">
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-3`}></i>
            {isEdit ? 'Update Professional Profile' : 'Register New Personnel'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body className="p-0">
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              {/* Tab Nav */}
              <div className="border-bottom bg-light px-4 pt-3">
                <Nav variant="tabs" className="border-0 gap-1">
                  {[
                    { key: 'personal',       icon: 'bi-person-fill',       label: 'Personal Info' },
                    { key: 'professional',   icon: 'bi-briefcase-fill',    label: 'Professional' },
                    { key: 'salary',         icon: 'bi-currency-rupee',    label: 'Salary & Bank' },
                    { key: 'qualifications', icon: 'bi-mortarboard-fill',  label: 'Qualifications' },
                  ].map(tab => (
                    <Nav.Item key={tab.key}>
                      <Nav.Link eventKey={tab.key}
                        className="rounded-top-3 border-0 px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                        style={{ fontSize: '0.85rem', color: activeTab === tab.key ? '#4318FF' : '#6c757d' }}
                      >
                        <i className={`bi ${tab.icon}`}></i>{tab.label}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>

              <Tab.Content className="px-4 py-4" style={{ minHeight: 420 }}>

                {/* ── Tab 1: Personal Info ───────────────────────────────── */}
                <Tab.Pane eventKey="personal">
                  <SectionHeader icon="bi-person-vcard-fill" title="Basic Identity" />
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">First Name *</Form.Label>
                        <Form.Control className="rounded-3" required value={currentEmployee.firstName}
                          onChange={e => setField('firstName', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Last Name *</Form.Label>
                        <Form.Control className="rounded-3" required value={currentEmployee.lastName}
                          onChange={e => setField('lastName', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Date of Birth</Form.Label>
                        <Form.Control className="rounded-3" type="date" value={currentEmployee.dateOfBirth}
                          onChange={e => setField('dateOfBirth', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Gender</Form.Label>
                        <Form.Select className="rounded-3" value={currentEmployee.gender} onChange={e => setField('gender', e.target.value)}>
                          <option value="">Select Gender</option>
                          {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Blood Group</Form.Label>
                        <Form.Select className="rounded-3" value={currentEmployee.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)}>
                          <option value="">Select Blood Group</option>
                          {BLOOD_GROUP_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Marital Status</Form.Label>
                        <Form.Select className="rounded-3" value={currentEmployee.maritalStatus} onChange={e => setField('maritalStatus', e.target.value)}>
                          <option value="">Select</option>
                          {MARITAL_OPTIONS.map(m => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Nationality</Form.Label>
                        <Form.Control className="rounded-3" value={currentEmployee.nationality}
                          onChange={e => setField('nationality', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Phone</Form.Label>
                        <Form.Control className="rounded-3" value={currentEmployee.phone || ''}
                          onChange={e => setField('phone', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Email</Form.Label>
                        <Form.Control className="rounded-3" type="email"
                          placeholder={isEdit ? '' : 'Auto-generated from name'}
                          value={currentEmployee.email}
                          onChange={e => setField('email', e.target.value)}
                          disabled={!isEdit} required={isEdit} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Address</Form.Label>
                        <Form.Control className="rounded-3" value={currentEmployee.address || ''}
                          onChange={e => setField('address', e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <SectionHeader icon="bi-shield-fill-exclamation" title="Emergency Contact" />
                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Contact Name</Form.Label>
                        <Form.Control className="rounded-3" value={currentEmployee.emergencyContactName || ''}
                          onChange={e => setField('emergencyContactName', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Contact Phone</Form.Label>
                        <Form.Control className="rounded-3" value={currentEmployee.emergencyContactPhone || ''}
                          onChange={e => setField('emergencyContactPhone', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Relation</Form.Label>
                        <Form.Control className="rounded-3" placeholder="e.g. Spouse, Parent" value={currentEmployee.emergencyContactRelation || ''}
                          onChange={e => setField('emergencyContactRelation', e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <SectionHeader icon="bi-card-list" title="Identity Documents" />
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">PAN Number</Form.Label>
                        <Form.Control className="rounded-3" placeholder="ABCDE1234F" value={currentEmployee.panNumber || ''}
                          onChange={e => setField('panNumber', e.target.value.toUpperCase())} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Aadhaar Number</Form.Label>
                        <Form.Control className="rounded-3" placeholder="12-digit Aadhaar" value={currentEmployee.aadharNumber || ''}
                          onChange={e => setField('aadharNumber', e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* ── Tab 2: Professional Info ───────────────────────────── */}
                <Tab.Pane eventKey="professional">
                  <SectionHeader icon="bi-building-fill" title="Employment Details" />
                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Employee Code</Form.Label>
                        <Form.Control className="rounded-3"
                          placeholder={isEdit ? '' : 'Auto-generated on save'}
                          value={currentEmployee.employeeCode}
                          onChange={e => setField('employeeCode', e.target.value)}
                          disabled={!isEdit} required={isEdit} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Department *</Form.Label>
                        <Form.Select className="rounded-3" required value={currentEmployee.departmentId}
                          onChange={e => {
                            const selectedDeptId = e.target.value;
                            setField('departmentId', selectedDeptId);
                            const selectedDept = departments.find(d => (d.id || d._id) === selectedDeptId);
                            setDepartmentDesignations(Array.isArray(selectedDept?.designations) ? selectedDept.designations : []);
                          }}>
                          <option value="">Select Department</option>
                          {departments.map(dept => <option key={dept.id || dept._id} value={dept.id || dept._id}>{dept.name}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Employee Type</Form.Label>
                        <Form.Select className="rounded-3" value={currentEmployee.employeeType} onChange={e => setField('employeeType', e.target.value)}>
                          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Designation *</Form.Label>
                        {departmentDesignations.length > 0 ? (
                          <Form.Select className="rounded-3" required value={currentEmployee.designation}
                            onChange={e => setField('designation', e.target.value)}>
                            <option value="">Select Designation</option>
                            {departmentDesignations.map((designation) => (
                              <option key={designation} value={designation}>{designation}</option>
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control className="rounded-3" required value={currentEmployee.designation}
                            onChange={e => setField('designation', e.target.value)} placeholder="Enter designation" />
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Status</Form.Label>
                        <Form.Select className="rounded-3" value={currentEmployee.status} onChange={e => setField('status', e.target.value)}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Joining Date</Form.Label>
                        <Form.Control className="rounded-3" type="date" value={currentEmployee.joiningDate}
                          onChange={e => setField('joiningDate', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Relieving Date</Form.Label>
                        <Form.Control className="rounded-3" type="date" value={currentEmployee.relievingDate}
                          onChange={e => setField('relievingDate', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Contract Type</Form.Label>
                        <Form.Select className="rounded-3" value={currentEmployee.contractType} onChange={e => setField('contractType', e.target.value)}>
                          {CONTRACT_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Contract End Date</Form.Label>
                        <Form.Control className="rounded-3" type="date" value={currentEmployee.contractEndDate}
                          onChange={e => setField('contractEndDate', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Probation End Date</Form.Label>
                        <Form.Control className="rounded-3" type="date" value={currentEmployee.probationEndDate}
                          onChange={e => setField('probationEndDate', e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* ── Tab 3: Salary & Bank ───────────────────────────────── */}
                <Tab.Pane eventKey="salary">
                  <SectionHeader icon="bi-currency-rupee" title="Salary Structure" />
                  <Row className="g-3 mb-4">
                    {[
                      { key: 'basicSalary', label: 'Basic Salary' },
                      { key: 'hra', label: 'HRA' },
                      { key: 'da', label: 'DA' },
                      { key: 'ta', label: 'TA' },
                      { key: 'bonus', label: 'Bonus' },
                      { key: 'otherAllowances', label: 'Other Allowances' },
                    ].map(({ key, label }) => (
                      <Col md={4} key={key}>
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold">{label}</Form.Label>
                          <InputGroup>
                            <InputGroup.Text className="border-end-0 bg-light rounded-start-3">₹</InputGroup.Text>
                            <Form.Control className="rounded-end-3" type="number" min="0" step="0.01"
                              value={currentEmployee[key] ?? 0}
                              onChange={e => setField(key, e.target.value)} />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>

                  <SectionHeader icon="bi-dash-circle-fill" title="Deductions" />
                  <Row className="g-3 mb-4">
                    {[
                      { key: 'pfDeduction', label: 'PF Deduction' },
                      { key: 'taxDeduction', label: 'Tax Deduction' },
                      { key: 'esiDeduction', label: 'ESI Deduction' },
                      { key: 'otherDeductions', label: 'Other Deductions' },
                    ].map(({ key, label }) => (
                      <Col md={3} key={key}>
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold">{label}</Form.Label>
                          <InputGroup>
                            <InputGroup.Text className="border-end-0 bg-light rounded-start-3">₹</InputGroup.Text>
                            <Form.Control className="rounded-end-3" type="number" min="0" step="0.01"
                              value={currentEmployee[key] ?? 0}
                              onChange={e => setField(key, e.target.value)} />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>

                  {/* Gross summary */}
                  <div className="rounded-4 p-3 mb-4" style={{ background: 'linear-gradient(135deg,#f0edff,#e8f4fd)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark">Gross Salary</span>
                      <span className="fw-bold text-success fs-5">
                        ₹{(
                          (Number(currentEmployee.basicSalary) || 0) +
                          (Number(currentEmployee.hra) || 0) +
                          (Number(currentEmployee.da) || 0) +
                          (Number(currentEmployee.ta) || 0) +
                          (Number(currentEmployee.bonus) || 0) +
                          (Number(currentEmployee.otherAllowances) || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="text-muted small">Total Deductions</span>
                      <span className="text-danger fw-semibold small">
                        - ₹{(
                          (Number(currentEmployee.pfDeduction) || 0) +
                          (Number(currentEmployee.taxDeduction) || 0) +
                          (Number(currentEmployee.esiDeduction) || 0) +
                          (Number(currentEmployee.otherDeductions) || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark">Net Take-Home</span>
                      <span className="fw-bold text-primary fs-5">
                        ₹{(
                          (Number(currentEmployee.basicSalary) || 0) +
                          (Number(currentEmployee.hra) || 0) +
                          (Number(currentEmployee.da) || 0) +
                          (Number(currentEmployee.ta) || 0) +
                          (Number(currentEmployee.bonus) || 0) +
                          (Number(currentEmployee.otherAllowances) || 0) -
                          (Number(currentEmployee.pfDeduction) || 0) -
                          (Number(currentEmployee.taxDeduction) || 0) -
                          (Number(currentEmployee.esiDeduction) || 0) -
                          (Number(currentEmployee.otherDeductions) || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <SectionHeader icon="bi-bank2" title="Bank Details" />
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Bank Name</Form.Label>
                        <Form.Control className="rounded-3" placeholder="e.g. SBI, HDFC" value={currentEmployee.bankName || ''}
                          onChange={e => setField('bankName', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">Account Number</Form.Label>
                        <Form.Control className="rounded-3" value={currentEmployee.bankAccountNumber || ''}
                          onChange={e => setField('bankAccountNumber', e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="text-muted small fw-bold">IFSC Code</Form.Label>
                        <Form.Control className="rounded-3" placeholder="e.g. SBIN0001234" value={currentEmployee.ifscCode || ''}
                          onChange={e => setField('ifscCode', e.target.value.toUpperCase())} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* ── Tab 4: Qualifications ──────────────────────────────── */}
                <Tab.Pane eventKey="qualifications">
                  <SectionHeader icon="bi-mortarboard-fill" title="Educational Qualifications" />
                  <p className="text-muted small mb-3">Add degrees, certifications, or professional qualifications.</p>

                  <InputGroup className="mb-4">
                    <Form.Control className="rounded-start-3" placeholder="e.g. B.Tech Computer Science, MBA, PhD Mathematics"
                      value={newQual} onChange={e => setNewQual(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addQualification(); } }} />
                    <Button variant="primary" className="rounded-end-3 px-4"
                            style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', border: 'none' }}
                            onClick={addQualification}>
                      <i className="bi bi-plus-lg me-1"></i> Add
                    </Button>
                  </InputGroup>

                  {currentEmployee.qualifications.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-mortarboard fs-1 d-block mb-2" style={{ color: '#c5b8ff' }}></i>
                      <p className="mb-0">No qualifications added yet</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {currentEmployee.qualifications.map((q, idx) => (
                        <div key={idx} className="d-flex align-items-center justify-content-between rounded-4 px-4 py-3 border shadow-sm"
                             style={{ background: '#f8f7ff' }}>
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center"
                                 style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#4318FF,#868CFF)', flexShrink: 0 }}>
                              <i className="bi bi-mortarboard text-white" style={{ fontSize: '0.9rem' }}></i>
                            </div>
                            <span className="fw-semibold text-dark">{q}</span>
                          </div>
                          <Button variant="link" className="text-danger p-0" onClick={() => removeQualification(idx)}>
                            <i className="bi bi-x-circle-fill fs-5"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Modal.Body>

          <Modal.Footer className="border-0 bg-light p-4 d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              {['personal','professional','salary','qualifications'].map((tab, i) => (
                <div key={tab} onClick={() => setActiveTab(tab)}
                     className="rounded-circle cursor-pointer"
                     style={{
                       width: 10, height: 10, cursor: 'pointer',
                       background: activeTab === tab ? '#4318FF' : '#dee2e6',
                       transition: 'background 0.2s'
                     }}
                ></div>
              ))}
            </div>
            <div className="d-flex gap-2">
              <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4 border">Discard</Button>
              <Button type="submit" className="rounded-pill px-4 shadow-sm" disabled={saving}
                      style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', border: 'none' }}>
                {saving ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                {isEdit ? 'Update Profile' : 'Onboard Employee'}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════
          LETTERS MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {letterEmployee && (
        <EmployeeLetters
          show={showLetters}
          onHide={() => setShowLetters(false)}
          employee={letterEmployee}
          departments={departments}
        />
      )}

      <style>{`
        .hover-shadow:hover { background-color: #f8f9ff !important; }
        .action-btn:hover { background-color: #fff !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .transition { transition: all 0.2s ease-in-out; }
        .nav-tabs .nav-link { border: none !important; border-bottom: 3px solid transparent !important; }
        .nav-tabs .nav-link.active { border-bottom-color: #4318FF !important; background: white !important; }
        .nav-tabs { border-bottom: 1px solid #dee2e6 !important; }
      `}</style>
    </div>
  );
};

export default Employees;
