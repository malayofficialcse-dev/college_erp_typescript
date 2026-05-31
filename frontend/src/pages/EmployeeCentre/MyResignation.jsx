import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { fetchMyEmployee, asList } from '../../services/employeeSelfService';

const statusColor = { PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'danger', WITHDRAWN: 'secondary' };

const MyResignation = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ lastWorkingDate: '', reason: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const emp = await fetchMyEmployee(user);
      setEmployee(emp);
      if (emp) {
        const res = await api.get('/resignations', { params: { employee: emp.id } });
        setResignations(asList(res.data));
      }
    } catch { setError('Failed to load resignation data.'); }
    finally { setLoading(false); }
  };

  const hasPending = resignations.some(r => r.status === 'PENDING');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee?.id) {
      setError('No employee profile linked to your account.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/resignations', {
        lastWorkingDate: form.lastWorkingDate,
        reason: form.reason,
        employee: employee.id,
      });
      setSuccess('Resignation submitted. HR will review your request.');
      setShowModal(false);
      setForm({ lastWorkingDate: '', reason: '' });
      fetchData();
    } catch { setError('Failed to submit resignation.'); }
    finally { setSubmitting(false); }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this resignation?')) return;
    try {
      await api.patch(`/resignations/${id}/status`, { status: 'WITHDRAWN' });
      setSuccess('Resignation withdrawn successfully.');
      fetchData();
    } catch { setError('Failed to withdraw resignation.'); }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="fw-bold text-dark mb-0">My Resignation</h2>
          <p className="text-muted mb-0 small">Submit a resignation request and track its status</p>
        </div>
        {!hasPending && (
          <Button variant="danger" className="rounded-pill px-4 shadow-sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-door-open-fill me-2"></i>Submit Resignation
          </Button>
        )}
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {hasPending && (
        <Alert variant="warning" className="border-0 shadow-sm rounded-4 mb-4">
          <i className="bi bi-hourglass-split me-2"></i>
          You have a <strong>pending resignation</strong> under HR review. You cannot submit a new one until it is resolved.
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Submitted On</th>
                  <th>Last Working Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>HR Remarks</th>
                  <th>Reviewed On</th>
                  <th className="text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {resignations.length > 0 ? resignations.map(r => (
                  <tr key={r.id}>
                    <td className="px-4">{r.resignationDate}</td>
                    <td>{r.lastWorkingDate || '—'}</td>
                    <td style={{ maxWidth: 200 }} className="text-truncate">{r.reason}</td>
                    <td><Badge bg={statusColor[r.status] || 'secondary'} className="rounded-pill px-3">{r.status}</Badge></td>
                    <td className="text-muted small">{r.hrRemarks || '—'}</td>
                    <td className="text-muted small">{r.reviewedDate || '—'}</td>
                    <td className="text-end px-4">
                      {r.status === 'PENDING' && (
                        <Button size="sm" variant="outline-secondary" className="rounded-pill px-3" onClick={() => handleWithdraw(r.id)}>
                          <i className="bi bi-arrow-counterclockwise me-1"></i>Withdraw
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-door-closed fs-2 d-block mb-2"></i>No resignation requests found.
                  </td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold text-danger"><i className="bi bi-door-open-fill me-2"></i>Submit Resignation</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 py-4">
            <Alert variant="warning" className="border-0 rounded-3 mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              This action will notify HR. Please ensure you have considered your decision carefully.
            </Alert>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Proposed Last Working Date</Form.Label>
                <Form.Control type="date" value={form.lastWorkingDate}
                  onChange={e => setForm(p => ({...p, lastWorkingDate: e.target.value}))}
                  min={new Date().toISOString().split('T')[0]} required className="rounded-3" />
              </Col>
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Reason for Resignation</Form.Label>
                <Form.Control as="textarea" rows={4} value={form.reason}
                  onChange={e => setForm(p => ({...p, reason: e.target.value}))}
                  required className="rounded-3" placeholder="Please describe your reason for leaving..." />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="danger" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MyResignation;
