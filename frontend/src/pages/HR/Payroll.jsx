import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../../services/api';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [showGenModal, setShowGenModal] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState({
    employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: '', allowances: 0, deductions: 0
  });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/payroll');
      setPayrolls(response.data.content || response.data);
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: { id: parseInt(currentPayroll.employeeId) },
        month: parseInt(currentPayroll.month),
        year: parseInt(currentPayroll.year),
        basicSalary: parseFloat(currentPayroll.basicSalary),
        allowances: parseFloat(currentPayroll.allowances),
        deductions: parseFloat(currentPayroll.deductions),
        netSalary: parseFloat(currentPayroll.basicSalary) + parseFloat(currentPayroll.allowances) - parseFloat(currentPayroll.deductions),
        status: 'UNPAID'
      };
      await api.post('/payroll', payload);
      setShowGenModal(false);
      fetchPayrolls();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePaySalary = async (id) => {
    if (window.confirm('Mark this payroll record as PAID?')) {
      try {
        await api.patch(`/payroll/${id}/status?status=PAID`);
        fetchPayrolls();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Payroll Management</h2>
        <Button variant="primary" onClick={() => { setCurrentPayroll({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: '', allowances: 0, deductions: 0 }); setShowGenModal(true); }}>
          <i className="bi bi-receipt me-2"></i>Generate Payslip
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th>Month/Year</th>
                <th>Basic Salary</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id}>
                  <td className="px-4 fw-bold">{p.employee?.firstName} {p.employee?.lastName}</td>
                  <td>{p.month}/{p.year}</td>
                  <td>${p.basicSalary}</td>
                  <td>${p.netSalary}</td>
                  <td>
                    <Badge bg={p.status === 'PAID' ? 'success' : 'danger'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    {p.status === 'UNPAID' && (
                      <Button variant="outline-success" size="sm" onClick={() => handlePaySalary(p.id)}>
                        Process Payment
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No payroll records generated yet.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      <Modal show={showGenModal} onHide={() => setShowGenModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Payslip</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGenerate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select name="employeeId" value={currentPayroll.employeeId} onChange={e => setCurrentPayroll({...currentPayroll, employeeId: e.target.value})} required>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Month</Form.Label>
                  <Form.Control type="number" min="1" max="12" name="month" value={currentPayroll.month} onChange={e => setCurrentPayroll({...currentPayroll, month: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control type="number" name="year" value={currentPayroll.year} onChange={e => setCurrentPayroll({...currentPayroll, year: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Basic Salary</Form.Label>
              <Form.Control type="number" step="0.01" name="basicSalary" value={currentPayroll.basicSalary} onChange={e => setCurrentPayroll({...currentPayroll, basicSalary: e.target.value})} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allowances</Form.Label>
                  <Form.Control type="number" step="0.01" name="allowances" value={currentPayroll.allowances} onChange={e => setCurrentPayroll({...currentPayroll, allowances: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Deductions</Form.Label>
                  <Form.Control type="number" step="0.01" name="deductions" value={currentPayroll.deductions} onChange={e => setCurrentPayroll({...currentPayroll, deductions: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGenModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Payroll;
