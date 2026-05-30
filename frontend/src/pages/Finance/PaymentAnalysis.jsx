import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import api from '../../services/api';

const currency = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

const sourceLabel = {
  ADVANCE: 'Admission',
  EMI: 'EMI',
  INVOICE: 'Invoice',
  DIRECT: 'Manual',
};

const PaymentAnalysis = () => {
  const [payments, setPayments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    departmentId: '',
    paymentMethod: '',
    source: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentResponse, departmentResponse] = await Promise.all([
        api.get('/fees/search', { params: { size: 1000 } }),
        api.get('/departments'),
      ]);
      setPayments(paymentResponse.data.content || paymentResponse.data || []);
      setDepartments(departmentResponse.data.content || departmentResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payment analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = payment.paymentDate ? String(payment.paymentDate).slice(0, 10) : '';
      const departmentId = String(payment.student?.department?.id || payment.student?.department?._id || '');

      if (filters.dateFrom && paymentDate < filters.dateFrom) return false;
      if (filters.dateTo && paymentDate > filters.dateTo) return false;
      if (filters.departmentId && departmentId !== filters.departmentId) return false;
      if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) return false;
      if (filters.source && payment.source !== filters.source) return false;
      return true;
    });
  }, [payments, filters]);

  const totals = useMemo(() => {
    return filteredPayments.reduce(
      (acc, payment) => {
        acc.net += Number(payment.netAmount || 0);
        acc.base += Number(payment.amount || 0);
        acc.discount += Number(payment.discountAmount || 0);
        acc.fines += Number(payment.fineAmount || 0);
        return acc;
      },
      { net: 0, base: 0, discount: 0, fines: 0 }
    );
  }, [filteredPayments]);

  const methodStats = useMemo(() => {
    return filteredPayments.reduce((acc, payment) => {
      const key = payment.paymentMethod || 'Unknown';
      acc[key] = (acc[key] || 0) + Number(payment.netAmount || 0);
      return acc;
    }, {});
  }, [filteredPayments]);

  const sourceStats = useMemo(() => {
    return filteredPayments.reduce((acc, payment) => {
      const key = sourceLabel[payment.source] || payment.source || 'Manual';
      acc[key] = (acc[key] || 0) + Number(payment.netAmount || 0);
      return acc;
    }, {});
  }, [filteredPayments]);

  const departmentStats = useMemo(() => {
    return filteredPayments.reduce((acc, payment) => {
      const key = payment.student?.department?.name || 'Unknown';
      acc[key] = (acc[key] || 0) + Number(payment.netAmount || 0);
      return acc;
    }, {});
  }, [filteredPayments]);

  const monthlyStats = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => ({
      label: new Date(2025, index, 1).toLocaleString(undefined, { month: 'short' }),
      amount: 0,
    }));
    filteredPayments.forEach((payment) => {
      if (!payment.paymentDate) return;
      const month = new Date(payment.paymentDate).getMonth();
      if (months[month]) months[month].amount += Number(payment.netAmount || 0);
    });
    return months;
  }, [filteredPayments]);

  const maxMonthly = Math.max(...monthlyStats.map((item) => item.amount), 1);
  const averagePayment = filteredPayments.length ? totals.net / filteredPayments.length : 0;

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <h2 className="text-dark fw-bold mb-0">Payment Analysis</h2>
        <p className="text-muted mb-0 small">Analytics for admission, EMI, and manual finance transactions.</p>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 bg-light rounded-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Label className="text-muted small fw-bold">Department</Form.Label>
              <Form.Select value={filters.departmentId} onChange={(e) => updateFilter('departmentId', e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department.id || department._id} value={String(department.id || department._id)}>{department.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">Source</Form.Label>
              <Form.Select value={filters.source} onChange={(e) => updateFilter('source', e.target.value)}>
                <option value="">All Sources</option>
                <option value="ADVANCE">Admission</option>
                <option value="EMI">EMI</option>
                <option value="INVOICE">Invoice</option>
                <option value="DIRECT">Manual</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">Method</Form.Label>
              <Form.Select value={filters.paymentMethod} onChange={(e) => updateFilter('paymentMethod', e.target.value)}>
                <option value="">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DD">DD</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">From</Form.Label>
              <Form.Control type="date" value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">To</Form.Label>
              <Form.Control type="date" value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            {[
              ['Net Collected', totals.net, 'bi-wallet-fill', 'success'],
              ['Average Transaction', averagePayment, 'bi-percent', 'primary'],
              ['Discounts', totals.discount, 'bi-tags-fill', 'warning'],
              ['Fines', totals.fines, 'bi-exclamation-octagon-fill', 'danger'],
            ].map(([label, value, icon, variant]) => (
              <Col md={3} key={label}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div className={`rounded-circle bg-${variant}-subtle text-${variant} d-flex align-items-center justify-content-center`} style={{ width: 46, height: 46 }}>
                      <i className={`bi ${icon}`}></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">{currency(value)}</h5>
                      <span className="text-muted small fw-medium">{label}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Monthly Collections</h5>
                  <p className="text-muted small mb-0">Net amount by payment month.</p>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-end gap-2" style={{ height: 220 }}>
                    {monthlyStats.map((month) => (
                      <div key={month.label} className="flex-fill text-center">
                        <div className="bg-primary rounded-top mx-auto" style={{ height: `${Math.max((month.amount / maxMonthly) * 180, month.amount ? 8 : 2)}px`, width: '70%' }}></div>
                        <small className="text-muted">{month.label}</small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Collection Sources</h5>
                  <p className="text-muted small mb-0">Admission vs EMI vs manual.</p>
                </Card.Header>
                <Card.Body className="p-4">
                  {Object.entries(sourceStats).map(([label, amount]) => (
                    <div key={label} className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">{label}</span>
                        <span>{currency(amount)}</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div className="progress-bar" style={{ width: `${totals.net ? (amount / totals.net) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {!Object.keys(sourceStats).length && <div className="text-muted small">No source data found.</div>}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Payment Methods</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <tbody>
                      {Object.entries(methodStats).map(([method, amount]) => (
                        <tr key={method}>
                          <td className="px-4">{method}</td>
                          <td className="text-end px-4 fw-bold">{currency(amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Departments</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <tbody>
                      {Object.entries(departmentStats).map(([department, amount]) => (
                        <tr key={department}>
                          <td className="px-4">{department}</td>
                          <td className="text-end px-4 fw-bold">{currency(amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default PaymentAnalysis;
