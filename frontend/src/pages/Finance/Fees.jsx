import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Dropdown, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import api from '../../services/api';

const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

const sourceMeta = {
  ADVANCE: { label: 'Admission', bg: 'primary' },
  EMI: { label: 'EMI', bg: 'warning' },
  INVOICE: { label: 'Invoice', bg: 'info' },
  DIRECT: { label: 'Manual', bg: 'secondary' },
};

const methodIcons = {
  CASH: 'bi-cash-coin',
  UPI: 'bi-qr-code-scan',
  BANK_TRANSFER: 'bi-bank',
  CARD: 'bi-credit-card',
  CHEQUE: 'bi-file-earmark-check',
  DD: 'bi-card-heading',
};

const defaultFilters = {
  keyword: '',
  statuses: [],
  semesters: [],
  sources: [],
  paymentMethods: [],
  dateFrom: '',
  dateTo: '',
};

const defaultForm = {
  student: '',
  amount: '',
  discountAmount: '0',
  fineAmount: '0',
  semester: '',
  paymentMethod: 'CASH',
  transactionId: '',
  feeType: 'Manual Fee Payment',
  remarks: '',
};

const sourceOptions = [
  { value: 'ADVANCE', label: 'Admission' },
  { value: 'EMI', label: 'EMI' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'DIRECT', label: 'Manual' },
];

const statusOptions = [
  { value: 'PAID', label: 'PAID' },
  { value: 'PARTIAL', label: 'PARTIAL' },
  { value: 'UNPAID', label: 'UNPAID' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];

const methodOptions = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'DD', label: 'DD' },
];

const getStudentName = (payment) =>
  `${payment.student?.firstName || ''} ${payment.student?.lastName || ''}`.trim();

const getSourceLabel = (source) => sourceMeta[source]?.label || source || 'Manual';

const getPaymentDate = (payment) =>
  payment.paymentDate ? String(payment.paymentDate).slice(0, 10) : '';

