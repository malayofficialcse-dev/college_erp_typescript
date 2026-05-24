import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Card, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';

const paymentMethodIcons = {
  CASH: 'bi-cash-coin',
  BANK_TRANSFER: 'bi-bank',
  UPI: 'bi-qr-code-scan',
  CHEQUE: 'bi-file-earmark-check',
  DD: 'bi-card-heading'
};

const methodBadgeBg = {
  CASH: 'success',
  BANK_TRANSFER: 'primary',
  UPI: 'info',
  CHEQUE: 'warning',
  DD: 'secondary'
};

const Fees = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [totalCollected, setTotalCollected] = useState(0);

  const [showPayModal, setShowPayModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Search & Filter state
  const [filters, setFilters] = useState({
    studentId: '',
    status: '',
    semester: '',
    dateFrom: '',
    dateTo: '',
    keyword: ''
  });

  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    discountAmount: '0',
    fineAmount: '0',
    semester: '',
    paymentMethod: 'CASH',
    transactionId: '',
    paymentType: 'INITIAL', // INITIAL or EMI
    remarks: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchDepartments();
    fetchTotalCollected();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees/search', { params: { ...filters, size: 50 } });
      setPayments(res.data.content || res.data || []);
    } catch {
      setError('Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/search', { params: { size: 200 } });
      setStudents(res.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.content || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTotalCollected = async () => {
    try {
      const res = await api.get('/fees/total-collected');
      setTotalCollected(res.data.totalCollected || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Inject payment type into remarks
      const formattedRemarks = `[Type: ${form.paymentType}] ${form.remarks}`;
      const payload = {
        student: { id: parseInt(form.studentId) },
        amount: parseFloat(form.amount),
        discountAmount: parseFloat(form.discountAmount || 0),
        fineAmount: parseFloat(form.fineAmount || 0),
        semester: form.semester,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        remarks: formattedRemarks,
        status: 'PAID'
      };

      await api.post('/fees', payload);
      setSuccess('Transaction recorded successfully!');
      setShowPayModal(false);
      // Reset form
      setForm({
        studentId: '', amount: '', discountAmount: '0', fineAmount: '0',
        semester: '', paymentMethod: 'CASH', transactionId: '', paymentType: 'INITIAL', remarks: ''
      });
      fetchPayments();
      fetchTotalCollected();
    } catch {
      setError('Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const parsePaymentType = (remarksStr) => {
    if (!remarksStr) return 'INITIAL';
    if (remarksStr.includes('[Type: EMI]')) return 'EMI';
    if (remarksStr.includes('[Type: INITIAL]')) return 'INITIAL';
    return 'INITIAL';
  };

  const parseCleanRemarks = (remarksStr) => {
    if (!remarksStr) return '';
    return remarksStr.replace(/\[Type: (EMI|INITIAL)\]\s*/, '');
  };

  const printReceipt = (p) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${p.receiptNumber || ('REC-' + p.id)}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            body { font-family: sans-serif; padding: 40px; background: white; color: black; }
            .receipt-border { border: 2px solid #333; padding: 25px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="receipt-border">
            <div class="text-center mb-4">
              <h2 class="fw-bold">ERP UNIVERSITY</h2>
              <p class="text-muted mb-1">Official Fee Receipt</p>
              <hr>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <strong>Receipt Number:</strong> ${p.receiptNumber || ('REC-' + p.id)}<br>
                <strong>Transaction ID:</strong> ${p.transactionId || 'N/A'}<br>
                <strong>Date:</strong> ${p.paymentDate}
              </div>
              <div class="col-6 text-end">
                <strong>Student Name:</strong> ${p.student?.firstName} ${p.student?.lastName}<br>
                <strong>Student Code:</strong> ${p.student?.enrollmentNumber}<br>
                <strong>Department:</strong> ${p.student?.department?.name || 'N/A'}
              </div>
            </div>
            <table class="table table-bordered my-4">
              <thead>
                <tr class="table-light">
                  <th>Particulars</th>
                  <th class="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Amount (${p.semester})</td>
                  <td class="text-end">$${p.amount}</td>
                </tr>
                <tr>
                  <td>Discount</td>
                  <td class="text-end">-$${p.discountAmount || 0}</td>
                </tr>
                <tr>
                  <td>Fines / Late Charges</td>
                  <td class="text-end">+$${p.fineAmount || 0}</td>
                </tr>
                <tr class="table-light fw-bold">
                  <td>Net Collected</td>
                  <td class="text-end">$${p.netAmount}</td>
                </tr>
              </tbody>
            </table>
            <div class="row mt-4">
              <div class="col-6">
                <strong>Payment Method:</strong> ${p.paymentMethod}<br>
                <strong>Installment Type:</strong> ${parsePaymentType(p.remarks)}<br>
                <strong>Remarks:</strong> ${parseCleanRemarks(p.remarks) || 'None'}
              </div>
              <div class="col-6 text-end mt-5">
                <p class="mb-0">______________________</p>
                <small>Authorized Collector (${p.createdBy || 'Admin Staff'})</small>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="text-dark fw-bold mb-0">Transaction List</h2>
          <p className="text-muted mb-0 small">Total Cash Collected: <strong className="text-primary">${totalCollected.toLocaleString()}</strong></p>
        </div>
        <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => setShowPayModal(true)}>
          <i className="bi bi-plus-circle-fill me-2"></i>Record Transaction
        </Button>
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Filters Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 bg-light rounded-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Label className="text-muted small fw-bold">Search Keywords</Form.Label>
              <Form.Control type="text" placeholder="Receipt / Txn ID / Remarks..." value={filters.keyword}
                onChange={e => setFilters({...filters, keyword: e.target.value})} className="rounded-3" />
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">Semester</Form.Label>
              <Form.Control type="text" placeholder="e.g. Semester I" value={filters.semester}
                onChange={e => setFilters({...filters, semester: e.target.value})} className="rounded-3" />
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">Payment Status</Form.Label>
              <Form.Select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="rounded-3">
                <option value="">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
              </Form.Select>
            </Col>
            <Col md={2.5}>
              <Form.Label className="text-muted small fw-bold">From Date</Form.Label>
              <Form.Control type="date" value={filters.dateFrom}
                onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="rounded-3" />
            </Col>
            <Col md={2.5}>
              <Form.Label className="text-muted small fw-bold">To Date</Form.Label>
              <Form.Control type="date" value={filters.dateTo}
                onChange={e => setFilters({...filters, dateTo: e.target.value})} className="rounded-3" />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Receipt / Date</th>
                  <th>Student Info</th>
                  <th>Department</th>
                  <th>Payment Type</th>
                  <th>Collected Amount</th>
                  <th>Payment Method</th>
                  <th>Reference ID</th>
                  <th>Who Taken</th>
                  <th className="text-end px-4">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? payments.map(p => (
                  <tr key={p.id}>
                    <td className="px-4">
                      <div className="fw-bold text-dark">{p.receiptNumber || `REC-${p.id}`}</div>
                      <small className="text-muted">{p.paymentDate}</small>
                    </td>
                    <td>
                      <div className="fw-semibold">{p.student?.firstName} {p.student?.lastName}</div>
                      <small className="text-muted">{p.student?.enrollmentNumber}</small>
                    </td>
                    <td>{p.student?.department?.name || 'N/A'}</td>
                    <td>
                      <Badge bg={parsePaymentType(p.remarks) === 'INITIAL' ? 'primary' : 'warning'} className="rounded-pill px-2.5">
                        {parsePaymentType(p.remarks)}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">${p.netAmount}</div>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Base: ${p.amount} · Disc: -${p.discountAmount || 0}
                      </small>
                    </td>
                    <td>
                      <Badge bg={methodBadgeBg[p.paymentMethod] || 'secondary'} className="rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5">
                        <i className={`bi ${paymentMethodIcons[p.paymentMethod] || 'bi-credit-card'}`}></i>
                        {p.paymentMethod}
                      </Badge>
                    </td>
                    <td><code className="text-dark">{p.transactionId || '—'}</code></td>
                    <td>
                      <span className="fw-semibold text-secondary">{p.createdBy || 'Admin Staff'}</span>
                    </td>
                    <td className="text-end px-4">
                      <Button variant="light" size="sm" className="rounded-pill border" onClick={() => printReceipt(p)}>
                        <i className="bi bi-printer-fill me-1"></i>Print
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" className="text-center py-5 text-muted">
                    <i className="bi bi-receipt fs-2 d-block mb-2"></i>No fee payments found.
                  </td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Record Payment Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">Record Fee Payment Transaction</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePay}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Student</Form.Label>
                <Form.Select value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required className="rounded-3">
                  <option value="">Select Student</option>
                  {students.map(st => (
                    <option key={st.id} value={st.id}>[{st.enrollmentNumber}] {st.firstName} {st.lastName}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Semester</Form.Label>
                <Form.Control type="text" placeholder="e.g. Semester III" value={form.semester}
                  onChange={e => setForm({...form, semester: e.target.value})} required className="rounded-3" />
              </Col>
              
              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Base Amount</Form.Label>
                <Form.Control type="number" step="0.01" value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})} required className="rounded-3" />
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Discount Amount</Form.Label>
                <Form.Control type="number" step="0.01" value={form.discountAmount}
                  onChange={e => setForm({...form, discountAmount: e.target.value})} className="rounded-3" />
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Fine Amount</Form.Label>
                <Form.Control type="number" step="0.01" value={form.fineAmount}
                  onChange={e => setForm({...form, fineAmount: e.target.value})} className="rounded-3" />
              </Col>

              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Payment Method</Form.Label>
                <Form.Select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="rounded-3">
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DD">Demand Draft</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Transaction / Ref ID</Form.Label>
                <Form.Control type="text" placeholder="For Online / Cheque payments" value={form.transactionId}
                  onChange={e => setForm({...form, transactionId: e.target.value})} className="rounded-3" />
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Payment Category</Form.Label>
                <Form.Select value={form.paymentType} onChange={e => setForm({...form, paymentType: e.target.value})} className="rounded-3">
                  <option value="INITIAL">Initial / Enrollment Fee</option>
                  <option value="EMI">EMI / Installment</option>
                </Form.Select>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="text-muted small fw-bold">Collector Remarks</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Add specific bank details, check numbers or notes..." value={form.remarks}
                    onChange={e => setForm({...form, remarks: e.target.value})} className="rounded-3" />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowPayModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Transaction'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Fees;
