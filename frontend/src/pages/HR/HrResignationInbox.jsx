import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import api from '../../services/api';

const statusColor = { PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'danger', WITHDRAWN: 'secondary' };

const HrResignationInbox = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hrRemarks, setHrRemarks] = useState('');
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/resignations/status/${filter}`);
      setResignations(res.data.content || res.data || []);
    } catch { setError('Failed to load resignations.'); }
    finally { setLoading(false); }
  };

  const openAction = (r, action) => { setSelected(r); setActionType(action); setHrRemarks(''); };

  const handleAction = async () => {
    try {
      setProcessing(true);
      await api.patch(`/resignations/${selected.id}/status?status=${actionType}&hrRemarks=${encodeURIComponent(hrRemarks)}`);
      setSuccess(`Resignation ${actionType === 'ACCEPTED' ? 'accepted' : 'rejected'}.`);
      setSelected(null);
      fetchData();
    } catch { setError('Action failed.'); }
    finally { setProcessing(false); }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <h2 className="fw-bold text-dark mb-0">HR Resignation Inbox</h2>
        <p className="text-muted mb-0 small">Review and process employee resignation requests</p>
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <div className="d-flex gap-2 mb-4">
        {['PENDING','ACCEPTED','REJECTED','WITHDRAWN'].map(t => (
          <Button key={t} variant={filter === t ? 'primary' : 'outline-secondary'} size="sm"
            className="rounded-pill px-4" onClick={() => setFilter(t)}>{t}</Button>
        ))}
      </div>

      {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Employee</th><th>Submitted</th><th>Last Working Date</th>
                  <th>Reason</th><th>Status</th><th>HR Remarks</th><th>Reviewed</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resignations.length > 0 ? resignations.map(r => (
                  <tr key={r.id}>
                    <td className="px-4">
                      <div className="fw-semibold">{r.employee?.firstName} {r.employee?.lastName}</div>
                      <small className="text-muted">{r.employee?.employeeCode} · {r.employee?.designation}</small>
                    </td>
                    <td>{r.resignationDate}</td>
                    <td className="fw-semibold text-danger">{r.lastWorkingDate || '—'}</td>
                    <td style={{ maxWidth: 180 }} className="text-truncate text-muted small">{r.reason}</td>
                    <td><Badge bg={statusColor[r.status] || 'secondary'} className="rounded-pill px-3">{r.status}</Badge></td>
                    <td className="text-muted small">{r.hrRemarks || '—'}</td>
                    <td className="text-muted small">{r.reviewedDate || '—'}</td>
                    <td className="text-end px-4">
                      {r.status === 'PENDING' && (
                        <div className="d-flex gap-2 justify-content-end">
                          <Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => openAction(r, 'ACCEPTED')}>
                            <i className="bi bi-check-lg me-1"></i>Accept
                          </Button>
                          <Button size="sm" variant="outline-danger" className="rounded-pill px-3" onClick={() => openAction(r, 'REJECTED')}>
                            <i className="bi bi-x-lg me-1"></i>Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-door-closed fs-2 d-block mb-2"></i>No {filter.toLowerCase()} resignations.
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
            {actionType === 'ACCEPTED' ? <span className="text-success">Accept Resignation</span> : <span className="text-danger">Reject Resignation</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {selected && (
            <>
              {actionType === 'ACCEPTED' && (
                <Alert variant="danger" className="border-0 rounded-3 mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Accepting will mark <strong>{selected.employee?.firstName} {selected.employee?.lastName}</strong>'s status as <strong>RESIGNED</strong>.
                </Alert>
              )}
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="fw-semibold">{selected.employee?.firstName} {selected.employee?.lastName} · {selected.employee?.designation}</div>
                <div className="text-muted small">Last Working Date: {selected.lastWorkingDate || 'Not specified'}</div>
                <div className="text-muted small mt-1">Reason: {selected.reason}</div>
              </div>
              <Form.Label className="text-muted small fw-bold">HR Remarks</Form.Label>
              <Form.Control as="textarea" rows={3} value={hrRemarks} onChange={e => setHrRemarks(e.target.value)}
                className="rounded-3" placeholder="Add HR remarks for the employee..." />
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button variant="light" onClick={() => setSelected(null)} className="rounded-pill px-4">Cancel</Button>
          <Button variant={actionType === 'ACCEPTED' ? 'success' : 'danger'} className="rounded-pill px-4"
            onClick={handleAction} disabled={processing}>
            {processing ? 'Processing...' : actionType === 'ACCEPTED' ? 'Confirm Acceptance' : 'Confirm Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HrResignationInbox;
