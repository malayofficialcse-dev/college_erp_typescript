import React, { useState, useEffect, useContext } from "react";
import { Card, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { fetchMyStudentProfile } from "../../services/studentSelfService";
import api from "../../services/api";
import StudentPortalHeader from "../../components/StudentPortalHeader";

const MyExamSchedule = () => {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [schedules, setSchedules] = useState([]);
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

      const res = await api.get(`/student-portal/${studentProfile._id || studentProfile.id}/exam-schedule`);
      setSchedules(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      setError("Failed to load exam schedules.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <div className="container-fluid py-3">
      <h2 className="fw-bold mb-4">My Exam Schedule</h2>
      <StudentPortalHeader student={student} />

      {schedules.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-calendar-event fs-1 d-block mb-3"></i>
            No upcoming exams scheduled for your course.
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4">Exam Name</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th className="text-end px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const examDate = new Date(schedule.examDate);
                  const isPast = examDate < new Date();
                  
                  return (
                    <tr key={schedule._id || schedule.id}>
                          <td className="px-4 fw-bold">{schedule.examName}</td>
                          <td>
                            {(
                              schedule.subject?.subjectName ||
                              schedule.subject?.name ||
                              schedule.subject?.subject ||
                              schedule.subject?.subjectCode ||
                              schedule.subject?.code
                            ) || 'N/A'}
                            <span className="text-muted small">({schedule.subject?.subjectCode || schedule.subject?.code || ''})</span>
                          </td>
                      <td>{examDate.toLocaleDateString()}</td>
                      <td>{schedule.startTime} - {schedule.endTime}</td>
                      <td>{schedule.classroom?.roomNumber || schedule.roomNumber || '—'}</td>
                      <td className="text-end px-4">
                        <Badge bg={isPast ? 'secondary' : 'primary'}>
                          {isPast ? 'COMPLETED' : 'UPCOMING'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MyExamSchedule;
