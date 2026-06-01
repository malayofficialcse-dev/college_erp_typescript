import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { asList, fetchMyEmployee } from '../../services/employeeSelfService';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatMoney = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }
  return currencyFormatter.format(Number(value));
};

const formatMonthYear = (record) => {
  const monthNumber = Number(record?.month ?? record?.payMonth ?? 1);
  const yearNumber = Number(record?.year ?? record?.payYear ?? CURRENT_YEAR);
  return `${MONTHS[Math.max(monthNumber - 1, 0)] || 'January'} ${yearNumber}`;
};

const sumValues = (...values) => values.reduce((total, value) => total + Number(value ?? 0), 0);

const getPayrollAmount = (record, keys, fallback = 0) => {
  const values = keys.map((key) => record?.[key]);
  const hasExplicitValue = values.some((value) => value !== undefined && value !== null);
  if (hasExplicitValue) {
    return sumValues(...values);
  }
  return Number(fallback ?? 0);
};

const sortPayrolls = (list) =>
  [...list].sort((left, right) => {
    const leftYear = Number(left?.year ?? left?.payYear ?? 0);
    const rightYear = Number(right?.year ?? right?.payYear ?? 0);
    if (leftYear !== rightYear) {
      return rightYear - leftYear;
    }

    const leftMonth = Number(left?.month ?? left?.payMonth ?? 0);
    const rightMonth = Number(right?.month ?? right?.payMonth ?? 0);
    return rightMonth - leftMonth;
  });

const StatCard = ({ title, value, subtitle, tone = 'primary' }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100">
    <Card.Body className="p-4">
      <div className={`text-${tone} fw-bold small text-uppercase mb-2`}>{title}</div>
      <div className="fs-3 fw-bold text-dark mb-1">{value}</div>
      <div className="text-muted small">{subtitle}</div>
    </Card.Body>
  </Card>
);

