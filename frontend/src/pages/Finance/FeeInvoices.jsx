import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import api from '../../services/api';

const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

const defaultInvoice = {
  student: '',
  dueDate: '',
  totalAmount: '',
  description: '',
  remarks: '',
};

const FeeInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState(defaultInvoice);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    referenceNumber: '',
    remarks: '',
  });
  const [filters, setFilters] = useState({ status: '', keyword: '' });
  const [alert, setAlert] = useState(null);

  const fetchInvoices = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const response = await api.get('/finance/invoices', { params });
      setInvoices(response.data.content || response.data || []);
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to fetch invoices.' });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 300 } });
      setStudents(response.data.content || response.data || []);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const createInvoice = async (event) => {
    event.preventDefault();
    try {
      await api.post('/finance/invoices', {
        ...invoiceForm,
        totalAmount: Number(invoiceForm.totalAmount),
      });
      setAlert({ type: 'success', message: 'Invoice created successfully.' });
      setShowInvoiceModal(false);
      setInvoiceForm(defaultInvoice);
      fetchInvoices();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to create invoice.' });
    }
  };

  const openPayment = (invoice) => {
    const balance = Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0);
    setCurrentInvoice(invoice);
    setPaymentForm({ amount: String(balance), paymentMethod: 'CASH', referenceNumber: '', remarks: '' });
    setShowPaymentModal(true);
  };

  const recordPayment = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/finance/invoices/${currentInvoice.id || currentInvoice._id}/payments`, {
        ...paymentForm,
        amount: Number(paymentForm.amount),
      });
      setAlert({ type: 'success', message: 'Invoice payment recorded and added to Transaction List.' });
      setShowPaymentModal(false);
      setCurrentInvoice(null);
      fetchInvoices();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to record invoice payment.' });
    }
  };

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-0">Fee Invoices</h2>
          <p className="text-muted mb-0 small">Create invoices and collect payments into the finance ledger.</p>
        </div>
        <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowInvoiceModal(true)}>
          <i className="bi bi-receipt me-2"></i>Create Invoice
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type} className="border-0 shadow-sm" onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm border-0 rounded-4">
        <Card.Body className="bg-light rounded-4">
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="text-muted small fw-bold">Search</Form.Label>
              <Form.Control value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} placeholder="Invoice, description, remarks" />
            </Col>
            <Col md={3}>
              <Form.Label className="text-muted small fw-bold">Status</Form.Label>
              <Form.Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th>Student</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length ? invoices.map((invoice) => {
                const balance = Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0);
                return (
                  <tr key={invoice.id || invoice._id}>
                    <td className="px-4">
                      <div className="fw-bold text-primary">{invoice.invoiceNumber}</div>
                      <small className="text-muted">{invoice.description || 'Fee invoice'}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{invoice.student?.firstName} {invoice.student?.lastName}</div>
                      <small className="text-muted">{invoice.student?.enrollmentNumber}</small>
                    </td>
                    <td>{invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : 'N/A'}</td>
                    <td>{currency(invoice.totalAmount)}</td>
                    <td className="text-success fw-semibold">{currency(invoice.paidAmount)}</td>
                    <td className={balance > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{currency(balance)}</td>
                    <td><Badge bg={invoice.status === 'PAID' ? 'success' : invoice.status === 'PARTIAL' ? 'warning' : 'danger'}>{invoice.status}</Badge></td>
                    <td className="text-end px-4">
                      <Button variant="outline-success" size="sm" disabled={invoice.status === 'PAID'} onClick={() => openPayment(invoice)}>
                        <i className="bi bi-credit-card me-1"></i>Pay
                      </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="8" className="text-center py-4 text-muted">No invoices found.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Create Fee Invoice</Modal.Title></Modal.Header>
        <Form onSubmit={createInvoice}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Student</Form.Label>
                <Form.Select value={invoiceForm.student} onChange={(e) => setInvoiceForm({ ...invoiceForm, student: e.target.value })} required>
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id || student._id} value={student.id || student._id}>
                      [{student.enrollmentNumber}] {student.firstName} {student.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} required />
              </Col>
              <Col md={3}>
                <Form.Label>Total Amount</Form.Label>
                <Form.Control type="number" min="0" value={invoiceForm.totalAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })} required />
              </Col>
              <Col md={12}>
                <Form.Label>Description</Form.Label>
                <Form.Control value={invoiceForm.description} onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })} placeholder="Tuition, hostel, exam fee..." />
              </Col>
              <Col md={12}>
                <Form.Label>Remarks</Form.Label>
                <Form.Control as="textarea" rows={2} value={invoiceForm.remarks} onChange={(e) => setInvoiceForm({ ...invoiceForm, remarks: e.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Invoice</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Record Invoice Payment</Modal.Title></Modal.Header>
        <Form onSubmit={recordPayment}>
          <Modal.Body>
            <div className="bg-light p-3 rounded mb-3">
              <div className="fw-bold">{currentInvoice?.invoiceNumber}</div>
              <small className="text-muted">Outstanding: {currency(Number(currentInvoice?.totalAmount || 0) - Number(currentInvoice?.paidAmount || 0))}</small>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Payment Amount</Form.Label>
              <Form.Control type="number" min="1" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DD">DD</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reference Number</Form.Label>
              <Form.Control value={paymentForm.referenceNumber} onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control as="textarea" rows={2} value={paymentForm.remarks} onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Confirm Payment</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeInvoices;
