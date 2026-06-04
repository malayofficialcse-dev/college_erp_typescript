import React, { useState, useEffect, useContext } from "react";
import { Card, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { AuthContext } from "../../../context/AuthContext";
import { fetchMyStudentProfile } from "../../../services/studentSelfService";
import api from "../../../services/api";

const MyGrades = () => {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
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

      const res = await api.get(`/student-portal/${studentProfile._id || studentProfile.id}/grades`);
      setGrades(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      setError("Failed to load grades.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-3">{error}</Alert>;
  }

  return (
    <div className="container-fluid py-3">
      <h2 className="fw-bold mb-4">My Grades</h2>
      
      {grades.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-award fs-1 d-block mb-3"></i>
            No exam results published yet.
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4">Subject</th>
                  <th>Exam Type</th>
                  <th>Semester</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th className="text-end px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade._id || grade.id}>
                    <td className="px-4 fw-medium">
                      {grade.subject?.name} <span className="text-muted small">({grade.subject?.code})</span>
                    </td>
                    <td>{grade.examType || grade.examSchedule?.examName}</td>
                    <td>Semester {grade.semesterNumber}</td>
                    <td>{grade.marksObtained} / {grade.maxMarks}</td>
                    <td><strong>{grade.grade || '—'}</strong></td>
                    <td className="text-end px-4">
                      <Badge bg={grade.resultStatus === 'PASS' ? 'success' : grade.resultStatus === 'FAIL' ? 'danger' : 'secondary'}>
                        {grade.resultStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MyGrades;
