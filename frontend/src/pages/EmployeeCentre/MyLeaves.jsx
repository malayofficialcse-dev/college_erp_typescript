import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { fetchMyEmployee, asList } from '../../services/employeeSelfService';

const leaveTypes = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY', 'PATERNITY'];
const leaveTypeLabels = {
  CASUAL: 'Casual',
  SICK: 'Medical',
  EARNED: 'Earned',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
};
const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'secondary' };

const MyLeaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const emp = await fetchMyEmployee(user);
      setEmployee(emp);
      if (emp) {
        const leavesRes = await api.get('/leaves', { params: { employee: emp.id } });
        setLeaves(asList(leavesRes.data));
      }
    } catch (err) {
      setError('Failed to load leave data.');
    } finally {
      setLoading(false);
    }
  };

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    return Math.max(0, Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee?.id) {
      setError('No employee profile linked to your account.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/leaves', {
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        employee: employee.id,
      });
      setSuccess('Leave application submitted!');
      setShowModal(false);
      setForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch { setError('Failed to submit leave.'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await api.patch(`/leaves/${id}/status`, { status: 'CANCELLED' });
      fetchData();
    }
    catch { setError('Failed to cancel.'); }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="fw-bold text-dark mb-0">My Leave Requests</h2>
          <p className="text-muted mb-0 small">Apply for leave and track approval status</p>
        </div>
        <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle-fill me-2"></i>Apply for Leave
        </Button>
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="g-3 mb-4">
        {[
          { label: 'Casual Leave', days: 12, icon: 'bi-sun', color: '#f59e0b' },
          { label: 'Medical Leave', days: 5, icon: 'bi-heart-pulse', color: '#ef4444' },
          { label: 'Earned Leave', days: 15, icon: 'bi-star', color: '#10b981' },
        ].map(lt => (
          <Col md={4} key={lt.label}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-3 d-flex align-items-center gap-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: lt.color + '20' }}>
                  <i className={`bi ${lt.icon} fs-5`} style={{ color: lt.color }}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark">{lt.label}</div>
                  <div className="text-muted small">Entitlement: {lt.days} days/year</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Type</th><th>From</th><th>To</th><th>Days</th>
                  <th>Reason</th><th>Status</th><th>HR Remarks</th><th className="text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? leaves.map(lv => (
                  <tr key={lv.id}>
                    <td className="px-4"><Badge bg="info" className="text-dark bg-opacity-25 rounded-pill">{lv.leaveType}</Badge></td>
                    <td>{lv.startDate}</td><td>{lv.endDate}</td>
                    <td className="fw-bold">{lv.totalDays}</td>
                    <td style={{ maxWidth: 150 }} className="text-truncate">{lv.reason}</td>
                    <td><Badge bg={statusColor[lv.status] || 'secondary'} className="rounded-pill px-3">{lv.status}</Badge></td>
                    <td className="text-muted small">{lv.remarks || '—'}</td>
                    <td className="text-end px-4">
                      {lv.status === 'PENDING' && (
                        <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => handleCancel(lv.id)}>Cancel</Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>No leave requests found.
                  </td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">Apply for Leave</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Leave Type</Form.Label>
                <Form.Select name="leaveType" value={form.leaveType} onChange={e => setForm(p => ({...p, leaveType: e.target.value}))} className="rounded-3">
                  {leaveTypes.map(t => <option key={t} value={t}>{leaveTypeLabels[t] || t}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Start Date</Form.Label>
                <Form.Control type="date" value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))} required className="rounded-3" />
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">End Date</Form.Label>
                <Form.Control type="date" value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))} required className="rounded-3" />
              </Col>
              {form.startDate && form.endDate && (
                <Col md={12}>
                  <Alert variant="info" className="py-2 border-0 rounded-3 mb-0">
                    <i className="bi bi-info-circle me-2"></i>Total: <strong>{calcDays()} day(s)</strong>
                  </Alert>
                </Col>
              )}
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Reason</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} required className="rounded-3" placeholder="Briefly state reason..." />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MyLeaves;
