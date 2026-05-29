import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Card, Spinner, Dropdown } from 'react-bootstrap';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

/* ─── helpers ────────────────────────────────────────────────── */
const STATUS_COLOR = { ACTIVE: 'success', GRADUATED: 'primary', DROPPED: 'danger', SUSPENDED: 'warning' };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

const exportToExcel = (students) => {
  const headers = [
    'Enrollment No', 'First Name', 'Last Name', 'Email', 'Phone',
    'Gender', 'Date of Birth', 'Department', 'Current Semester',
    'Status', 'Guardian Name', 'Guardian Phone', 'Address', 'Joined On'
  ];
  const rows = students.map(s => [
    s.enrollmentNumber || '',
    s.firstName || '',
    s.lastName || '',
    s.email || '',
    s.phone || '',
    s.gender || '',
    fmtDate(s.dateOfBirth),
    s.department?.name || '',
    s.currentSemester || '',
    s.status || '',
    s.guardianName || '',
    s.guardianPhone || '',
    s.address || '',
    fmtDate(s.createdAt),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Students_Export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── MultiSelect Dropdown ───────────────────────────────────── */
const MultiSelect = ({ label, options, selected, onToggle, colorMap }) => {
  const count = selected.length;
  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle
        variant="white"
        className="border shadow-sm d-flex align-items-center gap-2"
        style={{ fontSize: '0.87rem', borderRadius: 10 }}
      >
        <span>{label}</span>
        {count > 0 && (
          <span className="badge rounded-pill"
            style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', fontSize: '0.72rem' }}>
            {count}
          </span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-2 shadow-lg border-0" style={{ minWidth: 190, borderRadius: 12 }}>
        {options.map(opt => (
          <div key={opt.value} className="d-flex align-items-center gap-2 px-2 py-1 rounded"
            style={{ cursor: 'pointer', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => onToggle(opt.value)}>
            <div style={{
              width: 18, height: 18, border: '2px solid',
              borderColor: selected.includes(opt.value) ? '#4318FF' : '#ccc',
              background: selected.includes(opt.value) ? '#4318FF' : 'white',
              borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {selected.includes(opt.value) && <i className="bi bi-check text-white" style={{ fontSize: 11 }} />}
            </div>
            {colorMap && <span className={`badge bg-${colorMap[opt.value] || 'secondary'}`} style={{ fontSize: '0.7rem' }}>{opt.label}</span>}
            {!colorMap && <span style={{ fontSize: '0.87rem' }}>{opt.label}</span>}
          </div>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100">
    <Card.Body className="d-flex align-items-center gap-3 p-3">
      <div className="rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 46, height: 46, background: color + '18', flexShrink: 0 }}>
        <i className={`bi ${icon} fs-5`} style={{ color }} />
      </div>
      <div>
        <div className="fw-bold fs-5 text-dark mb-0">{value}</div>
        <div className="text-muted" style={{ fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      </div>
    </Card.Body>
  </Card>
);

/* ─── blank form ─────────────────────────────────────────────── */
const BLANK = {
  enrollmentNumber: '', firstName: '', lastName: '', email: '',
  phone: '', gender: 'Male', dateOfBirth: '', guardianName: '',
  guardianPhone: '', address: '', currentSemester: 1,
  status: 'ACTIVE', departmentId: ''
};

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const Students = () => {
  const { hasPermission } = useContext(AuthContext);

  /* state */
  const [students, setStudents]   = useState([]);
  const [departments, setDepts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalStudents, setTotal] = useState(0);
  const [totalPages, setTotalPgs] = useState(0);
  const [currentPage, setPage]    = useState(0);

  /* filters */
  const [keyword, setKeyword]   = useState('');
  const [selDepts, setSelDepts] = useState([]);
  const [selSems, setSelSems]   = useState([]);
  const [selStatus, setSelStat] = useState([]);
  const [selGender, setSelGen]  = useState([]);
  const debounceRef = useRef(null);

  /* modal */
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit]       = useState(false);
  const [form, setForm]           = useState(BLANK);
  const [saving, setSaving]       = useState(false);

  /* ── fetch ─────────────────────────────────────────────────── */
  const fetchStudents = useCallback(async (page = 0, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {
        page,
        size: 15,
        ...(keyword             && { keyword }),
        ...(selDepts.length     && { department: selDepts.join(',') }),
        ...(selSems.length      && { semester: selSems.join(',') }),
        ...(selStatus.length    && { status: selStatus.join(',') }),
        ...(selGender.length    && { gender: selGender.join(',') }),
        _t: Date.now(),
      };
      // Use a raw axios call so we can read the full response before the
      // interceptor strips the wrapper — we need total/totalPages alongside data.
      const res = await api.get('/students', { params,
        // Temporarily bypass the data-unwrap interceptor by reading raw response
        transformResponse: [(data) => data],  // keep as raw JSON string
      });
      const raw = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      // raw = { success, data: [...], total, totalPages, count, page }
      const content    = Array.isArray(raw?.data) ? raw.data
                       : Array.isArray(raw)        ? raw : [];
      const pages      = raw?.totalPages ?? 1;
      const totalCount = raw?.total ?? raw?.count ?? content.length;
      setStudents(content);
      setTotalPgs(pages);
      setTotal(totalCount);
    } catch (err) {
      console.error('fetchStudents error', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selDepts, selSems, selStatus, selGender]);

  const fetchDepts = async () => {
    try {
      const res = await api.get('/departments');
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.content) ? res.data.content : [];
      setDepts(data);
    } catch { setDepts([]); }
  };

  useEffect(() => { fetchDepts(); }, []);

  /* debounce keyword changes; instant for other filters */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchStudents(0);
    }, keyword ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, selDepts, selSems, selStatus, selGender]);

  useEffect(() => { fetchStudents(currentPage, true); }, [currentPage]);

  /* ── export all ─────────────────────────────────────────────── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        page: 0, size: 10000,
        ...(keyword             && { keyword }),
        ...(selDepts.length     && { department: selDepts.join(',') }),
        ...(selSems.length      && { semester: selSems.join(',') }),
        ...(selStatus.length    && { status: selStatus.join(',') }),
        ...(selGender.length    && { gender: selGender.join(',') }),
      };
      const res = await api.get('/students', { params,
        transformResponse: [(data) => data],
      });
      const raw = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      const all = Array.isArray(raw?.data) ? raw.data
                : Array.isArray(raw)        ? raw : students;
      exportToExcel(all);
    } catch { exportToExcel(students); }
    finally { setExporting(false); }
  };

  /* ── toggles ─────────────────────────────────────────────────  */
  const toggle = (setter) => (val) =>
    setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const clearAll = () => {
    setKeyword(''); setSelDepts([]); setSelSems([]); setSelStat([]); setSelGen([]);
  };

  const hasFilters = keyword || selDepts.length || selSems.length || selStatus.length || selGender.length;

  /* ── modal helpers ───────────────────────────────────────────── */
  const openAdd = () => { setIsEdit(false); setForm(BLANK); setShowModal(true); };
  const openEdit = (s) => {
    setIsEdit(true);
    setForm({ ...s, departmentId: s.department?.id || s.department?._id || '' });
    setShowModal(true);
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, department: form.departmentId ? { id: form.departmentId } : null };
      if (isEdit) await api.put(`/students/${form.id || form._id}`, payload);
      else        await api.post('/students', payload);
      setShowModal(false);
      fetchStudents(currentPage, true);
    } catch (err) { console.error('save error', err); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try {
      await api.delete(`/students/${id}`);
      fetchStudents(currentPage, true);
    } catch (err) { console.error('delete error', err); }
  };

  /* ── derived stats ───────────────────────────────────────────── */
  const active    = students.filter(s => s.status === 'ACTIVE').length;
  const graduated = students.filter(s => s.status === 'GRADUATED').length;
  const dropped   = students.filter(s => s.status === 'DROPPED').length;

  /* ── permission guard ────────────────────────────────────────── */
  if (!hasPermission('students', 'view')) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger border-0 shadow-sm rounded-4">
          <i className="bi bi-shield-slash-fill me-2" />
          <strong>Access Denied:</strong> You do not have permission to view this module.
        </div>
      </div>
    );
  }

  /* ════════════════════ RENDER ════════════════════════════════ */
  return (
    <div className="container-fluid pb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-1">
        <div>
          <h2 className="fw-bold text-dark mb-0">Student Management</h2>
          <p className="text-muted small mb-0">
            {totalStudents > 0 ? `${totalStudents.toLocaleString()} student${totalStudents !== 1 ? 's' : ''} found` : 'Manage all enrolled students'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="light"
            className="border shadow-sm rounded-pill px-3 d-flex align-items-center gap-2"
            onClick={handleExport}
            disabled={exporting}
            style={{ fontSize: '0.87rem' }}
          >
            {exporting
              ? <Spinner size="sm" animation="border" />
              : <i className="bi bi-file-earmark-excel-fill text-success" />}
            Export Excel
          </Button>
          {hasPermission('students', 'create') && (
            <Button
              variant="primary"
              className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
              onClick={openAdd}
              style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', border: 'none' }}
            >
              <i className="bi bi-plus-lg" />Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Total Students', value: totalStudents, icon: 'bi-people-fill', color: '#4318FF' },
          { label: 'Active',         value: active,        icon: 'bi-person-check-fill', color: '#10b981' },
          { label: 'Graduated',      value: graduated,     icon: 'bi-mortarboard-fill',  color: '#3b82f6' },
          { label: 'Dropped',        value: dropped,       icon: 'bi-person-x-fill',     color: '#ef4444' },
        ].map(s => (
          <Col xs={6} md={3} key={s.label}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="d-flex flex-wrap gap-2 align-items-center p-3">
          <i className="bi bi-funnel-fill text-primary me-1" />

          {/* Search */}
          <div className="position-relative" style={{ minWidth: 240, flexGrow: 1 }}>
            <i className="bi bi-search position-absolute text-muted"
              style={{ left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }} />
            <input
              className="form-control border shadow-sm"
              placeholder="Search by name, email, enrollment…"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ paddingLeft: 34, borderRadius: 10, fontSize: '0.87rem' }}
            />
          </div>

          {/* Department */}
          <MultiSelect
            label="Department"
            options={departments.map(d => ({ value: d.id || d._id, label: d.name }))}
            selected={selDepts}
            onToggle={toggle(setSelDepts)}
          />

          {/* Semester */}
          <MultiSelect
            label="Semester"
            options={[1,2,3,4,5,6,7,8].map(n => ({ value: String(n), label: `Sem ${n}` }))}
            selected={selSems}
            onToggle={toggle(setSelSems)}
          />

          {/* Status */}
          <MultiSelect
            label="Status"
            options={['ACTIVE','GRADUATED','DROPPED','SUSPENDED'].map(s => ({ value: s, label: s }))}
            selected={selStatus}
            onToggle={toggle(setSelStat)}
            colorMap={STATUS_COLOR}
          />

          {/* Gender */}
          <MultiSelect
            label="Gender"
            options={['Male','Female','Other'].map(g => ({ value: g, label: g }))}
            selected={selGender}
            onToggle={toggle(setSelGen)}
          />

          {/* Clear */}
          {hasFilters && (
            <Button variant="link" className="text-danger text-decoration-none px-2" onClick={clearAll}
              style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-x-circle me-1" />Clear
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2 small">Loading students…</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle" style={{ fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8f9ff' }}>
                  <tr>
                    <th className="px-4 py-3 fw-semibold text-secondary border-0">Enrollment No.</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Name</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Email</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Phone</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Department</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Sem</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Gender</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Date of Birth</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Guardian</th>
                    <th className="py-3 fw-semibold text-secondary border-0">Status</th>
                    <th className="py-3 fw-semibold text-secondary border-0 text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? students.map(s => (
                    <tr key={s.id || s._id}
                      style={{ transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td className="px-4">
                        <span className="fw-bold text-primary" style={{ fontSize: '0.82rem', letterSpacing: '0.03em' }}>
                          {s.enrollmentNumber}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                            style={{
                              width: 32, height: 32, flexShrink: 0, fontSize: '0.78rem',
                              background: `hsl(${(s.firstName?.charCodeAt(0) || 65) * 5 % 360},55%,55%)`
                            }}>
                            {(s.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{s.firstName} {s.lastName}</div>
                            {s.address && <div className="text-muted" style={{ fontSize: '0.74rem' }}>{s.address.substring(0, 28)}{s.address.length > 28 ? '…' : ''}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">{s.email || '—'}</td>
                      <td className="text-muted">{s.phone || '—'}</td>
                      <td>
                        <span className="badge rounded-pill px-3"
                          style={{ background: '#4318FF18', color: '#4318FF', fontSize: '0.78rem' }}>
                          {s.department?.name || '—'}
                        </span>
                      </td>
                      <td className="text-center fw-semibold">{s.currentSemester || '—'}</td>
                      <td className="text-muted">{s.gender || '—'}</td>
                      <td className="text-muted">{fmtDate(s.dateOfBirth)}</td>
                      <td>
                        {s.guardianName
                          ? <><div className="fw-medium">{s.guardianName}</div><div className="text-muted" style={{ fontSize: '0.78rem' }}>{s.guardianPhone}</div></>
                          : '—'}
                      </td>
                      <td>
                        <Badge bg={STATUS_COLOR[s.status] || 'secondary'} className="rounded-pill px-3" style={{ fontSize: '0.75rem' }}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex gap-1 justify-content-end">
                          {hasPermission('students', 'edit') && (
                            <Button size="sm" variant="light" className="border rounded-3 px-2"
                              onClick={() => openEdit(s)} title="Edit">
                              <i className="bi bi-pencil-fill text-primary" style={{ fontSize: '0.8rem' }} />
                            </Button>
                          )}
                          {hasPermission('students', 'delete') && (
                            <Button size="sm" variant="light" className="border rounded-3 px-2"
                              onClick={() => handleDelete(s.id || s._id)} title="Delete">
                              <i className="bi bi-trash-fill text-danger" style={{ fontSize: '0.8rem' }} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="11" className="text-center py-5">
                        <i className="bi bi-inbox fs-1 text-muted d-block mb-2" />
                        <span className="text-muted">No students found{hasFilters ? ' matching your filters' : ''}.</span>
                        {hasFilters && (
                          <div className="mt-2">
                            <Button variant="link" className="text-primary text-decoration-none small" onClick={clearAll}>
                              Clear filters
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="bg-transparent border-0 d-flex justify-content-between align-items-center px-4 py-3">
            <small className="text-muted">
              Page {currentPage + 1} of {totalPages} &nbsp;·&nbsp; {totalStudents} total
            </small>
            <div className="d-flex gap-1">
              <Button size="sm" variant="light" className="border rounded-3"
                disabled={currentPage === 0}
                onClick={() => setPage(p => p - 1)}>
                <i className="bi bi-chevron-left" />
              </Button>
              {[...Array(Math.min(totalPages, 7)).keys()].map(i => {
                const pg = totalPages <= 7 ? i
                  : currentPage < 4 ? i
                  : currentPage > totalPages - 5 ? totalPages - 7 + i
                  : currentPage - 3 + i;
                return (
                  <Button key={pg} size="sm"
                    variant={pg === currentPage ? 'primary' : 'light'}
                    className="border rounded-3"
                    style={pg === currentPage ? { background: '#4318FF', border: 'none' } : {}}
                    onClick={() => setPage(pg)}>
                    {pg + 1}
                  </Button>
                );
              })}
              <Button size="sm" variant="light" className="border rounded-3"
                disabled={currentPage === totalPages - 1}
                onClick={() => setPage(p => p + 1)}>
                <i className="bi bi-chevron-right" />
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold fs-5">
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2 text-primary`} />
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Enrollment Number *</Form.Label>
                <Form.Control className="rounded-3" required name="enrollmentNumber"
                  value={form.enrollmentNumber} onChange={handleFormChange} disabled={isEdit} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Department *</Form.Label>
                <Form.Select className="rounded-3" required name="departmentId"
                  value={form.departmentId || ''} onChange={handleFormChange}>
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">First Name *</Form.Label>
                <Form.Control className="rounded-3" required name="firstName"
                  value={form.firstName} onChange={handleFormChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Last Name *</Form.Label>
                <Form.Control className="rounded-3" required name="lastName"
                  value={form.lastName} onChange={handleFormChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Email *</Form.Label>
                <Form.Control className="rounded-3" type="email" required name="email"
                  value={form.email} onChange={handleFormChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Phone</Form.Label>
                <Form.Control className="rounded-3" name="phone"
                  value={form.phone || ''} onChange={handleFormChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Gender</Form.Label>
                <Form.Select className="rounded-3" name="gender"
                  value={form.gender || 'Male'} onChange={handleFormChange}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Date of Birth</Form.Label>
                <Form.Control className="rounded-3" type="date" name="dateOfBirth"
                  value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''}
                  onChange={handleFormChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Current Semester *</Form.Label>
                <Form.Control className="rounded-3" type="number" min="1" max="8" required
                  name="currentSemester" value={form.currentSemester || 1} onChange={handleFormChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Guardian Name</Form.Label>
                <Form.Control className="rounded-3" name="guardianName"
                  value={form.guardianName || ''} onChange={handleFormChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Guardian Phone</Form.Label>
                <Form.Control className="rounded-3" name="guardianPhone"
                  value={form.guardianPhone || ''} onChange={handleFormChange} />
              </Col>
              <Col md={8}>
                <Form.Label className="small fw-bold text-muted">Address</Form.Label>
                <Form.Control className="rounded-3" name="address"
                  value={form.address || ''} onChange={handleFormChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Status</Form.Label>
                <Form.Select className="rounded-3" name="status"
                  value={form.status || 'ACTIVE'} onChange={handleFormChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="DROPPED">Dropped</option>
                  <option value="SUSPENDED">Suspended</option>
                </Form.Select>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" className="rounded-pill px-4 border"
              onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" className="rounded-pill px-4 shadow-sm" disabled={saving}
              style={{ background: 'linear-gradient(135deg,#4318FF,#868CFF)', border: 'none' }}>
              {saving ? <><Spinner size="sm" animation="border" className="me-2" />Saving…</> : 'Save Student'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Students;