const MyPayslips = () => {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const loadPayslips = async (emp, preferredId = null) => {
    const response = await api.get('/payroll', {
      params: { employee: emp.id, size: 48 },
    });

    const list = sortPayrolls(asList(response.data));
    setPayslips(list);

    const nextSelected =
      (preferredId && list.find((item) => item.id === preferredId)) ||
      (selectedPayslip && list.find((item) => item.id === selectedPayslip.id)) ||
      list[0] ||
      null;

    setSelectedPayslip(nextSelected);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfo(null);

      const emp = await fetchMyEmployee(user);
      setEmployee(emp);

      if (emp) {
        await loadPayslips(emp);
      } else {
        setPayslips([]);
        setSelectedPayslip(null);
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to load your payslips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const selectedAllowances = getPayrollAmount(
    selectedPayslip,
    ['allowances'],
    sumValues(
      selectedPayslip?.hra,
      selectedPayslip?.da,
      selectedPayslip?.ta,
      selectedPayslip?.bonus,
      selectedPayslip?.otherAllowances
    )
  );

  const selectedDeductions = getPayrollAmount(
    selectedPayslip,
    ['deductions'],
    sumValues(
      selectedPayslip?.pfDeduction,
      selectedPayslip?.taxDeduction,
      selectedPayslip?.esiDeduction,
      selectedPayslip?.otherDeductions
    )
  );

  const stats = useMemo(() => {
    const totalGross = payslips.reduce((total, record) => {
      const gross = Number(
        record?.grossSalary ??
          Number(record?.basicSalary ?? 0) + getPayrollAmount(record, ['allowances'], 0)
      );
      return total + gross;
    }, 0);

    const totalNet = payslips.reduce((total, record) => total + Number(record?.netSalary ?? 0), 0);
    const totalDeductions = payslips.reduce((total, record) => {
      const deductions = Number(
        record?.deductions ??
          sumValues(record?.pfDeduction, record?.taxDeduction, record?.esiDeduction, record?.otherDeductions)
      );
      return total + deductions;
    }, 0);

    return {
      totalGross,
      totalNet,
      totalDeductions,
      total: payslips.length,
      paid: payslips.filter((record) => record?.status === 'PAID').length,
      unpaid: payslips.filter((record) => record?.status !== 'PAID').length,
    };
  }, [payslips]);

  const handleGeneratePayslip = async () => {
    if (!employee?.id) {
      setError('Employee profile not found. Please contact HR.');
      return;
    }

    if (!employee?.basicSalary || Number(employee.basicSalary) <= 0) {
      setError('Your basic salary is not configured yet. Please contact HR.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setInfo(null);

      const response = await api.post('/payroll/generate', {
        employee: employee.id,
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });

      const result = response.data;
      const payroll = result?.payroll || result;
      const created = Boolean(result?.created);

      setInfo(
        created
          ? `Payslip generated for ${MONTHS[selectedMonth - 1]} ${selectedYear}.`
          : `Payslip already existed for ${MONTHS[selectedMonth - 1]} ${selectedYear}; it has been loaded instead.`
      );

      await loadPayslips(employee, payroll?.id);
    } catch (generateError) {
      setError(generateError?.response?.data?.message || 'Unable to generate the selected payslip.');
    } finally {
      setGenerating(false);
    }
  };

  const renderEarningRow = (label, value, emphasis = false) => (
    <div key={label} className="d-flex justify-content-between py-2 border-bottom">
      <span className={`small ${emphasis ? 'fw-semibold text-dark' : 'text-muted'}`}>{label}</span>
      <span className={`small ${emphasis ? 'fw-bold text-dark' : 'fw-semibold'}`}>{formatMoney(value)}</span>
    </div>
  );

  const renderDeductionRow = (label, value) => (
    <div key={label} className="d-flex justify-content-between py-2 border-bottom">
      <span className="small text-muted">{label}</span>
      <span className="small fw-semibold text-danger">{formatMoney(value)}</span>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="mb-4 mt-2">
        <h2 className="fw-bold text-dark mb-1">My Payslips</h2>
        <p className="text-muted mb-0 small">
          Generate your monthly salary slips, review earnings and deductions, and print professional payslips anytime.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="border-0 shadow-sm rounded-4">
          {error}
        </Alert>
      )}

      {info && (
        <Alert variant="success" className="border-0 shadow-sm rounded-4">
          {info}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <Card.Body
              className="p-4 p-lg-5"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}
            >
              <Row className="align-items-center g-4">
                <Col lg={8}>
                  <div className="text-uppercase small fw-semibold mb-2 opacity-75">Employee Self Service</div>
                  <h3 className="fw-bold mb-2">Payslip generation hub</h3>
                  <p className="mb-0 text-white-50">
                    Select a month and year to generate a payslip, then open it in the table to review the breakdown or print it instantly.
                  </p>
                </Col>
                <Col lg={4}>
                  <div className="bg-white bg-opacity-10 rounded-4 p-4">
                    <div className="small text-white-50">Current base salary</div>
                    <div className="display-6 fw-bold mb-1">{formatMoney(employee?.basicSalary)}</div>
                    <div className="small text-white-50">
                      {employee?.designation || 'Employee'}
                      {employee?.employeeCode ? ` | ${employee.employeeCode}` : ''}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-4">
            <Col md={3}>
              <StatCard
                title="Generated Slips"
                value={stats.total}
                subtitle={`Gross total: ${formatMoney(stats.totalGross)}`}
                tone="primary"
              />
            </Col>
            <Col md={3}>
              <StatCard
                title="Paid"
                value={stats.paid}
                subtitle={`Pending slips: ${stats.unpaid}`}
                tone="success"
              />
            </Col>
            <Col md={3}>
              <StatCard
                title="Pending"
                value={stats.unpaid}
                subtitle={`Total deductions: ${formatMoney(stats.totalDeductions)}`}
                tone="warning"
              />
            </Col>
            <Col md={3}>
              <StatCard
                title="Net Salary"
                value={formatMoney(selectedPayslip?.netSalary ?? stats.totalNet)}
                subtitle="Selected slip or total net pay"
                tone="info"
              />
            </Col>
          </Row>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Label className="fw-semibold">Month</Form.Label>
                  <Form.Select
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(Number(event.target.value))}
                  >
                    {MONTHS.map((monthName, index) => (
                      <option key={monthName} value={index + 1}>
                        {monthName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label className="fw-semibold">Year</Form.Label>
                  <Form.Control
                    type="number"
                    min="2000"
                    max="2100"
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(Number(event.target.value))}
                  />
                </Col>
                <Col md={6} className="d-flex justify-content-md-end gap-2">
                  <Button
                    variant="outline-secondary"
                    className="px-4 rounded-pill"
                    onClick={fetchData}
                    disabled={loading || generating}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                  </Button>
                  <Button
                    variant="primary"
                    className="px-4 rounded-pill"
                    onClick={handleGeneratePayslip}
                    disabled={generating || !employee?.basicSalary}
                  >
                    {generating ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Generating
                      </>
                    ) : (
                      <>
                        <i className="bi bi-receipt me-2"></i>Generate Payslip
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-4">
            <Col lg={7}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="p-0">
                  <div className="d-flex justify-content-between align-items-center p-4 pb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Monthly Payslips</h5>
                      <p className="text-muted small mb-0">Click a row to inspect the full salary breakdown.</p>
                    </div>
                    <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                      {payslips.length} records
                    </Badge>
                  </div>

                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th className="px-4 py-3">Month &amp; Year</th>
                        <th>Basic</th>
                        <th>Gross</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                        <th className="text-end px-4">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.length > 0 ? (
                        payslips.map((record) => {
                          const rowGross =
                            record?.grossSalary ??
                            Number(record?.basicSalary ?? 0) + getPayrollAmount(record, ['allowances'], 0);
                          const rowDeductions =
                            record?.deductions ??
                            sumValues(
                              record?.pfDeduction,
                              record?.taxDeduction,
                              record?.esiDeduction,
                              record?.otherDeductions
                            );

                          return (
                            <tr
                              key={record.id}
                              className={selectedPayslip?.id === record.id ? 'table-primary' : ''}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setSelectedPayslip(record)}
                            >
                              <td className="px-4 fw-semibold">{formatMonthYear(record)}</td>
                              <td>{formatMoney(record?.basicSalary)}</td>
                              <td>{formatMoney(rowGross)}</td>
                              <td className="text-danger">{formatMoney(rowDeductions)}</td>
                              <td className="fw-bold text-success">{formatMoney(record?.netSalary)}</td>
                              <td>
                                <Badge
                                  bg={
                                    record?.status === 'PAID'
                                      ? 'success'
                                      : record?.status === 'CANCELLED'
                                        ? 'danger'
                                        : 'warning'
                                  }
                                  className="rounded-pill px-3"
                                >
                                  {record?.status || 'UNPAID'}
                                </Badge>
                              </td>
                              <td className="text-end px-4">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  className="rounded-pill px-3"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedPayslip(record);
                                  }}
                                >
                                  <i className="bi bi-eye me-1"></i>View
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            <i className="bi bi-receipt fs-2 d-block mb-2"></i>
                            No payslips generated yet. Use the generator above to create your first monthly slip.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 h-100 sticky-top" style={{ top: '1rem' }}>
                <Card.Body className="p-4">
                  {selectedPayslip ? (
                    <>
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <div className="text-muted small text-uppercase fw-semibold mb-1">Payslip Preview</div>
                          <h5 className="fw-bold mb-1">{formatMonthYear(selectedPayslip)}</h5>
                          <div className="text-muted small">
                            {employee?.firstName} {employee?.lastName}
                            {employee?.employeeCode ? ` | ${employee.employeeCode}` : ''}
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="rounded-pill"
                            onClick={() => window.print()}
                          >
                            <i className="bi bi-printer me-1"></i>Print
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 rounded-4 mb-3" style={{ background: '#f8fafc' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-success mb-0">Earnings</h6>
                          <Badge bg="success" className="rounded-pill px-3">
                            {formatMoney(selectedPayslip?.grossSalary ?? selectedPayslip?.basicSalary)}
                          </Badge>
                        </div>

                        {renderEarningRow('Basic Salary', selectedPayslip?.basicSalary)}
                        {renderEarningRow('HRA (House Rent Allowance)', selectedPayslip?.hra)}
                        {renderEarningRow('DA (Dearness Allowance)', selectedPayslip?.da)}
                        {renderEarningRow('TA (Travel Allowance)', selectedPayslip?.ta)}
                        {renderEarningRow('Other Allowances', selectedPayslip?.otherAllowances)}
                        {renderEarningRow('Bonus', selectedPayslip?.bonus)}
                        {renderEarningRow(
                          'Gross Total',
                          selectedPayslip?.grossSalary ??
                            Number(selectedPayslip?.basicSalary ?? 0) + selectedAllowances,
                          true
                        )}
                      </div>

                      <div className="p-3 rounded-4 mb-3" style={{ background: '#fff5f5' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-danger mb-0">Deductions</h6>
                          <Badge bg="danger" className="rounded-pill px-3">
                            {formatMoney(selectedDeductions)}
                          </Badge>
                        </div>

                        {renderDeductionRow('PF (Provident Fund)', selectedPayslip?.pfDeduction)}
                        {renderDeductionRow('Tax (TDS)', selectedPayslip?.taxDeduction)}
                        {renderDeductionRow('ESI', selectedPayslip?.esiDeduction)}
                        {renderDeductionRow('Other Deductions', selectedPayslip?.otherDeductions)}
                      </div>

                      <div
                        className="p-4 rounded-4 text-center text-white mb-3"
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                      >
                        <div className="small opacity-75 mb-1">Net Take-Home Pay</div>
                        <div className="fw-bold display-6 mb-2">{formatMoney(selectedPayslip?.netSalary)}</div>
                        <div className="small opacity-75">
                          {selectedPayslip?.status === 'PAID'
                            ? `Paid on ${
                                selectedPayslip.paidDate
                                  ? new Date(selectedPayslip.paidDate).toLocaleDateString('en-IN')
                                  : 'the payment date'
                              }`
                            : 'Ready to be processed or printed.'}
                        </div>
                      </div>

                      <Row className="g-3">
                        <Col md={6}>
                          <div className="border rounded-4 p-3 h-100">
                            <div className="text-muted small mb-1">Payroll Status</div>
                            <Badge
                              bg={
                                selectedPayslip?.status === 'PAID'
                                  ? 'success'
                                  : selectedPayslip?.status === 'CANCELLED'
                                    ? 'danger'
                                    : 'warning'
                              }
                              className="rounded-pill px-3 py-2"
                            >
                              {selectedPayslip?.status || 'UNPAID'}
                            </Badge>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="border rounded-4 p-3 h-100">
                            <div className="text-muted small mb-1">Transaction ID</div>
                            <div className="fw-semibold text-dark">{selectedPayslip?.transactionId || '-'}</div>
                          </div>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-file-earmark-text fs-1 d-block mb-3"></i>
                      <h5 className="fw-bold text-dark">No payslip selected</h5>
                      <p className="mb-0">
                        Select a row from the table to inspect the detailed salary breakdown.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default MyPayslips;
