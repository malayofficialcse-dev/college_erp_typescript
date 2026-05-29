import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const STATUS_COLOR = { ACTIVE: 'success', COMPLETED: 'primary', PENDING: 'warning', CANCELLED: 'danger' };

const Admissions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const counselingData = location.state?.counselingData;
  const isFromCounseling = !!counselingData;

  const [admissions, setAdmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({ keyword: '', status: '', paymentPlan: '', academicYear: '' });
  const [form, setForm] = useState({
    studentId: '', courseId: '', departmentId: '',
    academicYear: '', admissionDate: new Date().toISOString().split('T')[0],
    totalFeeAmount: '', discountAmount: '0',
    paymentPlan: 'FULL', numberOfEmis: '',
    advanceAmount: '0', advancePaymentDate: new Date().toISOString().split('T')[0],
    advancePaymentMethod: 'CASH', advanceTransactionId: '',
    status: 'ACTIVE', remarks: ''
  });

  useEffect(() => { loadData(); }, [filters]);

  const normalizeCourse = (course) => ({
    ...course,
    courseCode: course.courseCode || course.code || '',
    title: course.title || course.name || '',
    departmentId: course.department?.id || course.department || '',
    totalFeeAmount: course.totalFeeAmount ?? course.fees ?? '',
  });

  const normalizeAcademicYear = (year) => ({
    ...year,
    label: year.yearLabel || year.name || '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [a, s, c, d, ay] = await Promise.all([
        api.get('/admissions', { params: filters }),
        api.get('/students/search', { params: { size: 200 } }),
        api.get('/courses', { params: { size: 200 } }),
        api.get('/departments'),
        api.get('/academic-years'),
      ]);
      setAdmissions(a.data.content || a.data || []);
      const studentData = s.data.content || s.data || [];
      setStudents(Array.isArray(studentData) ? studentData : []);
      const courseData = c.data.content || c.data || [];
      setCourses(Array.isArray(courseData) ? courseData.map(normalizeCourse) : []);
      const departmentData = d.data.content || d.data || [];
      setDepartments(Array.isArray(departmentData) ? departmentData : []);
      const academicYearData = ay.data.content || ay.data || [];
      setAcademicYears(Array.isArray(academicYearData) ? academicYearData.map(normalizeAcademicYear) : []);

      if (isFromCounseling) {
        const selectedCourse = counselingData.desiredCourse ? normalizeCourse(counselingData.desiredCourse) : null;
        setForm(prev => ({
          ...prev,
          courseId: selectedCourse?.id || '',
          departmentId: selectedCourse?.departmentId || '',
          totalFeeAmount: selectedCourse?.totalFeeAmount || prev.totalFeeAmount,
        }));
        setShowModal(true);
      }
    } catch { setAlert({ type: 'danger', msg: 'Failed to load data.' }); }
    finally { setLoading(false); }
  };

  const f = form;
  const filteredCourses = f.departmentId
    ? courses.filter(c => String(c.departmentId) === String(f.departmentId))
    : courses;
  const netPayable = (parseFloat(f.totalFeeAmount) || 0) - (parseFloat(f.discountAmount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      let targetStudentId = f.studentId;
      
      // If coming from counseling and student not selected, auto-create student
      if (isFromCounseling && !targetStudentId) {
        const existingStudent = students.find(student => student.email === counselingData.email);

        if (existingStudent) {
          targetStudentId = existingStudent.id;
        } else {
          if (!f.departmentId || !f.courseId || !f.academicYear) {
            setAlert({ type: 'danger', msg: 'Please select course, department, and academic year before creating admission.' });
            return;
          }

          const studentPayload = {
            enrollmentNumber: 'ENR' + Date.now().toString().slice(-6),
            firstName: counselingData.firstName,
            lastName: counselingData.lastName,
            email: counselingData.email,
            phone: counselingData.phone,
            gender: counselingData.gender || 'Male',
            dateOfBirth: counselingData.dateOfBirth || '2000-01-01',
            department: f.departmentId,
            course: f.courseId,
            academicYear: f.academicYear,
            currentSemester: 1,
            status: 'ACTIVE'
          };
          const studentRes = await api.post('/students', studentPayload);
          targetStudentId = studentRes.data.id;
        }

        await api.patch(`/counseling/${counselingData.id}/status`, { status: 'ADMITTED' });
      }

      const totalFeeAmount = parseFloat(f.totalFeeAmount || 0);
      const discountAmount = parseFloat(f.discountAmount || 0);
      const amountPaid = parseFloat(f.advanceAmount || 0);
      const netPayableAmount = Math.max(totalFeeAmount - discountAmount, 0);

      await api.post('/admissions', {
        admissionNumber: 'ADM' + Date.now().toString().slice(-8),
        billNumber: 'BILL' + Date.now().toString().slice(-8),
        student: targetStudentId,
        course: f.courseId,
        department: f.departmentId,
        academicYear: f.academicYear, admissionDate: f.admissionDate,
        totalFeeAmount,
        discountAmount,
        netPayableAmount,
        amountPaid,
        balanceDue: Math.max(netPayableAmount - amountPaid, 0),
        paymentPlan: f.paymentPlan,
        numberOfEmis: f.paymentPlan === 'EMI' ? parseInt(f.numberOfEmis) : undefined,
        status: f.status, remarks: f.remarks,
      });
      setAlert({ type: 'success', msg: 'Admission created successfully!' });
      setShowModal(false);
      // Clear location state
      navigate('/admissions', { replace: true });
      loadData();
    } catch { setAlert({ type: 'danger', msg: 'Failed to create admission.' }); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => setForm({
    studentId: '', courseId: '', departmentId: '',
    academicYear: '', admissionDate: new Date().toISOString().split('T')[0],
    totalFeeAmount: '', discountAmount: '0', paymentPlan: 'FULL', numberOfEmis: '',
    advanceAmount: '0', advancePaymentDate: new Date().toISOString().split('T')[0],
    advancePaymentMethod: 'CASH', advanceTransactionId: '', status: 'ACTIVE', remarks: ''
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="fw-bold text-dark mb-0">Student Admissions</h2>
          <p className="text-muted small mb-0">Manage course admissions with full payment or EMI plans</p>
        </div>
        <Button variant="primary" className="rounded-pill px-4 shadow-sm"
          onClick={() => { resetForm(); setShowModal(true); }}>
          <i className="bi bi-plus-circle-fill me-2"></i>New Admission
        </Button>
      </div>

      {alert && <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="border-0 shadow-sm">{alert.msg}</Alert>}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="bg-light rounded-4 p-3">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Control placeholder="Search name, enrollment, admission no..." className="rounded-3"
                value={filters.keyword} onChange={e => setFilters({ ...filters, keyword: e.target.value })} />
            </Col>
            <Col md={2}>
              <Form.Select className="rounded-3" value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                <option>ACTIVE</option><option>COMPLETED</option>
                <option>PENDING</option><option>CANCELLED</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select className="rounded-3" value={filters.paymentPlan}
                onChange={e => setFilters({ ...filters, paymentPlan: e.target.value })}>
                <option value="">All Plans</option>
                <option value="FULL">Full Payment</option>
                <option value="EMI">EMI</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select className="rounded-3"
                value={filters.academicYear}
                onChange={e => setFilters({ ...filters, academicYear: e.target.value })}>
                <option value="">All Academic Years</option>
                {academicYears.map(year => <option key={year.id} value={year.id}>{year.label}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="link" className="text-danger text-decoration-none p-0"
                onClick={() => setFilters({ keyword: '', status: '', paymentPlan: '', academicYear: '' })}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Admission No.</th>
                  <th>Bill No.</th>
                  <th>Student</th>
                  <th>Course / Dept</th>
                  <th>Acad. Year</th>
                  <th>Net Fee</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.length > 0 ? admissions.map(a => (
                  <tr key={a.id}>
                    <td className="px-4">
                      <div className="fw-bold text-primary">{a.admissionNumber}</div>
                      <small className="text-muted">{a.admissionDate}</small>
                    </td>
                    <td>
                      <div className="fw-medium text-dark">{a.billNumber || '—'}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{a.student?.firstName} {a.student?.lastName}</div>
                      <small className="text-muted">{a.student?.enrollmentNumber}</small>
                    </td>
                    <td>
                      <div className="fw-medium">{a.course?.title || a.course?.name}</div>
                      <small className="text-muted">{a.department?.name || '—'}</small>
                    </td>
                    <td>{a.academicYear?.name || a.academicYear?.label || a.academicYear}</td>
                    <td className="fw-semibold">₹{Number(a.netPayableAmount || 0).toLocaleString()}</td>
                    <td className="text-success fw-semibold">₹{Number(a.amountPaid || 0).toLocaleString()}</td>
                    <td className="text-danger fw-semibold">₹{Number(a.balanceDue || 0).toLocaleString()}</td>
                    <td>
                      <Badge bg={a.paymentPlan === 'EMI' ? 'warning' : 'info'} className="rounded-pill px-3">
                        {a.paymentPlan}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={STATUS_COLOR[a.status] || 'secondary'} className="rounded-pill px-3">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="text-end px-4">
                      <Button size="sm" variant="light" className="rounded-pill border"
                        onClick={() => navigate(`/admissions/${a.id}/emi`)}>
                        <i className="bi bi-eye me-1"></i>
                        {a.paymentPlan === 'EMI' ? 'EMI Schedule' : 'View'}
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      <i className="bi bi-mortarboard fs-2 d-block mb-2"></i>No admissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* ── New Admission Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">
            <i className="bi bi-mortarboard-fill me-2 text-primary"></i>New Student Admission
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              {/* Student & Course */}
              <Col xs={12}>
                <p className="fw-bold text-uppercase text-muted mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  <i className="bi bi-person-fill me-1"></i> Student & Course
                </p>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Student *</Form.Label>
                {isFromCounseling ? (
                  <div className="p-2 border rounded-3 bg-light">
                    <div className="fw-semibold text-primary">{counselingData.firstName} {counselingData.lastName}</div>
                    <small className="text-muted d-block">Will be created as a new student</small>
                  </div>
                ) : (
                  <Form.Select className="rounded-3" required value={f.studentId}
                    onChange={e => setForm({ ...f, studentId: e.target.value })}>
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>[{s.enrollmentNumber}] {s.firstName} {s.lastName}</option>
                    ))}
                  </Form.Select>
                )}
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Course *</Form.Label>
                <Form.Select className="rounded-3" required value={f.courseId}
                  onChange={e => {
                    const courseId = e.target.value;
                    const selectedCourse = courses.find(c => String(c.id) === String(courseId));
                    setForm({
                      ...f,
                      courseId,
                      departmentId: selectedCourse?.departmentId || f.departmentId,
                      totalFeeAmount: selectedCourse?.totalFeeAmount !== '' ? String(selectedCourse.totalFeeAmount) : f.totalFeeAmount,
                    });
                  }}>
                  <option value="">Select Course</option>
                  {filteredCourses.map(c => (
                    <option key={c.id} value={c.id}>[{c.courseCode}] {c.title}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Department</Form.Label>
                <Form.Select className="rounded-3" value={f.departmentId}
                  onChange={e => {
                    const newDeptId = e.target.value;
                    const selectedCourse = courses.find(c => String(c.id) === String(f.courseId));
                    setForm({
                      ...f,
                      departmentId: newDeptId,
                      courseId: selectedCourse && String(selectedCourse.departmentId) !== String(newDeptId) ? '' : f.courseId
                    });
                  }}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Academic Year *</Form.Label>
                <Form.Select className="rounded-3" required value={f.academicYear}
                  onChange={e => setForm({ ...f, academicYear: e.target.value })}>
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => <option key={year.id} value={year.id}>{year.label}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Admission Date *</Form.Label>
                <Form.Control type="date" className="rounded-3" required value={f.admissionDate}
                  onChange={e => setForm({ ...f, admissionDate: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Status</Form.Label>
                <Form.Select className="rounded-3" value={f.status}
                  onChange={e => setForm({ ...f, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Col>

              {/* Fee */}
              <Col xs={12} className="mt-1">
                <p className="fw-bold text-uppercase text-muted mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  <i className="bi bi-cash-coin me-1"></i> Fee Details
                </p>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Total Course Fee (₹) *</Form.Label>
                <Form.Control type="number" step="0.01" className="rounded-3" required
                  value={f.totalFeeAmount} onChange={e => setForm({ ...f, totalFeeAmount: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Discount / Scholarship (₹)</Form.Label>
                <Form.Control type="number" step="0.01" className="rounded-3"
                  value={f.discountAmount} onChange={e => setForm({ ...f, discountAmount: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Net Payable (₹)</Form.Label>
                <Form.Control className="rounded-3 bg-light fw-bold text-primary" readOnly
                  value={`₹ ${netPayable.toLocaleString()}`} />
              </Col>

              {/* Payment Plan */}
              <Col xs={12} className="mt-1">
                <p className="fw-bold text-uppercase text-muted mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  <i className="bi bi-calendar-check me-1"></i> Payment Plan & Advance
                </p>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Payment Plan *</Form.Label>
                <Form.Select className="rounded-3" value={f.paymentPlan}
                  onChange={e => setForm({ ...f, paymentPlan: e.target.value })}>
                  <option value="FULL">Full Payment</option>
                  <option value="EMI">EMI / Installments</option>
                </Form.Select>
              </Col>
              {f.paymentPlan === 'EMI' && (
                <Col md={3}>
                  <Form.Label className="small fw-bold text-muted">Number of EMIs *</Form.Label>
                  <Form.Control type="number" min="1" max="24" className="rounded-3"
                    required value={f.numberOfEmis}
                    onChange={e => setForm({ ...f, numberOfEmis: e.target.value })} placeholder="e.g. 6" />
                </Col>
              )}
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Advance Amount (₹)</Form.Label>
                <Form.Control type="number" step="0.01" className="rounded-3"
                  value={f.advanceAmount} onChange={e => setForm({ ...f, advanceAmount: e.target.value })} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Advance Date</Form.Label>
                <Form.Control type="date" className="rounded-3"
                  value={f.advancePaymentDate} onChange={e => setForm({ ...f, advancePaymentDate: e.target.value })} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Advance Method</Form.Label>
                <Form.Select className="rounded-3" value={f.advancePaymentMethod}
                  onChange={e => setForm({ ...f, advancePaymentMethod: e.target.value })}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DD">Demand Draft</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Advance Txn / Ref ID</Form.Label>
                <Form.Control className="rounded-3" placeholder="Txn / Cheque / DD No."
                  value={f.advanceTransactionId} onChange={e => setForm({ ...f, advanceTransactionId: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Remarks</Form.Label>
                <Form.Control as="textarea" rows={2} className="rounded-3"
                  value={f.remarks} onChange={e => setForm({ ...f, remarks: e.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Admission'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Admissions;
