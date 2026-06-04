import React, { useState, useEffect, useContext } from "react";
import { Card, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { AuthContext } from "../../../context/AuthContext";
import { fetchMyStudentProfile } from "../../../services/studentSelfService";
import api from "../../../services/api";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MyTimetable = () => {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [timetable, setTimetable] = useState([]);
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

      const res = await api.get(`/student-portal/${studentProfile._id || studentProfile.id}/timetable`);
      setTimetable(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      setError("Failed to load timetable.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <div className="container-fluid py-3">
      <h2 className="fw-bold mb-4">My Timetable</h2>

      {timetable.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>
            No timetable found for your section.
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive bordered className="mb-0 text-center align-middle" style={{ minWidth: '800px' }}>
              <thead className="bg-light">
                <tr>
                  <th className="py-3" style={{ width: '15%' }}>Time</th>
                  {daysOfWeek.map(day => <th key={day} className="py-3">{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {/* Find unique time slots and sort them */}
                {Array.from(new Set(timetable.map(t => `${t.startTime} - ${t.endTime}`)))
                  .sort()
                  .map(timeSlot => {
                    const [start, end] = timeSlot.split(" - ");
                    return (
                      <tr key={timeSlot}>
                        <td className="fw-bold text-muted bg-light">{timeSlot}</td>
                        {daysOfWeek.map(day => {
                          const classEntry = timetable.find(t => t.dayOfWeek === day && t.startTime === start && t.endTime === end);
                          return (
                            <td key={`${day}-${timeSlot}`} className={classEntry ? "bg-white" : "bg-light bg-opacity-50"}>
                              {classEntry ? (
                                <div>
                                  <div className="fw-bold text-primary mb-1">{classEntry.subject?.name}</div>
                                  <div className="small text-muted mb-1"><i className="bi bi-person me-1"></i>{classEntry.teacher?.firstName} {classEntry.teacher?.lastName}</div>
                                  <Badge bg="secondary" className="fw-normal">Room: {classEntry.classroom?.roomNumber}</Badge>
                                </div>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                          );
                        })}
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

export default MyTimetable;
