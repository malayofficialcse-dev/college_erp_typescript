import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_COLOR = { PAID: 'success', PENDING: 'warning', OVERDUE: 'danger', WAIVED: 'secondary' };
const METHOD_ICON = { CASH: 'bi-cash-coin', UPI: 'bi-qr-code-scan', BANK_TRANSFER: 'bi-bank', CHEQUE: 'bi-file-earmark-check', DD: 'bi-card-heading' };

const AdmissionEmiSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [payForm, setPayForm] = useState({
    paidAmount: '', paidDate: new Date().toISOString().split('T')[0],
    fineAmount: '0', paymentMethod: 'CASH',
    transactionId: '', remarks: ''
  });

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [admRes, emiRes] = await Promise.all([
        api.get(`/admissions/${id}`),
        api.get(`/admissions/${id}/emi-schedule`),
      ]);
      setAdmission(admRes.data);
      setEmis(emiRes.data || []);
    } catch { setAlert({ type: 'danger', msg: 'Failed to load admission details.' }); }
    finally { setLoading(false); }
  };

  const openPayModal = (emi) => {
    setSelectedEmi(emi);
    setPayForm({
      paidAmount: emi.emiAmount, paidDate: new Date().toISOString().split('T')[0],
      fineAmount: '0', paymentMethod: 'CASH', transactionId: '', remarks: ''
    });
    setShowPayModal(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/admissions/emi/${selectedEmi.id}/pay`, {
        paidAmount: parseFloat(payForm.paidAmount),
        paidDate: payForm.paidDate,
        fineAmount: parseFloat(payForm.fineAmount || 0),
        paymentMethod: payForm.paymentMethod,
        transactionId: payForm.transactionId,
        remarks: payForm.remarks,
      });
      setAlert({ type: 'success', msg: `EMI #${selectedEmi.emiNumber} marked as PAID!` });
      setShowPayModal(false);
      loadAll();
    } catch { setAlert({ type: 'danger', msg: 'Failed to record EMI payment.' }); }
    finally { setSubmitting(false); }
  };

  const printReceipt = (emi) => {
    if (!admission) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head>
        <title>EMI Receipt - ${emi.receiptNumber || 'RECEIPT'}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
        <style>body{padding:40px;} .border-box{border:2px solid #333;padding:25px;border-radius:8px;}</style>
      </head><body>
        <div class="border-box">
          <div class="text-center mb-4">
            <h3 class="fw-bold">EMI Payment Receipt</h3>
            <p class="text-muted">Admission No: ${admission.admissionNumber}</p><hr>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <b>Student:</b> ${admission.student?.firstName} ${admission.student?.lastName}<br>
              <b>Enrollment:</b> ${admission.student?.enrollmentNumber}<br>
              <b>Course:</b> ${admission.course?.title}
            </div>
            <div class="col-6 text-end">
              <b>Receipt No:</b> ${emi.receiptNumber || 'N/A'}<br>
              <b>EMI #:</b> ${emi.emiNumber} of ${emis.length}<br>
              <b>Date:</b> ${emi.paidDate || '—'}
            </div>
          </div>
          <table class="table table-bordered my-3">
            <tr><td>EMI Amount</td><td class="text-end">₹${emi.emiAmount}</td></tr>
            <tr><td>Fine / Late Charge</td><td class="text-end">₹${emi.fineAmount || 0}</td></tr>
            <tr class="table-light fw-bold"><td>Total Paid</td><td class="text-end">₹${emi.paidAmount}</td></tr>
          </table>
          <div class="row mt-4">
            <div class="col-6"><b>Method:</b> ${emi.paymentMethod || '—'}<br><b>Txn ID:</b> ${emi.transactionId || '—'}</div>
            <div class="col-6 text-end mt-5"><p>______________________</p><small>Authorized Signature</small></div>
          </div>
        </div>
        <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  const paid = emis.filter(e => e.status === 'PAID').length;
  const pending = emis.filter(e => e.status === 'PENDING').length;
  const overdue = emis.filter(e => e.status === 'OVERDUE').length;

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center gap-3 mb-4 mt-2">
        <Button variant="light" className="rounded-circle border" style={{ width: 38, height: 38 }}
          onClick={() => navigate('/admissions')}>
          <i className="bi bi-arrow-left"></i>
        </Button>
        <div>
          <h2 className="fw-bold text-dark mb-0">Admission Details & EMI Schedule</h2>
          <p className="text-muted small mb-0">Admission No: <strong className="text-primary">{admission?.admissionNumber}</strong></p>
        </div>
      </div>

      {alert && <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="border-0 shadow-sm">{alert.msg}</Alert>}

      {/* Summary Cards */}
      {admission && (
        <Row className="g-3 mb-4">
          {[
            { label: 'Student', val: `${admission.student?.firstName} ${admission.student?.lastName}`, sub: admission.student?.enrollmentNumber, icon: 'bi-person-fill', color: '#4318FF' },
            { label: 'Course', val: admission.course?.title, sub: admission.department?.name || '—', icon: 'bi-book-fill', color: '#10b981' },
            { label: 'Net Payable', val: `₹${Number(admission.netPayableAmount || 0).toLocaleString()}`, sub: `Advance: ₹${Number(admission.advanceAmount || 0).toLocaleString()}`, icon: 'bi-receipt', color: '#3b82f6' },
            { label: 'Balance Due', val: `₹${Number(admission.balanceDue || 0).toLocaleString()}`, sub: `Paid: ₹${Number(admission.amountPaid || 0).toLocaleString()}`, icon: 'bi-wallet2', color: Number(admission.balanceDue) > 0 ? '#ef4444' : '#10b981' },
          ].map(k => (
            <Col md={3} key={k.label}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 46, height: 46, background: k.color + '18', flexShrink: 0 }}>
                    <i className={`bi ${k.icon} fs-5`} style={{ color: k.color }}></i>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-bold text-dark text-truncate">{k.val}</div>
                    <div className="text-muted small">{k.sub}</div>
                    <div className="text-muted" style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* EMI Stats */}
      {emis.length > 0 && (
        <Row className="g-3 mb-4">
          {[
            { label: 'Total EMIs', val: emis.length, color: '#4318FF' },
            { label: 'Paid', val: paid, color: '#10b981' },
            { label: 'Pending', val: pending, color: '#f59e0b' },
            { label: 'Overdue', val: overdue, color: '#ef4444' },
          ].map(s => (
            <Col xs={6} md={3} key={s.label}>
              <Card className="border-0 shadow-sm rounded-4 text-center">
                <Card.Body className="py-3">
                  <h3 className="fw-bold mb-0" style={{ color: s.color }}>{s.val}</h3>
                  <small className="text-muted fw-medium">{s.label}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* EMI Table or Full Payment Info */}
      {admission?.paymentPlan === 'EMI' ? (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
            <h5 className="fw-bold text-dark mb-0">EMI Installment Schedule</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">EMI #</th>
                  <th>Due Date</th>
                  <th>EMI Amount</th>
                  <th>Fine</th>
                  <th>Paid Amount</th>
                  <th>Paid Date</th>
                  <th>Method</th>
                  <th>Txn ID</th>
                  <th>Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emis.map(emi => (
                  <tr key={emi.id}>
                    <td className="px-4 fw-bold text-primary">EMI {emi.emiNumber}</td>
                    <td>{emi.dueDate}</td>
                    <td className="fw-semibold">₹{Number(emi.emiAmount).toLocaleString()}</td>
                    <td className="text-danger">{emi.fineAmount > 0 ? `₹${emi.fineAmount}` : '—'}</td>
                    <td className="text-success fw-semibold">{emi.paidAmount ? `₹${Number(emi.paidAmount).toLocaleString()}` : '—'}</td>
                    <td>{emi.paidDate || '—'}</td>
                    <td>
                      {emi.paymentMethod ? (
                        <span className="d-flex align-items-center gap-1">
                          <i className={`bi ${METHOD_ICON[emi.paymentMethod] || 'bi-credit-card'}`}></i>
                          <span style={{ fontSize: '0.8rem' }}>{emi.paymentMethod}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td><code>{emi.transactionId || '—'}</code></td>
                    <td>
                      <Badge bg={STATUS_COLOR[emi.status] || 'secondary'} className="rounded-pill px-3">
                        {emi.status}
                      </Badge>
                    </td>
                    <td className="text-end px-4 d-flex gap-2 justify-content-end">
                      {emi.status !== 'PAID' && (
                        <Button size="sm" variant="success" className="rounded-pill"
                          onClick={() => openPayModal(emi)}>
                          <i className="bi bi-check2-circle me-1"></i>Pay
                        </Button>
                      )}
                      {emi.status === 'PAID' && (
                        <Button size="sm" variant="light" className="rounded-pill border"
                          onClick={() => printReceipt(emi)}>
                          <i className="bi bi-printer me-1"></i>Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-check-circle-fill text-success me-2"></i>Full Payment Plan</h5>
            <Row>
              <Col md={4}><div className="text-muted small fw-bold mb-1">Total Fee</div><div className="fw-bold fs-5">₹{Number(admission?.totalFeeAmount || 0).toLocaleString()}</div></Col>
              <Col md={4}><div className="text-muted small fw-bold mb-1">Discount</div><div className="fw-bold fs-5 text-warning">₹{Number(admission?.discountAmount || 0).toLocaleString()}</div></Col>
              <Col md={4}><div className="text-muted small fw-bold mb-1">Net Payable</div><div className="fw-bold fs-5 text-primary">₹{Number(admission?.netPayableAmount || 0).toLocaleString()}</div></Col>
              <Col md={4} className="mt-3"><div className="text-muted small fw-bold mb-1">Advance Paid</div><div className="fw-bold fs-5 text-success">₹{Number(admission?.advanceAmount || 0).toLocaleString()}</div></Col>
              <Col md={4} className="mt-3"><div className="text-muted small fw-bold mb-1">Balance Due</div><div className={`fw-bold fs-5 ${Number(admission?.balanceDue) > 0 ? 'text-danger' : 'text-success'}`}>₹{Number(admission?.balanceDue || 0).toLocaleString()}</div></Col>
              <Col md={4} className="mt-3"><div className="text-muted small fw-bold mb-1">Advance Method</div><div className="fw-semibold">{admission?.advancePaymentMethod || '—'}</div></Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Pay EMI Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">
            Record EMI #{selectedEmi?.emiNumber} Payment
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePaySubmit}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Amount to Pay (₹) *</Form.Label>
                <Form.Control type="number" step="0.01" className="rounded-3" required
                  value={payForm.paidAmount} onChange={e => setPayForm({ ...payForm, paidAmount: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Fine / Late Charge (₹)</Form.Label>
                <Form.Control type="number" step="0.01" className="rounded-3"
                  value={payForm.fineAmount} onChange={e => setPayForm({ ...payForm, fineAmount: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Payment Date *</Form.Label>
                <Form.Control type="date" className="rounded-3" required
                  value={payForm.paidDate} onChange={e => setPayForm({ ...payForm, paidDate: e.target.value })} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">Payment Method *</Form.Label>
                <Form.Select className="rounded-3" required value={payForm.paymentMethod}
                  onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DD">Demand Draft</option>
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">Transaction / Reference ID</Form.Label>
                <Form.Control className="rounded-3" placeholder="UPI Txn / Cheque / DD Number"
                  value={payForm.transactionId} onChange={e => setPayForm({ ...payForm, transactionId: e.target.value })} />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold text-muted">Remarks</Form.Label>
                <Form.Control as="textarea" rows={2} className="rounded-3"
                  value={payForm.remarks} onChange={e => setPayForm({ ...payForm, remarks: e.target.value })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowPayModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Recording...' : 'Mark as Paid'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdmissionEmiSchedule;
