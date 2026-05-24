import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Card, Dropdown } from "react-bootstrap";
import api from "../../services/api";

const LeaveApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState(['PENDING']);
  const [searchKeyword, setSearchKeyword] = useState("");

  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await api.get("/hr/leave-approval-steps/me");
      setApprovals(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShow = (step) => {
    setCurrentStep({ ...step, actionStatus: "APPROVED", remarks: "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setCurrentStep(null);
    setShowModal(false);
  };

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/hr/leave-approval-steps/${currentStep.id}?status=${currentStep.actionStatus}&remarks=${currentStep.remarks}`);
      fetchApprovals();
      handleClose();
    } catch (err) {
      console.error("Error processing approval", err);
    }
  };

  const toggleFilter = (setFilterState, filterState, value) => {
    if (filterState.includes(value)) {
      setFilterState(filterState.filter(item => item !== value));
    } else {
      setFilterState([...filterState, value]);
    }
  };

  const filteredApprovals = approvals.filter(a => {
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(a.status);
    const matchSearch = (a.employeeName || "").toLowerCase().includes(searchKeyword.toLowerCase()) || 
                        (a.leaveType || "").toLowerCase().includes(searchKeyword.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Leave Approval Workflow</h4>
      </div>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-center bg-light rounded">
          <div className="fw-semibold text-secondary me-2"><i className="bi bi-funnel-fill me-1"></i> Filters:</div>
          
          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Status {selectedStatuses.length > 0 && <Badge bg="primary" className="ms-1">{selectedStatuses.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '150px' }}>
              {statuses.map(st => (
                <Form.Check 
                  key={st}
                  type="checkbox"
                  label={st}
                  checked={selectedStatuses.includes(st)}
                  onChange={() => toggleFilter(setSelectedStatuses, selectedStatuses, st)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control 
            type="text" 
            placeholder="Search employee or leave type..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: '300px' }}
            className="shadow-sm border-white flex-grow-1"
          />

          {(selectedStatuses.length > 0 || searchKeyword) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={() => {
              setSelectedStatuses([]);
              setSearchKeyword("");
            }}>
              Clear Filters
            </Button>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Step Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.length > 0 ? filteredApprovals.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-bold text-secondary">#{a.leaveRequestId}</td>
                    <td className="fw-medium">{a.employeeName}</td>
                    <td>{a.leaveType}</td>
                    <td>{a.startDate} to {a.endDate}</td>
                    <td>
                      <Badge bg={
                        a.status === 'APPROVED' ? 'success' : 
                        a.status === 'REJECTED' ? 'danger' : 'warning'
                      }>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      {a.status === 'PENDING' ? (
                        <Button variant="primary" size="sm" onClick={() => handleShow(a)}>
                          Review Request
                        </Button>
                      ) : (
                        <Button variant="outline-secondary" size="sm" disabled>
                          <i className="bi bi-check-circle me-1"></i>Reviewed
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No pending approvals require your action.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Action Leave Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAction}>
          <Modal.Body>
            <div className="bg-light p-3 rounded mb-4 shadow-sm border">
              <h6 className="fw-bold mb-2 text-primary">{currentStep?.employeeName}'s Request</h6>
              <p className="mb-1 small"><strong>Leave Type:</strong> {currentStep?.leaveType}</p>
              <p className="mb-1 small"><strong>Duration:</strong> {currentStep?.startDate} to {currentStep?.endDate}</p>
              <p className="mb-0 small"><strong>Reason:</strong> {currentStep?.reason || 'No reason provided'}</p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Your Decision</Form.Label>
              <Form.Select 
                value={currentStep?.actionStatus || "APPROVED"} 
                onChange={(e) => setCurrentStep({...currentStep, actionStatus: e.target.value})}
              >
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Manager Remarks</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={currentStep?.remarks || ""} 
                onChange={(e) => setCurrentStep({...currentStep, remarks: e.target.value})} 
                placeholder="Optional comments regarding this decision"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClose}>Cancel</Button>
            <Button variant={currentStep?.actionStatus === 'REJECTED' ? 'danger' : 'success'} type="submit">
              Confirm {currentStep?.actionStatus === 'REJECTED' ? 'Rejection' : 'Approval'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveApprovals;