const getSearchText = (payment) =>
  [
    payment.receiptNumber,
    payment.transactionId,
    payment.feeType,
    payment.status,
    payment.source,
    getSourceLabel(payment.source),
    payment.paymentMethod,
    payment.remarks,
    payment.semester,
    getPaymentDate(payment),
    getStudentName(payment),
    payment.student?.enrollmentNumber,
    payment.student?.email,
    payment.student?.phone,
    payment.student?.department?.name,
    payment.student?.department?.code,
    payment.student?.course?.name,
    payment.student?.section?.name,
    payment.admissionId?.admissionNumber,
    payment.admissionId?.billNumber,
    payment.admissionId?.paymentPlan,
    payment.emiId?.emiNumber ? `EMI ${payment.emiId.emiNumber}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const SearchableMultiSelect = ({ label, options, selected, onChange, placeholder = 'All' }) => {
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);

  const toggleOption = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  return (
    <div>
      <Form.Label className="text-muted small fw-bold">{label}</Form.Label>
      <Dropdown autoClose="outside" className="w-100">
        <Dropdown.Toggle variant="light" className="w-100 border text-start d-flex justify-content-between align-items-center">
          <span className="text-truncate">
            {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
          </span>
          {selectedLabels.length > 0 && <Badge bg="primary" className="ms-2">{selectedLabels.length}</Badge>}
        </Dropdown.Toggle>
        <Dropdown.Menu className="w-100 p-2 shadow border-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
          <Form.Control
            size="sm"
            className="mb-2"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
          />
          {selected.length > 0 && (
            <Button variant="link" size="sm" className="px-0 text-danger text-decoration-none" onClick={() => onChange([])}>
              Clear selected
            </Button>
          )}
          {filteredOptions.length ? filteredOptions.map((option) => (
            <Form.Check
              key={option.value}
              type="checkbox"
              id={`${label}-${option.value}`}
              label={option.label}
              checked={selected.includes(option.value)}
              onChange={() => toggleOption(option.value)}
              className="my-1"
            />
          )) : (
            <div className="text-muted small px-2 py-3 text-center">No options found.</div>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

const Fees = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fees/search', { params: { size: 5000 } });
      setPayments(response.data.content || response.data || []);
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to fetch transactions.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 500 } });
      setStudents(response.data.content || response.data || []);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const semesterOptions = useMemo(() => {
    const semesters = [...new Set(payments.map((payment) => payment.semester).filter(Boolean))];
    return semesters
      .sort((first, second) => Number(first) - Number(second))
      .map((semester) => ({ value: String(semester), label: `Semester ${semester}` }));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return payments.filter((payment) => {
      const paymentDate = getPaymentDate(payment);
      if (keyword && !getSearchText(payment).includes(keyword)) return false;
      if (filters.statuses.length && !filters.statuses.includes(payment.status)) return false;
      if (filters.sources.length && !filters.sources.includes(payment.source || 'DIRECT')) return false;
      if (filters.paymentMethods.length && !filters.paymentMethods.includes(payment.paymentMethod)) return false;
      if (filters.semesters.length && !filters.semesters.includes(String(payment.semester || ''))) return false;
      if (filters.dateFrom && paymentDate < filters.dateFrom) return false;
      if (filters.dateTo && paymentDate > filters.dateTo) return false;
      return true;
    });
  }, [payments, filters]);

  const summary = useMemo(() => {
    return filteredPayments.reduce(
      (acc, payment) => {
        acc.totalCollected += Number(payment.netAmount || 0);
        acc.totalDiscount += Number(payment.discountAmount || 0);
        acc.totalFines += Number(payment.fineAmount || 0);
        acc.baseAmount += Number(payment.amount || 0);
        return acc;
      },
      { totalCollected: 0, totalDiscount: 0, totalFines: 0, baseAmount: 0 }
    );
  }, [filteredPayments]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters(defaultFilters);

  const recordManualPayment = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/fees', {
        student: form.student,
        feeType: form.feeType,
        amount: Number(form.amount),
        discountAmount: Number(form.discountAmount || 0),
        fineAmount: Number(form.fineAmount || 0),
        semester: form.semester ? Number(form.semester) : undefined,
        paymentDate: new Date().toISOString(),
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        status: 'PAID',
        source: 'DIRECT',
        remarks: form.remarks,
      });
      setAlert({ type: 'success', message: 'Transaction recorded successfully.' });
      setShowPayModal(false);
      setForm(defaultForm);
      fetchPayments();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to record transaction.' });
    } finally {
      setSubmitting(false);
    }
  };

  const exportToExcel = () => {
    const rows = filteredPayments.map((payment) => ({
      Receipt: payment.receiptNumber || '',
      Date: getPaymentDate(payment),
      Student: getStudentName(payment),
      Enrollment: payment.student?.enrollmentNumber || '',
      Email: payment.student?.email || '',
      Phone: payment.student?.phone || '',
      Department: payment.student?.department?.name || '',
      Course: payment.student?.course?.name || '',
      Section: payment.student?.section?.name || '',
      Source: getSourceLabel(payment.source),
      FeeType: payment.feeType || '',
      AdmissionNumber: payment.admissionId?.admissionNumber || '',
      BillNumber: payment.admissionId?.billNumber || '',
      PaymentPlan: payment.admissionId?.paymentPlan || '',
      EmiNumber: payment.emiId?.emiNumber || '',
      Semester: payment.semester || '',
      BaseAmount: payment.amount || 0,
      Discount: payment.discountAmount || 0,
      Fine: payment.fineAmount || 0,
      NetAmount: payment.netAmount || 0,
      Method: payment.paymentMethod || '',
      Status: payment.status || '',
      Reference: payment.transactionId || '',
      DueDate: payment.dueDate ? String(payment.dueDate).slice(0, 10) : '',
      Remarks: payment.remarks || '',
    }));

    const headers = Object.keys(rows[0] || {
      Receipt: '',
      Date: '',
      Student: '',
      Enrollment: '',
      Email: '',
      Phone: '',
      Department: '',
      Course: '',
      Section: '',
      Source: '',
      FeeType: '',
      AdmissionNumber: '',
      BillNumber: '',
      PaymentPlan: '',
      EmiNumber: '',
      Semester: '',
      BaseAmount: '',
      Discount: '',
      Fine: '',
      NetAmount: '',
      Method: '',
      Status: '',
      Reference: '',
      DueDate: '',
      Remarks: '',
    });

    const tableRows = [
      `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`,
      ...rows.map((row) =>
        `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`
      ),
    ].join('');

    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head>
        <body><table>${tableRows}</table></body>
      </html>
    `;

    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-transactions-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReceipt = (payment) => {
    const source = getSourceLabel(payment.source);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${payment.receiptNumber || payment.id}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>body{padding:40px;color:#111}.receipt{border:2px solid #111;padding:28px;border-radius:8px}</style>
        </head>
        <body>
          <div class="receipt">
            <div class="text-center mb-4">
              <h2 class="fw-bold">ERP UNIVERSITY</h2>
              <p class="text-muted mb-1">Official Finance Receipt</p>
              <hr>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <strong>Receipt:</strong> ${payment.receiptNumber || 'N/A'}<br>
                <strong>Reference:</strong> ${payment.transactionId || 'N/A'}<br>
                <strong>Date:</strong> ${getPaymentDate(payment) || 'N/A'}<br>
                <strong>Source:</strong> ${source}
              </div>
              <div class="col-6 text-end">
                <strong>Student:</strong> ${getStudentName(payment)}<br>
                <strong>Enrollment:</strong> ${payment.student?.enrollmentNumber || 'N/A'}<br>
                <strong>Department:</strong> ${payment.student?.department?.name || 'N/A'}<br>
                <strong>Admission:</strong> ${payment.admissionId?.admissionNumber || 'N/A'}
              </div>
            </div>
            <table class="table table-bordered my-4">
              <tbody>
                <tr><td>${payment.feeType || 'Fee Payment'}</td><td class="text-end">${currency(payment.amount)}</td></tr>
                <tr><td>Discount</td><td class="text-end">-${currency(payment.discountAmount)}</td></tr>
                <tr><td>Fine</td><td class="text-end">+${currency(payment.fineAmount)}</td></tr>
                <tr class="fw-bold table-light"><td>Net Amount</td><td class="text-end">${currency(payment.netAmount)}</td></tr>
              </tbody>
            </table>
            <p><strong>Payment Method:</strong> ${payment.paymentMethod || 'N/A'}</p>
            <p><strong>Remarks:</strong> ${payment.remarks || 'None'}</p>
          </div>
          <script>window.onload = function(){ window.print(); }</script>
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
          <p className="text-muted mb-0 small">
            Showing {filteredPayments.length} of {payments.length} finance transactions.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" className="rounded-pill px-4" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel-fill me-2"></i>Export Excel
          </Button>
          <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowPayModal(true)}>
            <i className="bi bi-plus-circle-fill me-2"></i>Record Transaction
          </Button>
        </div>
      </div>

      {alert && (
        <Alert variant={alert.type} className="border-0 shadow-sm" onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <Row className="g-3 mb-4">
        {[
          ['Net Collected', summary.totalCollected, 'bi-wallet-fill', 'success'],
          ['Base Amount', summary.baseAmount, 'bi-cash-stack', 'primary'],
          ['Discounts', summary.totalDiscount, 'bi-tags-fill', 'warning'],
          ['Fines', summary.totalFines, 'bi-exclamation-circle-fill', 'danger'],
        ].map(([label, value, icon, variant]) => (
          <Col md={3} key={label}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className={`rounded-circle bg-${variant}-subtle text-${variant} d-flex align-items-center justify-content-center`} style={{ width: 44, height: 44 }}>
                  <i className={`bi ${icon}`}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark">{currency(value)}</div>
                  <small className="text-muted">{label}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 bg-light rounded-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="text-muted small fw-bold">Search All Details</Form.Label>
              <Form.Control
                value={filters.keyword}
                onChange={(event) => updateFilter('keyword', event.target.value)}
                placeholder="Student, receipt, admission, reference..."
              />
            </Col>
            <Col md={2}>
              <SearchableMultiSelect
                label="Source"
                options={sourceOptions}
                selected={filters.sources}
                onChange={(value) => updateFilter('sources', value)}
                placeholder="All Sources"
              />
            </Col>
            <Col md={2}>
              <SearchableMultiSelect
                label="Status"
                options={statusOptions}
                selected={filters.statuses}
                onChange={(value) => updateFilter('statuses', value)}
                placeholder="All Statuses"
              />
            </Col>
            <Col md={2}>
              <SearchableMultiSelect
                label="Method"
                options={methodOptions}
                selected={filters.paymentMethods}
                onChange={(value) => updateFilter('paymentMethods', value)}
                placeholder="All Methods"
              />
            </Col>
            <Col md={1}>
              <SearchableMultiSelect
                label="Sem"
                options={semesterOptions}
                selected={filters.semesters}
                onChange={(value) => updateFilter('semesters', value)}
                placeholder="All"
              />
            </Col>
            <Col md={1}>
              <Form.Label className="text-muted small fw-bold">From</Form.Label>
              <Form.Control type="date" value={filters.dateFrom} onChange={(event) => updateFilter('dateFrom', event.target.value)} />
            </Col>
            <Col md={1}>
              <Form.Label className="text-muted small fw-bold">To</Form.Label>
              <Form.Control type="date" value={filters.dateTo} onChange={(event) => updateFilter('dateTo', event.target.value)} />
            </Col>
            <Col md={12} className="d-flex justify-content-end">
              <Button variant="link" className="text-danger text-decoration-none px-0" onClick={clearFilters}>
                Clear all filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3">Receipt / Date</th>
                  <th>Student</th>
                  <th>Source</th>
                  <th>Admission / EMI</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th className="text-end px-4">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length ? filteredPayments.map((payment) => {
                  const source = sourceMeta[payment.source] || sourceMeta.DIRECT;
                  return (
                    <tr key={payment.id || payment._id}>
                      <td className="px-4">
                        <div className="fw-bold text-dark">{payment.receiptNumber || 'N/A'}</div>
                        <small className="text-muted">{getPaymentDate(payment) || 'N/A'}</small>
                      </td>
                      <td>
                        <div className="fw-semibold">{getStudentName(payment)}</div>
                        <small className="text-muted">{payment.student?.enrollmentNumber || 'N/A'} - {payment.student?.department?.name || 'N/A'}</small>
                      </td>
                      <td><Badge bg={source.bg}>{source.label}</Badge></td>
                      <td>
                        <div className="fw-semibold small">{payment.admissionId?.admissionNumber || 'N/A'}</div>
                        <small className="text-muted">{payment.emiId?.emiNumber ? `EMI #${payment.emiId.emiNumber}` : payment.admissionId?.paymentPlan || 'Manual'}</small>
                      </td>
                      <td>
                        <div className="fw-bold">{currency(payment.netAmount)}</div>
                        <small className="text-muted">Base {currency(payment.amount)}</small>
                      </td>
                      <td>
                        <span className="d-inline-flex align-items-center gap-2">
                          <i className={`bi ${methodIcons[payment.paymentMethod] || 'bi-credit-card'}`}></i>
                          {payment.paymentMethod || 'N/A'}
                        </span>
                      </td>
                      <td><Badge bg={payment.status === 'PAID' ? 'success' : payment.status === 'PARTIAL' ? 'warning' : 'secondary'}>{payment.status}</Badge></td>
                      <td><code className="text-dark">{payment.transactionId || 'N/A'}</code></td>
                      <td className="text-end px-4">
                        <Button variant="light" size="sm" className="rounded-pill border" onClick={() => printReceipt(payment)}>
                          <i className="bi bi-printer-fill me-1"></i>Print
                        </Button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="9" className="text-center py-5 text-muted">No finance transactions found.</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">Record Manual Transaction</Modal.Title>
        </Modal.Header>
        <Form onSubmit={recordManualPayment}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Student</Form.Label>
                <Form.Select value={form.student} onChange={(event) => updateForm('student', event.target.value)} required>
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id || student._id} value={student.id || student._id}>
                      [{student.enrollmentNumber}] {student.firstName} {student.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Fee Type</Form.Label>
                <Form.Control value={form.feeType} onChange={(event) => updateForm('feeType', event.target.value)} required />
              </Col>
              <Col md={3}>
                <Form.Label className="text-muted small fw-bold">Base Amount</Form.Label>
                <Form.Control type="number" min="0" step="0.01" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} required />
              </Col>
              <Col md={3}>
                <Form.Label className="text-muted small fw-bold">Discount</Form.Label>
                <Form.Control type="number" min="0" step="0.01" value={form.discountAmount} onChange={(event) => updateForm('discountAmount', event.target.value)} />
              </Col>
              <Col md={3}>
                <Form.Label className="text-muted small fw-bold">Fine</Form.Label>
                <Form.Control type="number" min="0" step="0.01" value={form.fineAmount} onChange={(event) => updateForm('fineAmount', event.target.value)} />
              </Col>
              <Col md={3}>
                <Form.Label className="text-muted small fw-bold">Semester</Form.Label>
                <Form.Control type="number" min="1" value={form.semester} onChange={(event) => updateForm('semester', event.target.value)} />
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small fw-bold">Payment Method</Form.Label>
                <Form.Select value={form.paymentMethod} onChange={(event) => updateForm('paymentMethod', event.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DD">Demand Draft</option>
                </Form.Select>
              </Col>
              <Col md={8}>
                <Form.Label className="text-muted small fw-bold">Transaction / Reference ID</Form.Label>
                <Form.Control value={form.transactionId} onChange={(event) => updateForm('transactionId', event.target.value)} placeholder="UPI, card, cheque, or bank reference" />
              </Col>
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Remarks</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.remarks} onChange={(event) => updateForm('remarks', event.target.value)} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowPayModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4" disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Transaction'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Fees;
