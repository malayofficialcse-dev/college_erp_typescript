import React, { useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Mock data for analytics
  const enrollments = [
    { label: '2021', val: 780 },
    { label: '2022', val: 920 },
    { label: '2023', val: 1050 },
    { label: '2024', val: 1120 },
    { label: '2025', val: 1190 },
    { label: '2026', val: 1245 }
  ];

  const financialData = [
    { month: 'Jan', collected: 45, pending: 15 },
    { month: 'Feb', collected: 52, pending: 10 },
    { month: 'Mar', collected: 60, pending: 8 },
    { month: 'Apr', collected: 48, pending: 22 },
    { month: 'May', collected: 65, pending: 12 },
    { month: 'Jun', collected: 70, pending: 5 }
  ];

  const employeeTypes = [
    { type: 'Teaching Staff', count: 68, color: '#4318FF' }, // Primary Indigo
    { type: 'Non-Teaching', count: 38, color: '#01B574' }, // Success Emerald
    { type: 'Administration', count: 22, color: '#FFB547' } // Warning Yellow
  ];

  const totalEmployees = employeeTypes.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="container-fluid px-0">
      <div className="mb-4 mt-2">
        <h2 className="text-dark fw-bold mb-1">Dashboard Overview</h2>
        <p className="text-muted small mb-0">Welcome back, <strong>{user?.username}</strong>! Here is an overview of the College ERP system.</p>
      </div>

      {/* Overview Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <Card className="bg-primary text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Total Students</h6>
                  <h2 className="mb-0 fw-bold">1,245</h2>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-people fs-4"></i>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
              <small className="text-white-50">View Details</small>
              <small className="text-white"><i className="bi bi-arrow-right"></i></small>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="bg-success text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Active Courses</h6>
                  <h2 className="mb-0 fw-bold">42</h2>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-book fs-4"></i>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
              <small className="text-white-50">View Details</small>
              <small className="text-white"><i className="bi bi-arrow-right"></i></small>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="bg-warning text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Employees</h6>
                  <h2 className="mb-0 fw-bold">128</h2>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-person-badge fs-4"></i>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
              <small className="text-white-50">View Details</small>
              <small className="text-white"><i className="bi bi-arrow-right"></i></small>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="bg-danger text-white h-100 shadow-sm border-0 transition-all hover-translate-y">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>Pending Fees</h6>
                  <h2 className="mb-0 fw-bold">$45K</h2>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <i className="bi bi-cash-stack fs-4"></i>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 d-flex align-items-center justify-content-between pb-3">
              <small className="text-white-50">View Details</small>
              <small className="text-white"><i className="bi bi-arrow-right"></i></small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Analytics Charts Row */}
      <Row className="g-4 mb-4">
        {/* Student Enrollment Growth Area Chart */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold text-dark mb-0">Student Enrollment Trend</h5>
              <p className="text-muted small mb-0">Annual enrollment expansion curve (2021 - 2026)</p>
            </Card.Header>
            <Card.Body className="p-4 d-flex align-items-center justify-content-center">
              {(() => {
                const maxVal = 1400;
                const width = 500;
                const height = 200;
                const padding = 30;

                const points = enrollments.map((d, i) => {
                  const x = padding + (i * (width - padding * 2)) / 5;
                  const y = height - padding - (d.val * (height - padding * 2)) / maxVal;
                  return { x, y, label: d.label, val: d.val };
                });

                const pathD = points.reduce((acc, p, i) => {
                  return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                }, '');

                const fillD = pathD + ` L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                return (
                  <div className="w-100">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
                      <defs>
                        <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4318FF" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#4318FF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Helper lines */}
                      {Array.from({ length: 4 }).map((_, gi) => {
                        const y = padding + (gi * (height - padding * 2)) / 3;
                        const val = Math.round(maxVal - (gi * maxVal) / 3);
                        return (
                          <g key={gi} opacity="0.1">
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                            <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="9" fill="#1e293b" fontWeight="600">{val}</text>
                          </g>
                        );
                      })}

                      <path d={fillD} fill="url(#enrollGrad)" />
                      <path d={pathD} fill="none" stroke="#4318FF" strokeWidth="3" />

                      {points.map((p, pi) => (
                        <g key={pi}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#4318FF" strokeWidth="2.5" />
                          <text x={p.x} y={height - 5} textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="600">{p.label}</text>
                          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="#4318FF" fontWeight="700">{p.val}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>

        {/* Employee Category Pie Chart */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold text-dark mb-0">Staff Distribution</h5>
              <p className="text-muted small mb-0">Role categorization dashboard</p>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
              {(() => {
                let cum = 0;
                return (
                  <div className="w-100 d-flex flex-column align-items-center">
                    <svg width="150" height="150" viewBox="0 0 42 42" className="mb-4">
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                      {employeeTypes.map((p, pi) => {
                        const pct = (p.count / totalEmployees) * 100;
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
                        <text x="21" y="20.5" className="fw-bold" textAnchor="middle" fontSize="5" fill="#1e293b">{totalEmployees}</text>
                        <text x="21" y="24.5" textAnchor="middle" fontSize="2.8" fill="#64748b" fontWeight="600">Total Staff</text>
                      </g>
                    </svg>

                    <div className="w-100 pt-2 border-top">
                      {employeeTypes.map(p => (
                        <div key={p.type} className="d-flex justify-content-between align-items-center py-1">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle" style={{ width: 10, height: 10, background: p.color }}></div>
                            <span className="text-muted small fw-medium">{p.type}</span>
                          </div>
                          <span className="fw-bold text-dark small">{p.count} ({((p.count/totalEmployees)*100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>

        {/* Monthly Fee Collections Bar Chart */}
        <Col lg={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold text-dark mb-0">Fee Cash Flow Dynamics</h5>
              <p className="text-muted small mb-0">Comparison of monthly Collected vs Pending fees in thousands (k)</p>
            </Card.Header>
            <Card.Body className="p-4">
              {(() => {
                const width = 800;
                const height = 180;
                const paddingLeft = 35;
                const paddingRight = 15;
                const paddingTop = 15;
                const paddingBottom = 25;

                const maxTotal = 90;
                const barWidth = 20;
                const spacing = (width - paddingLeft - paddingRight) / 6;

                return (
                  <div className="w-100">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
                      {/* Grid helper lines */}
                      {Array.from({ length: 4 }).map((_, gi) => {
                        const y = paddingTop + (gi * (height - paddingTop - paddingBottom)) / 3;
                        const val = Math.round(maxTotal - (gi * maxTotal) / 3);
                        return (
                          <g key={gi} opacity="0.1">
                            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#64748b" strokeWidth="1" />
                            <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fontSize="9.5" fill="#1e293b" fontWeight="600">${val}k</text>
                          </g>
                        );
                      })}

                      {/* Draw grouped bars */}
                      {financialData.map((d, i) => {
                        const x = paddingLeft + (i * spacing) + (spacing - (barWidth * 2 + 6)) / 2;

                        const hCol = (d.collected * (height - paddingTop - paddingBottom)) / maxTotal;
                        const hPend = (d.pending * (height - paddingTop - paddingBottom)) / maxTotal;

                        const yCol = height - paddingBottom - hCol;
                        const yPend = height - paddingBottom - hPend;

                        return (
                          <g key={i}>
                            {/* Collected (Green/Emerald) */}
                            <rect x={x} y={yCol} width={barWidth} height={hCol} fill="#01B574" rx="2" />
                            {/* Pending (Coral/Red) */}
                            <rect x={x + barWidth + 6} y={yPend} width={barWidth} height={hPend} fill="#EE5D50" rx="2" />

                            <text x={x + barWidth + 3} y={height - 8} textAnchor="middle" fontSize="9.5" fill="#64748b" fontWeight="600">{d.month}</text>

                            {/* Value labels */}
                            <text x={x + barWidth/2} y={yCol - 4} textAnchor="middle" fontSize="8" fill="#01B574" fontWeight="bold">${d.collected}k</text>
                            <text x={x + barWidth + 6 + barWidth/2} y={yPend - 4} textAnchor="middle" fontSize="8" fill="#EE5D50" fontWeight="bold">${d.pending}k</text>
                          </g>
                        );
                      })}
                    </svg>

                    <div className="d-flex justify-content-center gap-4 mt-3">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 12, height: 12, background: '#01B574', borderRadius: 2 }}></div>
                        <span className="text-muted small fw-medium">Collected Fees</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 12, height: 12, background: '#EE5D50', borderRadius: 2 }}></div>
                        <span className="text-muted small fw-medium">Pending Fees</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
