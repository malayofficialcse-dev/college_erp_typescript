import React, { useState, useEffect, useContext } from "react";
import { Card, Table, Spinner, Alert, Badge, Row, Col, ProgressBar } from "react-bootstrap";
import { AuthContext } from "../../../context/AuthContext";
import { fetchMyStudentProfile } from "../../../services/studentSelfService";
import api from "../../../services/api";

const MyAttendance = () => {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentProfile = await fetchMyStudentProfile(user);
      if (!studentProfile) {
        setError("No student profile linked to your account.");
        setLoading(false);
        return;
      }
      setStudent(studentProfile);

      const res = await api.get(`/student-portal/${studentProfile._id || studentProfile.id}/attendance`);
      setAttendance(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (attendance.length === 0) return { present: 0, absent: 0, late: 0, total: 0, percentage: 0 };
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    // Let's count present + late as attended for percentage purposes
    const percentage = Math.round(((present + late) / total) * 100);
    return { present, absent, late, total, percentage };
  };

  const stats = calculateStats();

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <div className="container-fluid py-3">
      <h2 className="fw-bold mb-4">My Attendance</h2>

      <Row className="g-4 mb-4">
        <Col md={12} lg={4}>
          <Card className="border-0 shadow-sm h-100 bg-primary text-white text-center">
            <Card.Body className="d-flex flex-column justify-content-center">
              <h1 className="display-4 fw-bold mb-0">{stats.percentage}%</h1>
              <p className="mb-0 opacity-75">Overall Attendance</p>
              <ProgressBar 
                now={stats.percentage} 
                variant={stats.percentage >= 75 ? "success" : stats.percentage >= 60 ? "warning" : "danger"} 
                className="mt-3 bg-white bg-opacity-25" 
                style={{ height: '8px' }} 
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Row className="text-center h-100 align-items-center">
                <Col>
                  <h3 className="text-success fw-bold">{stats.present}</h3>
                  <span className="text-muted small">Present</span>
                </Col>
                <Col>
                  <h3 className="text-danger fw-bold">{stats.absent}</h3>
                  <span className="text-muted small">Absent</span>
                </Col>
                <Col>
                  <h3 className="text-warning fw-bold">{stats.late}</h3>
                  <span className="text-muted small">Late</span>
                </Col>
                <Col>
                  <h3 className="text-primary fw-bold">{stats.total}</h3>
                  <span className="text-muted small">Total Classes</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold">Recent Records</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Date</th>
                <th>Subject</th>
                <th>Status</th>
                <th className="text-end px-4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No attendance records found.</td></tr>
              ) : attendance.map((record) => (
                <tr key={record._id || record.id}>
                  <td className="px-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="fw-medium">{record.subject?.name} <span className="text-muted small">({record.subject?.code})</span></td>
                  <td>
                    <Badge bg={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : record.status === 'LATE' ? 'warning' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4 text-muted small">{record.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MyAttendance;
