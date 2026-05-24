import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Table } from 'react-bootstrap';
import api from '../../services/api';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [params, setParams] = useState({
    studentId: '', subjectId: '', fromDate: '', toDate: '', month: new Date().getMonth() + 1, year: new Date().getFullYear()
  });
  
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 100 } });
      setStudents(response.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/search', { params: { size: 100 } });
      setSubjects(response.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let queryParams = {};

      if (reportType === 'attendance') {
        endpoint = '/reports/attendance';
        queryParams = {
          studentId: params.studentId || undefined,
          subjectId: params.subjectId || undefined,
          fromDate: params.fromDate || undefined,
          toDate: params.toDate || undefined
        };
      } else if (reportType === 'fees') {
        endpoint = '/reports/fees/collection';
        queryParams = {
          fromDate: params.fromDate || undefined,
          toDate: params.toDate || undefined
        };
      } else if (reportType === 'payroll') {
        endpoint = '/reports/payroll/by-department';
        queryParams = {
          month: parseInt(params.month),
          year: parseInt(params.year)
        };
      } else if (reportType === 'library') {
        endpoint = '/reports/library/overdue';
        queryParams = {
          asOfDate: new Date().toISOString().split('T')[0]
        };
      }

      const response = await api.get(endpoint, { params: queryParams });
      setData(response.data);
    } catch (e) {
      console.error(e);
      setData(null);
    }
  };

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid">
      <h2 className="text-dark fw-bold mb-4">Reports & Analytics</h2>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Report Configuration</h5>
              <Form onSubmit={handleGenerate}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select value={reportType} onChange={e => { setReportType(e.target.value); setData(null); }}>
                    <option value="attendance">Student Attendance Report</option>
                    <option value="fees">Fee Collection Summary</option>
                    <option value="payroll">Payroll Expense by Department</option>
                    <option value="library">Library Overdue Books</option>
                  </Form.Select>
                </Form.Group>

                {reportType === 'attendance' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Student</Form.Label>
                      <Form.Select name="studentId" value={params.studentId} onChange={handleChange}>
                        <option value="">All Students</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Select name="subjectId" value={params.subjectId} onChange={handleChange}>
                        <option value="">All Subjects</option>
                        {subjects.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </>
                )}

                {reportType === 'payroll' && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Month</Form.Label>
                        <Form.Control type="number" min="1" max="12" name="month" value={params.month} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Year</Form.Label>
                        <Form.Control type="number" name="year" value={params.year} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {(reportType === 'attendance' || reportType === 'fees') && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>From Date</Form.Label>
                        <Form.Control type="date" name="fromDate" value={params.fromDate} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>To Date</Form.Label>
                        <Form.Control type="date" name="toDate" value={params.toDate} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Button variant="primary" type="submit" className="w-100 mt-2">
                  Generate Report
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-3">Report Output</h5>
              {!data && (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-file-earmark-bar-graph fs-1 d-block mb-2"></i>
                  Select criteria and click "Generate Report"
                </div>
              )}

              {data && reportType === 'attendance' && (
                <div>
                  <h6 className="fw-bold mb-3">Attendance Summary</h6>
                  <Table striped bordered hover responsive>
                    <tbody>
                      <tr>
                        <th>Total Attendance Count</th>
                        <td>{data.totalRecords || 0}</td>
                      </tr>
                      <tr>
                        <th>Present Count</th>
                        <td>{data.presentRecords || 0}</td>
                      </tr>
                      <tr>
                        <th>Absent Count</th>
                        <td>{data.absentRecords || 0}</td>
                      </tr>
                      <tr>
                        <th>Attendance Percentage</th>
                        <td className="fw-bold text-success">{data.attendancePercentage ? `${data.attendancePercentage}%` : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )}

              {data && reportType === 'fees' && (
                <div>
                  <h6 className="fw-bold mb-3">Fee Collection Report</h6>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Fee Payment Records</td>
                        <td>{data.totalPayments || 0}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Total Amount Collected</td>
                        <td className="fw-bold text-success">${data.totalAmountCollected || 0}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )}

              {data && reportType === 'payroll' && (
                <div>
                  <h6 className="fw-bold mb-3">Payroll Summary by Department</h6>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Salary Expense</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.departmentSalaries && Object.entries(data.departmentSalaries).map(([dept, amt]) => (
                        <tr key={dept}>
                          <td>{dept}</td>
                          <td>${amt}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="fw-bold">Total Salary Paid</td>
                        <td className="fw-bold text-danger">${data.totalPaid || 0}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )}

              {data && reportType === 'library' && (
                <div>
                  <h6 className="fw-bold mb-3">Overdue Books List</h6>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Book Title</th>
                        <th>Student Name</th>
                        <th>Due Date</th>
                        <th>Overdue Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.overdueBooks && data.overdueBooks.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.bookTitle}</td>
                          <td>{item.studentName}</td>
                          <td>{item.dueDate}</td>
                          <td className="text-danger fw-bold">{item.daysOverdue} days</td>
                        </tr>
                      ))}
                      {(!data.overdueBooks || data.overdueBooks.length === 0) && (
                        <tr><td colSpan="4" className="text-center text-muted">No overdue books!</td></tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
