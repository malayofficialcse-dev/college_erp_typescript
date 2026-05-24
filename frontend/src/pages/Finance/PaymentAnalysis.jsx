import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';

const PaymentAnalysis = () => {
  const [payments, setPayments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    departmentId: '',
    paymentMethod: '',
    paymentType: '' // INITIAL or EMI
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch payments
      const payRes = await api.get('/fees/search', { params: { size: 1000 } });
      const pays = payRes.data.content || payRes.data || [];
      setPayments(pays);

      // Fetch departments
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data.content || deptRes.data || []);
    } catch {
      setError('Failed to fetch payment data for analysis.');
    } finally {
      setLoading(false);
    }
  };

  const parsePaymentType = (remarksStr) => {
    if (!remarksStr) return 'INITIAL';
    if (remarksStr.includes('[Type: EMI]')) return 'EMI';
    if (remarksStr.includes('[Type: INITIAL]')) return 'INITIAL';
    return 'INITIAL';
  };

  // Apply frontend filters for analysis calculations
  const filteredPayments = payments.filter(p => {
    // Date from
    if (filters.dateFrom && p.paymentDate < filters.dateFrom) return false;
    // Date to
    if (filters.dateTo && p.paymentDate > filters.dateTo) return false;
    // Department
    if (filters.departmentId && p.student?.department?.id !== parseInt(filters.departmentId)) return false;
    // Payment method
    if (filters.paymentMethod && p.paymentMethod !== filters.paymentMethod) return false;
    // Payment type (INITIAL/EMI)
    if (filters.paymentType && parsePaymentType(p.remarks) !== filters.paymentType) return false;

    return true;
  });

  // Calculate metrics
  const totalCollected = filteredPayments.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const baseCollected = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDiscounts = filteredPayments.reduce((sum, p) => sum + (p.discountAmount || 0), 0);
  const totalFines = filteredPayments.reduce((sum, p) => sum + (p.fineAmount || 0), 0);
  const averagePayment = filteredPayments.length > 0 ? (totalCollected / filteredPayments.length) : 0;

  // Calculate payment method breakdown
  const methodStats = filteredPayments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.netAmount;
    return acc;
  }, {});

  // Calculate department breakdown
  const deptStats = filteredPayments.reduce((acc, p) => {
    const dName = p.student?.department?.name || 'Unknown';
    acc[dName] = (acc[dName] || 0) + p.netAmount;
    return acc;
  }, {});

  // Calculate month breakdown (Jan-Dec) for current selected date ranges
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyStats = MONTHS_SHORT.map((mName, idx) => {
    const monthPays = filteredPayments.filter(p => new Date(p.paymentDate).getMonth() === idx);
    const sum = monthPays.reduce((acc, curr) => acc + curr.netAmount, 0);
    return { name: mName, amount: sum };
  });

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <h2 className="text-dark fw-bold mb-0">Payment Analysis</h2>
        <p className="text-muted mb-0 small">Overview and financial analytics of tuition & other fees collections</p>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      {/* Interactive Filters Panel */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3 bg-light rounded-4">
          <Row className="g-3">
            <Col md={2.5}>
              <Form.Label className="text-muted small fw-bold">Department</Form.Label>
              <Form.Select value={filters.departmentId} onChange={e => setFilters({...filters, departmentId: e.target.value})} className="rounded-3">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="text-muted small fw-bold">Method</Form.Label>
              <Form.Select value={filters.paymentMethod} onChange={e => setFilters({...filters, paymentMethod: e.target.value})} className="rounded-3">
                <option value="">All Methods</option>
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="DD">DEMAND DRAFT</option>
              </Form.Select>
            </Col>
            <Col md={2.5}>
              <Form.Label className="text-muted small fw-bold">Category</Form.Label>
              <Form.Select value={filters.paymentType} onChange={e => setFilters({...filters, paymentType: e.target.value})} className="rounded-3">
                <option value="">All Categories</option>
                <option value="INITIAL">Initial / Enrollment</option>
                <option value="EMI">EMI / Installment</option>
              </Form.Select>
            </Col>
            <Col md={2.5}>
              <Form.Label className="text-muted small fw-bold">Start Date</Form.Label>
              <Form.Control type="date" value={filters.dateFrom}
                onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="rounded-3" />
            </Col>
            <Col md={2.5}>
              <Form.Label className="text-muted small fw-bold">End Date</Form.Label>
              <Form.Control type="date" value={filters.dateTo}
                onChange={e => setFilters({...filters, dateTo: e.target.value})} className="rounded-3" />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
        <>
          {/* KPI Dashboard Cards */}
          <Row className="g-3 mb-4">
            {[
              { label: 'Net Collected', val: `$${totalCollected.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: '#10b981', icon: 'bi-wallet-fill' },
              { label: 'Average Transaction', val: `$${averagePayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: '#3b82f6', icon: 'bi-percent' },
              { label: 'Discount Incentives', val: `$${totalDiscounts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: '#f59e0b', icon: 'bi-tags-fill' },
              { label: 'Late Fines Collected', val: `$${totalFines.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, color: '#ef4444', icon: 'bi-exclamation-octagon-fill' }
            ].map(kpi => (
              <Col md={3} key={kpi.label}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Body className="p-3 d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 46, height: 46, background: kpi.color + '18' }}>
                      <i className={`bi ${kpi.icon} fs-5`} style={{ color: kpi.color }}></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0 text-dark">{kpi.val}</h5>
                      <span className="text-muted small fw-medium">{kpi.label}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* SVG Graphs and Diagrams */}
          <Row className="g-4 mb-4">
            {/* Monthly Trend Area Chart */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Collections Over Time</h5>
                  <p className="text-muted small mb-0">Monthly cash flow trends for active semester</p>
                </Card.Header>
                <Card.Body className="p-4">
                  {(() => {
                    const maxAmount = Math.max(...monthlyStats.map(d => d.amount), 100);
                    const width = 600;
                    const height = 200;
                    const padding = 30;

                    const points = monthlyStats.map((d, i) => {
                      const x = padding + (i * (width - padding * 2)) / 11;
                      const y = height - padding - (d.amount * (height - padding * 2)) / maxAmount;
                      return { x, y, name: d.name, val: d.amount };
                    });

                    const pathD = points.reduce((acc, p, i) => {
                      return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                    }, '');

                    const fillD = pathD + ` L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                    return (
                      <div className="w-100">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
                          <defs>
                            <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {Array.from({ length: 4 }).map((_, gi) => {
                            const y = padding + (gi * (height - padding * 2)) / 3;
                            const val = Math.round(maxAmount - (gi * maxAmount) / 3);
                            return (
                              <g key={gi} opacity="0.1">
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="9" fill="#1e293b" fontWeight="600">${val}</text>
                              </g>
                            );
                          })}

                          <path d={fillD} fill="url(#payGrad)" />
                          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />

                          {points.map((p, pi) => (
                            <g key={pi}>
                              <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                              <text x={p.x} y={height - 5} textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="600">{p.name}</text>
                              {p.val > 0 && (
                                <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="bold">${Math.round(p.val)}</text>
                              )}
                            </g>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}
                </Card.Body>
              </Card>
            </Col>

            {/* Payment Method Distribution Pie Chart */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Channels Used</h5>
                  <p className="text-muted small mb-0">Fee payment method statistics</p>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                  {(() => {
                    const methodColors = { CASH: '#10b981', BANK_TRANSFER: '#3b82f6', UPI: '#06b6d4', CHEQUE: '#f59e0b', DD: '#64748b' };
                    const parts = Object.entries(methodStats).map(([k, v]) => ({
                      label: k, val: v, color: methodColors[k] || '#888888'
                    })).filter(p => p.val > 0);

                    if (parts.length === 0) {
                      return <div className="text-muted small">No payment methods to display.</div>;
                    }

                    let cum = 0;
                    return (
                      <div className="w-100 d-flex flex-column align-items-center">
                        <svg width="150" height="150" viewBox="0 0 42 42" className="mb-4">
                          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                          {parts.map((p, pi) => {
                            const pct = (p.val / totalCollected) * 100;
                            const offset = 100 - cum + 25;
                            cum += pct;
                            return (
                              <circle key={pi} cx="21" cy="21" r="15.915" fill="transparent"
                                stroke={p.color} strokeWidth="4.8"
                                strokeDasharray={`${pct} ${100 - pct}`}
                                strokeDashoffset={offset}
                                transform="rotate(-90 21 21)"
                              />
                            );
                          })}
                          <g>
                            <text x="21" y="21.5" className="fw-bold" textAnchor="middle" fontSize="4.5" fill="#1e293b">
                              ${Math.round(totalCollected)}
                            </text>
                          </g>
                        </svg>

                        <div className="w-100 pt-2 border-top">
                          {parts.map(p => (
                            <div key={p.label} className="d-flex justify-content-between align-items-center py-1">
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded-circle" style={{ width: 10, height: 10, background: p.color }}></div>
                                <span className="text-muted small fw-medium">{p.label}</span>
                              </div>
                              <span className="fw-bold text-dark small">${p.val.toLocaleString()} ({((p.val/totalCollected)*100).toFixed(0)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </Card.Body>
              </Card>
            </Col>

            {/* Department wise collection Bar Chart */}
            <Col lg={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0">Collections by Academic Departments</h5>
                  <p className="text-muted small mb-0">Total revenue generated by student enrollments in each department</p>
                </Card.Header>
                <Card.Body className="p-4">
                  {(() => {
                    const depts = Object.entries(deptStats);
                    if (depts.length === 0) {
                      return <div className="text-center py-5 text-muted">No department collections found.</div>;
                    }

                    const maxDeptAmount = Math.max(...depts.map(d => d[1]), 100);
                    const width = 800;
                    const height = 200;
                    const paddingLeft = 40;
                    const paddingRight = 20;
                    const paddingTop = 20;
                    const paddingBottom = 30;

                    const barWidth = 35;
                    const spacing = (width - paddingLeft - paddingRight) / depts.length;

                    return (
                      <div className="w-100">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
                          {/* Y Axis Grid Lines */}
                          {Array.from({ length: 4 }).map((_, gi) => {
                            const y = paddingTop + (gi * (height - paddingTop - paddingBottom)) / 3;
                            const val = Math.round(maxDeptAmount - (gi * maxDeptAmount) / 3);
                            return (
                              <g key={gi} opacity="0.1">
                                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#64748b" strokeWidth="1" />
                                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fontSize="9.5" fill="#1e293b" fontWeight="600">${val}</text>
                              </g>
                            );
                          })}

                          {depts.map((d, i) => {
                            const dName = d[0];
                            const dVal = d[1];
                            const x = paddingLeft + (i * spacing) + (spacing - barWidth) / 2;
                            const h = (dVal * (height - paddingTop - paddingBottom)) / maxDeptAmount;
                            const y = height - paddingBottom - h;

                            return (
                              <g key={i}>
                                <rect x={x} y={y} width={barWidth} height={h} fill="#4318FF" rx="3" />
                                <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                                  {dName}
                                </text>
                                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="9" fill="#4318FF" fontWeight="bold">
                                  ${dVal.toLocaleString()}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}
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
