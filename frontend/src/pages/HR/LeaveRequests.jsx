import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../../services/api';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentLeave, setCurrentLeave] = useState({
    employeeId: '', leaveType: 'CASUAL', startDate: '', endDate: '', reason: ''
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves');
      setLeaves(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: { id: parseInt(currentLeave.employeeId) },
        leaveType: currentLeave.leaveType,
        startDate: currentLeave.startDate,
        endDate: currentLeave.endDate,
        reason: currentLeave.reason,
        status: 'PENDING'
      };
      await api.post('/leaves', payload);
      setShowApplyModal(false);
      fetchLeaves();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (window.confirm(`Are you sure you want to mark this request as ${status}?`)) {
      try {
        await api.patch(`/leaves/${id}/status?status=${status}`);
        fetchLeaves();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Leave Applications</h2>
        <Button variant="primary" onClick={() => { setCurrentLeave({ employeeId: '', leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' }); setShowApplyModal(true); }}>
          <i className="bi bi-plus-lg me-2"></i>Apply Leave
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td className="px-4 fw-bold">{l.employee?.firstName} {l.employee?.lastName}</td>
                  <td>{l.leaveType}</td>
                  <td>{l.startDate}</td>
                  <td>{l.endDate}</td>
                  <td>{l.reason}</td>
                  <td>
                    <Badge bg={l.status === 'PENDING' ? 'warning' : l.status === 'APPROVED' ? 'success' : 'danger'}>
                      {l.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    {l.status === 'PENDING' && (
                      <>
                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleUpdateStatus(l.id, 'APPROVED')}>
                          Approve
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleUpdateStatus(l.id, 'REJECTED')}>
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No leave requests found.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply For Leave</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleApplyLeave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select name="employeeId" value={currentLeave.employeeId} onChange={e => setCurrentLeave({...currentLeave, employeeId: e.target.value})} required>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Leave Type</Form.Label>
              <Form.Select name="leaveType" value={currentLeave.leaveType} onChange={e => setCurrentLeave({...currentLeave, leaveType: e.target.value})}>
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="LWP">Leave Without Pay</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" name="startDate" value={currentLeave.startDate} onChange={e => setCurrentLeave({...currentLeave, startDate: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" name="endDate" value={currentLeave.endDate} onChange={e => setCurrentLeave({...currentLeave, endDate: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control as="textarea" rows={2} name="reason" value={currentLeave.reason} onChange={e => setCurrentLeave({...currentLeave, reason: e.target.value})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApplyModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Request</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
