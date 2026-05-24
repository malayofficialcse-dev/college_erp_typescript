import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import api from '../../services/api';

const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', CANCELLED: 'secondary' };

const HrLeaveInbox = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => { fetchLeaves(); }, [filter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/search', { params: { status: filter, size: 50 } });
      setLeaves(res.data.content || res.data || []);
    } catch { setError('Failed to load leave requests.'); }
    finally { setLoading(false); }
  };

  const openAction = (leave, action) => { setSelected(leave); setActionType(action); setRemarks(''); };

  const handleAction = async () => {
    try {
      setProcessing(true);
      await api.patch(`/leaves/${selected.id}/status?status=${actionType}&remarks=${encodeURIComponent(remarks)}`);
      setSuccess(`Leave ${actionType === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      setSelected(null);
      fetchLeaves();
    } catch { setError('Action failed. Please try again.'); }
    finally { setProcessing(false); }
  };

  const tabs = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <h2 className="fw-bold text-dark mb-0">HR Leave Inbox</h2>
        <p className="text-muted mb-0 small">Review and approve or reject employee leave applications</p>
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4">
        {tabs.map(t => (
          <Button key={t} variant={filter === t ? 'primary' : 'outline-secondary'} size="sm"
            className="rounded-pill px-4" onClick={() => setFilter(t)}>
            {t}
          </Button>
        ))}
      </div>

      {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Employee</th><th>Type</th><th>From</th><th>To</th>
                  <th>Days</th><th>Reason</th><th>Applied On</th><th>Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? leaves.map(lv => (
                  <tr key={lv.id}>
                    <td className="px-4">
                      <div className="fw-semibold">{lv.employee?.firstName} {lv.employee?.lastName}</div>
                      <small className="text-muted">{lv.employee?.employeeCode}</small>
                    </td>
                    <td><Badge bg="info" className="text-dark bg-opacity-25 rounded-pill">{lv.leaveType}</Badge></td>
                    <td>{lv.startDate}</td><td>{lv.endDate}</td>
                    <td className="fw-bold">{lv.totalDays}</td>
                    <td style={{ maxWidth: 150 }} className="text-truncate text-muted small">{lv.reason}</td>
                    <td className="text-muted small">{lv.appliedDate}</td>
                    <td><Badge bg={statusColor[lv.status] || 'secondary'} className="rounded-pill px-3">{lv.status}</Badge></td>
                    <td className="text-end px-4">
                      {lv.status === 'PENDING' && (
                        <div className="d-flex gap-2 justify-content-end">
                          <Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => openAction(lv, 'APPROVED')}>
                            <i className="bi bi-check-lg me-1"></i>Approve
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => openAction(lv, 'REJECTED')}>
                            <i className="bi bi-x-lg me-1"></i>Reject
                          </Button>
                        </div>
                      )}
                      {lv.status !== 'PENDING' && <span className="text-muted small">{lv.remarks || '—'}</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>No {filter.toLowerCase()} leave requests.
                  </td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">
            {actionType === 'APPROVED' ? <span className="text-success">✓ Approve Leave</span> : <span className="text-danger">✗ Reject Leave</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {selected && (
            <>
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="fw-semibold">{selected.employee?.firstName} {selected.employee?.lastName}</div>
                <div className="text-muted small">{selected.leaveType} · {selected.totalDays} days · {selected.startDate} to {selected.endDate}</div>
                <div className="text-muted small mt-1">Reason: {selected.reason}</div>
              </div>
              <Form.Label className="text-muted small fw-bold">Remarks (optional)</Form.Label>
              <Form.Control as="textarea" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                className="rounded-3" placeholder="Add any remarks for the employee..." />
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button variant="light" onClick={() => setSelected(null)} className="rounded-pill px-4">Cancel</Button>
          <Button variant={actionType === 'APPROVED' ? 'success' : 'danger'} className="rounded-pill px-4"
            onClick={handleAction} disabled={processing}>
            {processing ? 'Processing...' : actionType === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HrLeaveInbox;
