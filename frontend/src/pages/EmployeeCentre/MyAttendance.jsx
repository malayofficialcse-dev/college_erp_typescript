import React, { useState, useEffect, useContext } from 'react';
import { Card, Badge, Button, Alert, Spinner, Row, Col, Modal, Form } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const statusColors = {
  PRESENT: '#10b981', ABSENT: '#ef4444', HALF_DAY: '#f59e0b',
  ON_LEAVE: '#6366f1', HOLIDAY: '#8b5cf6', WEEKEND: '#94a3b8'
};

const MyAttendance = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly'); // monthly, yearly, analytics

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [form, setForm] = useState({
    attendanceDate: today.toISOString().split('T')[0],
    checkIn: '09:00', checkOut: '18:00', status: 'PRESENT', remarks: ''
  });

  useEffect(() => { fetchData(); }, [viewYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const empRes = await api.get('/employees/search', { params: { keyword: user?.email, size: 1 } });
      const emp = empRes.data.content?.[0];
      setEmployee(emp);
      if (emp) {
        // Fetch large limit (1000) to get full year's data for yearly grid & charts
        const res = await api.get(`/hr/attendance/employee/${emp.id}`, { params: { size: 1000 } });
        setAttendance(res.data.content || res.data || []);
      }
    } catch { setError('Failed to load attendance records.'); }
    finally { setLoading(false); }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const getStatusForDate = (dateStr) => {
    const rec = attendance.find(a => a.attendanceDate === dateStr);
    return rec ? rec.status : null;
  };

  const getRecordForDate = (dateStr) => {
    return attendance.find(a => a.attendanceDate === dateStr) || null;
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/hr/attendance', { ...form, employee: { id: employee.id } });
      setSuccess('Attendance recorded successfully!');
      setShowModal(false);
      fetchData();
    } catch { setError('Failed to record attendance.'); }
    finally { setSubmitting(false); }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  // Filter attendance records by active year
  const yearRecords = attendance.filter(a => {
    if (!a.attendanceDate) return false;
    return new Date(a.attendanceDate).getFullYear() === viewYear;
  });

  // Calculate detailed stats including late arrivals and early departures
  const stats = yearRecords.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    // Late arrival definition: PRESENT and checkIn after 09:15
    if (a.status === 'PRESENT' && a.checkIn && a.checkIn > '09:15') {
      acc.LATE = (acc.LATE || 0) + 1;
    }
    // Early departure definition: PRESENT and checkOut before 17:00
    if (a.status === 'PRESENT' && a.checkOut && a.checkOut < '17:00') {
      acc.EARLY = (acc.EARLY || 0) + 1;
    }
    return acc;
  }, { PRESENT: 0, ABSENT: 0, HALF_DAY: 0, ON_LEAVE: 0, LATE: 0, EARLY: 0 });

  // Calculate month-by-month analysis data
  const monthlyData = MONTHS_SHORT.map((mName, idx) => {
    const monthRecs = yearRecords.filter(a => new Date(a.attendanceDate).getMonth() === idx);
    const pres = monthRecs.filter(a => a.status === 'PRESENT').length;
    const abs = monthRecs.filter(a => a.status === 'ABSENT').length;
    const hd = monthRecs.filter(a => a.status === 'HALF_DAY').length;
    const lv = monthRecs.filter(a => a.status === 'ON_LEAVE').length;
    const late = monthRecs.filter(a => a.status === 'PRESENT' && a.checkIn && a.checkIn > '09:15').length;
    const early = monthRecs.filter(a => a.status === 'PRESENT' && a.checkOut && a.checkOut < '17:00').length;
    return { name: mName, PRESENT: pres, ABSENT: abs, HALF_DAY: hd, ON_LEAVE: lv, LATE: late, EARLY: early };
  });

  return (
    <div className="container-fluid">
      {/* Upper Title Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h2 className="fw-bold text-dark mb-0">My Attendance</h2>
          <p className="text-muted mb-0 small">Manage your time tracking, view annual sheets, and analyze performance trends</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <Form.Select size="sm" className="rounded-pill px-3 py-1.5 shadow-sm bg-white border" style={{ width: 110 }}
            value={viewYear} onChange={e => setViewYear(parseInt(e.target.value))}>
            {[viewYear - 2, viewYear - 1, viewYear, viewYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </Form.Select>
          <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-check-fill me-2"></i>Mark Attendance
          </Button>
        </div>
      </div>

      {success && <Alert variant="success" className="border-0 shadow-sm rounded-3" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" className="border-0 shadow-sm rounded-3" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Tabs Menu */}
      <div className="d-flex border-bottom mb-4 gap-2">
        {[
          { id: 'monthly', label: 'Monthly Calendar', icon: 'bi-calendar3' },
          { id: 'yearly', label: 'Yearly Overview', icon: 'bi-grid-3x3-gap-fill' },
          { id: 'analytics', label: 'Analytics & Insights', icon: 'bi-bar-chart-line-fill' }
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn px-4 py-2 border-0 rounded-top-4 fw-semibold small transition-all d-flex align-items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-primary border-bottom border-2 border-primary fw-bold'
                : 'text-muted'
            }`}
            style={{ borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none' }}>
            <i className={`bi ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Summary Cards */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Present Days', val: stats.PRESENT, color: '#10b981', icon: 'bi-check-circle-fill' },
          { label: 'Absent Days', val: stats.ABSENT, color: '#ef4444', icon: 'bi-x-circle-fill' },
          { label: 'Half Days', val: stats.HALF_DAY, color: '#f59e0b', icon: 'bi-circle-half' },
          { label: 'On Leave', val: stats.ON_LEAVE, color: '#6366f1', icon: 'bi-calendar2-check' },
          { label: 'Late Arrivals', val: stats.LATE, color: '#ec4899', icon: 'bi-clock-history' },
          { label: 'Early Departures', val: stats.EARLY, color: '#14b8a6', icon: 'bi-box-arrow-right' }
        ].map(s => (
          <Col xs={6} md={4} lg={2} key={s.label}>
            <Card className="border-0 shadow-sm rounded-4 h-100 transition-all hover-translate-y">
              <Card.Body className="p-3 text-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{ width: 44, height: 44, background: s.color + '15' }}>
                  <i className={`bi ${s.icon} fs-5`} style={{ color: s.color }}></i>
                </div>
                <h4 className="fw-bold mb-0 text-dark">{s.val}</h4>
                <span className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>{s.label}</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <div className="text-muted small">Loading attendance database...</div>
        </div>
      ) : (
        <>
          {/* TAB 1: MONTHLY VIEW */}
          {activeTab === 'monthly' && (
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body className="p-4">
                {/* Navigation Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Button variant="light" className="rounded-circle border" style={{ width: 40, height: 40 }} onClick={prevMonth}>
                    <i className="bi bi-chevron-left"></i>
                  </Button>
                  <h4 className="fw-bold mb-0 text-dark">{MONTHS_FULL[viewMonth]} {viewYear}</h4>
                  <Button variant="light" className="rounded-circle border" style={{ width: 40, height: 40 }} onClick={nextMonth}>
                    <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>

                {/* Grid Headers */}
                <div className="row g-0 mb-3 text-center border-bottom pb-2">
                  {DAYS.map(d => (
                    <div key={d} className="col">
                      <span className="text-muted small fw-bold">{d.toUpperCase()}</span>
                    </div>
                  ))}
                </div>

                {/* Grid Cells */}
                <div className="row g-2">
                  {Array.from({ length: getFirstDayOfMonth(viewYear, viewMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} className="col" style={{ aspectRatio: '1.2' }}></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const rec = getRecordForDate(dateStr);
                    const isToday = dateStr === today.toISOString().split('T')[0];
                    const dow = new Date(viewYear, viewMonth, day).getDay();
                    const isWeekend = dow === 0 || dow === 6;

                    let bg = '#f8fafc';
                    let text = '#475569';
                    if (rec) {
                      bg = statusColors[rec.status] || '#cbd5e1';
                      text = '#fff';
                    } else if (isWeekend) {
                      bg = '#e2e8f0';
                      text = '#64748b';
                    }

                    return (
                      <div key={day} className="col" style={{ minWidth: '14.28%', maxWidth: '14.28%' }}>
                        <div className="rounded-4 p-2 d-flex flex-column justify-content-between h-100 transition-all hover-shadow"
                          style={{
                            aspectRatio: '1.2', background: bg, color: text,
                            border: isToday ? '2.5px solid #2563eb' : '1px solid transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (rec) {
                              alert(`Date: ${dateStr}\nStatus: ${rec.status}\nCheck-in: ${rec.checkIn || 'N/A'}\nCheck-out: ${rec.checkOut || 'N/A'}\nRemarks: ${rec.remarks || 'None'}`);
                            }
                          }}>
                          <span className="fw-bold small">{day}</span>
                          {rec ? (
                            <div className="d-flex flex-column align-items-start mt-auto">
                              <span className="fw-bold" style={{ fontSize: '0.62rem' }}>{rec.status}</span>
                              {rec.checkIn && <span className="opacity-90" style={{ fontSize: '0.55rem' }}><i className="bi bi-clock-fill me-0.5"></i>{rec.checkIn.substring(0, 5)}</span>}
                            </div>
                          ) : (
                            <span className="text-muted mt-auto" style={{ fontSize: '0.6rem' }}>{isWeekend ? 'Weekend' : 'No record'}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend bar */}
                <div className="d-flex flex-wrap gap-4 mt-4 pt-3 border-top justify-content-center">
                  {Object.entries(statusColors).map(([k, v]) => (
                    <div key={k} className="d-flex align-items-center gap-2">
                      <div className="rounded-circle" style={{ width: 14, height: 14, background: v }}></div>
                      <span className="text-muted small fw-medium">{k.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* TAB 2: YEARLY CALENDAR GRID */}
          {activeTab === 'yearly' && (
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Annual Attendance Grid — {viewYear}</h5>
                    <p className="text-muted small mb-0">Overview of all 12 months for visual analysis</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => setViewYear(y => y - 1)}>
                      <i className="bi bi-arrow-left me-1"></i>Previous Year
                    </Button>
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => setViewYear(y => y + 1)}>
                      Next Year<i className="bi bi-arrow-right ms-1"></i>
                    </Button>
                  </div>
                </div>

                <Row className="g-4">
                  {MONTHS_FULL.map((mName, mIdx) => {
                    const daysInM = getDaysInMonth(viewYear, mIdx);
                    const startDay = getFirstDayOfMonth(viewYear, mIdx);

                    return (
                      <Col xs={12} md={6} lg={4} xl={3} key={mName}>
                        <Card className="border shadow-none rounded-3 h-100">
                          <Card.Body className="p-3">
                            <h6 className="fw-bold text-dark mb-2 text-center">{mName}</h6>
                            <div className="row g-0 mb-1 text-center" style={{ fontSize: '0.62rem' }}>
                              {['S','M','T','W','T','F','S'].map((d, di) => (
                                <div key={di} className="col text-muted fw-bold">{d}</div>
                              ))}
                            </div>
                            <div className="row g-1 text-center">
                              {Array.from({ length: startDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="col" style={{ aspectRatio: '1' }}></div>
                              ))}
                              {Array.from({ length: daysInM }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${viewYear}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const status = getStatusForDate(dateStr);
                                const isWeekend = new Date(viewYear, mIdx, day).getDay() === 0 || new Date(viewYear, mIdx, day).getDay() === 6;

                                let dotBg = '#f1f5f9';
                                if (status) {
                                  dotBg = statusColors[status];
                                } else if (isWeekend) {
                                  dotBg = '#cbd5e1';
                                }

                                return (
                                  <div key={day} className="col" style={{ minWidth: '14.28%', maxWidth: '14.28%', aspectRatio: '1' }}>
                                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                      style={{
                                        width: '18px', height: '18px', background: dotBg,
                                        fontSize: '0.58rem', color: status || isWeekend ? '#fff' : '#64748b',
                                        cursor: 'pointer'
                                      }}
                                      title={status ? `${dateStr}: ${status}` : dateStr}>
                                      {day}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* TAB 3: ANALYTICS & INSIGHTS */}
          {activeTab === 'analytics' && (
            <Row className="g-4 mb-4">
              {/* Distribution Donut Chart */}
              <Col lg={5}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="fw-bold mb-0">Attendance Status Distribution</h5>
                  </Card.Header>
                  <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                    {/* SVG Donut Chart */}
                    {(() => {
                      const total = stats.PRESENT + stats.ABSENT + stats.HALF_DAY + stats.ON_LEAVE;
                      if (total === 0) {
                        return (
                          <div className="text-center py-5 text-muted">
                            <i className="bi bi-pie-chart fs-1 d-block mb-2"></i>No data to visualize yet.
                          </div>
                        );
                      }
                      const parts = [
                        { label: 'Present', val: stats.PRESENT, color: statusColors.PRESENT },
                        { label: 'Absent', val: stats.ABSENT, color: statusColors.ABSENT },
                        { label: 'Half Day', val: stats.HALF_DAY, color: statusColors.HALF_DAY },
                        { label: 'On Leave', val: stats.ON_LEAVE, color: statusColors.ON_LEAVE }
                      ].filter(p => p.val > 0);

                      let cum = 0;
                      return (
                        <div className="w-100 d-flex flex-column align-items-center">
                          <svg width="200" height="200" viewBox="0 0 42 42" className="mb-4">
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                            {parts.map((p, pi) => {
                              const pct = (p.val / total) * 100;
                              const offset = 100 - cum + 25;
                              cum += pct;
                              return (
                                <circle key={pi} cx="21" cy="21" r="15.915" fill="transparent"
                                  stroke={p.color} strokeWidth="4.2"
                                  strokeDasharray={`${pct} ${100 - pct}`}
                                  strokeDashoffset={offset}
                                  transform="rotate(-90 21 21)">
                                </circle>
                              );
                            })}
                            <g className="chart-text">
                              <text x="21" y="20.5" className="fw-bold" textAnchor="middle" fontSize="5" fill="#1e293b">{total}</text>
                              <text x="21" y="25" textAnchor="middle" fontSize="2.8" fill="#64748b" fontWeight="600">Total Days</text>
                            </g>
                          </svg>

                          <div className="w-100 border-top pt-3">
                            {parts.map(p => (
                              <div key={p.label} className="d-flex justify-content-between align-items-center py-1">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="rounded-circle" style={{ width: 12, height: 12, background: p.color }}></div>
                                  <span className="text-muted small fw-medium">{p.label}</span>
                                </div>
                                <span className="fw-bold text-dark small">{p.val} days ({((p.val/total)*100).toFixed(1)}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </Card.Body>
                </Card>
              </Col>

              {/* Presence Trend Area Chart */}
              <Col lg={7}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="fw-bold mb-0">Monthly Presence Curve</h5>
                  </Card.Header>
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    {/* SVG Area Chart */}
                    {(() => {
                      const maxPresent = Math.max(...monthlyData.map(d => d.PRESENT), 5);
                      const width = 500;
                      const height = 180;
                      const padding = 25;

                      // Generate points
                      const points = monthlyData.map((d, i) => {
                        const x = padding + (i * (width - padding * 2)) / 11;
                        const y = height - padding - (d.PRESENT * (height - padding * 2)) / maxPresent;
                        return { x, y, name: d.name, val: d.PRESENT };
                      });

                      const pathD = points.reduce((acc, p, i) => {
                        return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                      }, '');

                      const fillD = pathD + ` L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                      return (
                        <div className="w-100">
                          <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal Grid lines */}
                            {Array.from({ length: 4 }).map((_, gi) => {
                              const y = padding + (gi * (height - padding * 2)) / 3;
                              const val = Math.round(maxPresent - (gi * maxPresent) / 3);
                              return (
                                <g key={gi} opacity="0.15">
                                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" />
                                  <text x={padding - 5} y={y + 3} textAnchor="end" fontSize="9" fill="#1e293b" fontWeight="600">{val}</text>
                                </g>
                              );
                            })}

                            {/* Fill and Line path */}
                            <path d={fillD} fill="url(#areaGrad)" />
                            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Node points */}
                            {points.map((p, pi) => (
                              <g key={pi}>
                                <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                                <text x={p.x} y={height - 5} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">{p.name}</text>
                                {p.val > 0 && (
                                  <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="bold">{p.val}</text>
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

              {/* Monthly Stacked Bar Chart (Absence & Leaves) */}
              <Col lg={12}>
                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="fw-bold mb-0">Leaves & Absences Breakdown (Monthly)</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {/* SVG Stacked Bar Chart */}
                    {(() => {
                      const width = 800;
                      const height = 200;
                      const paddingLeft = 30;
                      const paddingRight = 10;
                      const paddingTop = 20;
                      const paddingBottom = 25;

                      // Find max sum of absent + leave + half day
                      const maxTotal = Math.max(...monthlyData.map(d => d.ABSENT + d.ON_LEAVE + d.HALF_DAY), 4);

                      const barWidth = 24;
                      const spacing = (width - paddingLeft - paddingRight) / 12;

                      return (
                        <div className="w-100">
                          <svg viewBox={`0 0 ${width} ${height}`} className="w-100 overflow-visible">
                            {/* Y axis helper grid lines */}
                            {Array.from({ length: 4 }).map((_, gi) => {
                              const y = paddingTop + (gi * (height - paddingTop - paddingBottom)) / 3;
                              const val = Math.round(maxTotal - (gi * maxTotal) / 3);
                              return (
                                <g key={gi} opacity="0.15">
                                  <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#64748b" strokeWidth="1" />
                                  <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#1e293b" fontWeight="600">{val}</text>
                                </g>
                              );
                            })}

                            {/* Draw Bars */}
                            {monthlyData.map((d, i) => {
                              const x = paddingLeft + (i * spacing) + (spacing - barWidth) / 2;

                              // Stack calculations
                              const hAbsent = (d.ABSENT * (height - paddingTop - paddingBottom)) / maxTotal;
                              const hLeave = (d.ON_LEAVE * (height - paddingTop - paddingBottom)) / maxTotal;
                              const hHalf = (d.HALF_DAY * (height - paddingTop - paddingBottom)) / maxTotal;

                              const yAbsent = height - paddingBottom - hAbsent;
                              const yLeave = yAbsent - hLeave;
                              const yHalf = yLeave - hHalf;

                              return (
                                <g key={i}>
                                  {/* Absent segment */}
                                  {d.ABSENT > 0 && (
                                    <rect x={x} y={yAbsent} width={barWidth} height={hAbsent} fill={statusColors.ABSENT} rx="2" />
                                  )}
                                  {/* Leave segment */}
                                  {d.ON_LEAVE > 0 && (
                                    <rect x={x} y={yLeave} width={barWidth} height={hLeave} fill={statusColors.ON_LEAVE} rx="2" />
                                  )}
                                  {/* Half Day segment */}
                                  {d.HALF_DAY > 0 && (
                                    <rect x={x} y={yHalf} width={barWidth} height={hHalf} fill={statusColors.HALF_DAY} rx="2" />
                                  )}

                                  {/* Label */}
                                  <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="600">{d.name}</text>

                                  {/* Value label on top */}
                                  {(d.ABSENT + d.ON_LEAVE + d.HALF_DAY) > 0 && (
                                    <text x={x + barWidth / 2} y={yHalf - 5} textAnchor="middle" fontSize="8.5" fill="#475569" fontWeight="bold">
                                      {d.ABSENT + d.ON_LEAVE + d.HALF_DAY}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                          </svg>

                          {/* Bar Chart Legend */}
                          <div className="d-flex justify-content-center gap-4 mt-3">
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 14, height: 14, background: statusColors.ABSENT, borderRadius: 3 }}></div>
                              <span className="text-muted small fw-medium">Absent</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 14, height: 14, background: statusColors.ON_LEAVE, borderRadius: 3 }}></div>
                              <span className="text-muted small fw-medium">On Leave</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 14, height: 14, background: statusColors.HALF_DAY, borderRadius: 3 }}></div>
                              <span className="text-muted small fw-medium">Half Day</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Mark Attendance Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fw-bold">Mark Attendance</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleMarkAttendance}>
          <Modal.Body className="px-4 py-4">
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Date</Form.Label>
                <Form.Control type="date" value={form.attendanceDate}
                  onChange={e => setForm(p => ({...p, attendanceDate: e.target.value}))} required className="rounded-3" />
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Check-In Time</Form.Label>
                <Form.Control type="time" value={form.checkIn}
                  onChange={e => setForm(p => ({...p, checkIn: e.target.value}))} className="rounded-3" />
              </Col>
              <Col md={6}>
                <Form.Label className="text-muted small fw-bold">Check-Out Time</Form.Label>
                <Form.Control type="time" value={form.checkOut}
                  onChange={e => setForm(p => ({...p, checkOut: e.target.value}))} className="rounded-3" />
              </Col>
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Status</Form.Label>
                <Form.Select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="rounded-3">
                  {['PRESENT','ABSENT','HALF_DAY','ON_LEAVE'].map(s => <option key={s}>{s}</option>)}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="text-muted small fw-bold">Remarks (optional)</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.remarks}
                  onChange={e => setForm(p => ({...p, remarks: e.target.value}))} className="rounded-3" placeholder="e.g. Work from home..." />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Mark Attendance'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MyAttendance;
