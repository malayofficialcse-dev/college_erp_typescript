import React, { useState, useEffect, useContext } from 'react';
import { Card, Table, Badge, Alert, Spinner, Row, Col, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { fetchMyEmployee, asList } from '../../services/employeeSelfService';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const MyPayslips = () => {
  const { user } = useContext(AuthContext);
  const [payslips, setPayslips] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const emp = await fetchMyEmployee(user);
      setEmployee(emp);
      if (emp) {
        const res = await api.get('/payroll', { params: { employee: emp.id, size: 24 } });
        setPayslips(asList(res.data));
      }
    } catch { setError('Failed to load payslip data.'); }
    finally { setLoading(false); }
  };

  const fmt = (val) => val != null ? `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <h2 className="fw-bold text-dark mb-0">My Payslips</h2>
        <p className="text-muted mb-0 small">View your monthly salary breakdown and download payslips</p>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <Row className="g-4">
          <Col lg={selected ? 5 : 12}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3">Month & Year</th>
                      <th>Gross Salary</th>
                      <th>Deductions</th>
                      <th>Net Pay</th>
                      <th>Status</th>
                      <th className="text-end px-4">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.length > 0 ? payslips.map(p => (
                      <tr key={p.id} className={selected?.id === p.id ? 'table-primary' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                        <td className="px-4 fw-semibold">{MONTHS[(p.payMonth || 1) - 1]} {p.payYear}</td>
                        <td>{fmt(p.grossSalary)}</td>
                        <td className="text-danger">{fmt((parseFloat(p.pfDeduction || 0) + parseFloat(p.taxDeduction || 0) + parseFloat(p.esiDeduction || 0) + parseFloat(p.otherDeductions || 0)).toFixed(2))}</td>
                        <td className="fw-bold text-success">{fmt(p.netSalary)}</td>
                        <td>
                          <Badge bg={p.status === 'PAID' ? 'success' : p.status === 'ON_HOLD' ? 'danger' : 'warning'} className="rounded-pill px-3">
                            {p.status}
                          </Badge>
                        </td>
                        <td className="text-end px-4">
                          <Button size="sm" variant="outline-primary" className="rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>
                            <i className="bi bi-eye me-1"></i>View
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-receipt fs-2 d-block mb-2"></i>No payslips generated yet.
                      </td></tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {selected && (
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h5 className="fw-bold mb-1">Payslip — {MONTHS[(selected.payMonth||1)-1]} {selected.payYear}</h5>
                      <p className="text-muted small mb-0">{employee?.firstName} {employee?.lastName} · {employee?.employeeCode}</p>
                    </div>
                    <Button size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => window.print()}>
                      <i className="bi bi-printer me-1"></i>Print
                    </Button>
                  </div>

                  <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc' }}>
                    <h6 className="fw-bold text-success mb-3"><i className="bi bi-plus-circle me-2"></i>Earnings</h6>
                    {[
                      { label: 'Basic Salary', val: selected.basicSalary },
                      { label: 'HRA (House Rent Allowance)', val: selected.hra },
                      { label: 'DA (Dearness Allowance)', val: selected.da },
                      { label: 'TA (Travel Allowance)', val: selected.ta },
                      { label: 'Other Allowances', val: selected.otherAllowances },
                      { label: 'Bonus', val: selected.bonus },
                    ].map(row => (
                      <div key={row.label} className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted small">{row.label}</span>
                        <span className="fw-semibold small">{fmt(row.val)}</span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between pt-2">
                      <span className="fw-bold text-success">Gross Total</span>
                      <span className="fw-bold text-success fs-5">{fmt(selected.grossSalary)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-3 mb-3" style={{ background: '#fff5f5' }}>
                    <h6 className="fw-bold text-danger mb-3"><i className="bi bi-dash-circle me-2"></i>Deductions</h6>
                    {[
                      { label: 'PF (Provident Fund)', val: selected.pfDeduction },
                      { label: 'Tax (TDS)', val: selected.taxDeduction },
                      { label: 'ESI', val: selected.esiDeduction },
                      { label: 'Other Deductions', val: selected.otherDeductions },
                    ].map(row => (
                      <div key={row.label} className="d-flex justify-content-between py-1 border-bottom">
                        <span className="text-muted small">{row.label}</span>
                        <span className="fw-semibold small text-danger">{fmt(row.val)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-4 text-center" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' }}>
                    <div className="small opacity-75 mb-1">Net Take-Home Pay</div>
                    <div className="fw-bold fs-3">{fmt(selected.netSalary)}</div>
                    {selected.paymentDate && <div className="small opacity-75 mt-1">Paid on: {selected.paymentDate}</div>}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default MyPayslips;
