import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, Badge, Dropdown, Card } from "react-bootstrap";
import api from "../../services/api";

const Timetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTimetable, setCurrentTimetable] = useState(null);

  // Advanced Filters State
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roomKeyword, setRoomKeyword] = useState("");
  const [startTimeFrom, setStartTimeFrom] = useState("");
  const [endTimeTo, setEndTimeTo] = useState("");



  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  useEffect(() => {
    fetchTimetables();
    fetchCourses();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const normalizeTimetable = (timetable) => ({
    ...timetable,
    courseId: timetable.course?.id || timetable.courseId || "",
    courseName: timetable.course?.name || timetable.courseName || "",
    subjectId: timetable.subject?.id || timetable.subjectId || "",
    subjectName: timetable.subject?.subjectName || timetable.subject?.name || timetable.subjectName || timetable.subject || "",
    teacherId: timetable.teacher?.id || timetable.teacherId || "",
    teacherName: timetable.teacher
      ? `${timetable.teacher.firstName || ""} ${timetable.teacher.lastName || ""}`.trim()
      : timetable.teacherName || "",
    room: timetable.classroom?.roomNumber || timetable.room || "",
  });

  const fetchTimetables = async () => {
    try {
      // Fetching all (or mocking search)
      const res = await api.get("/academics/timetable/all"); // We'll mock this endpoint in api.js
      const data = res.data.content || res.data;
      setTimetables(Array.isArray(data) ? data.map(normalizeTimetable) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      const data = res.data.content || res.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      const data = res.data.content || res.data;
      setSubjects(Array.isArray(data) ? data.map(subject => ({
        ...subject,
        name: subject.name || subject.subjectName,
      })) : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      const data = res.data.content || res.data;
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShow = (timetable = null) => {
    setCurrentTimetable(timetable ? normalizeTimetable(timetable) : { courseId: "", subjectId: "", teacherId: "", dayOfWeek: "MONDAY", startTime: "09:00", endTime: "10:00" });
    setShowModal(true);
  };

  const handleClose = () => {
    setCurrentTimetable(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setCurrentTimetable({ ...currentTimetable, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        course: currentTimetable.courseId,
        subject: currentTimetable.subjectId,
        teacher: currentTimetable.teacherId,
        dayOfWeek: currentTimetable.dayOfWeek,
        startTime: currentTimetable.startTime,
        endTime: currentTimetable.endTime,
      };

      if (currentTimetable.id) {
        await api.put(`/academics/timetable/${currentTimetable.id}`, payload);
      } else {
        await api.post("/academics/timetable", payload);
      }
      fetchTimetables();
      handleClose();
    } catch (err) {
      console.error("Error saving timetable", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this timetable entry?")) {
      try {
        await api.delete(`/academics/timetable/${id}`);
        fetchTimetables();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleFilter = (setFilterState, filterState, value) => {
    if (filterState.includes(value)) {
      setFilterState(filterState.filter(item => item !== value));
    } else {
      setFilterState([...filterState, value]);
    }
  };

  const toMinutes = (time = "") => {
    // Expect HH:mm
    const [h = "0", m = "0"] = time.split(":");
    const hh = Number.parseInt(h, 10);
    const mm = Number.parseInt(m, 10);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  const getFilteredTimetables = () => {
    const fromMins = startTimeFrom ? toMinutes(startTimeFrom) : null;
    const toMins = endTimeTo ? toMinutes(endTimeTo) : null;

    return timetables.filter((t) => {
      const matchCourse = selectedCourses.length === 0 || selectedCourses.includes(t.courseId?.toString());
      const matchDay = selectedDays.length === 0 || selectedDays.includes(t.dayOfWeek);
      const matchTeacher = selectedTeachers.length === 0 || selectedTeachers.includes(t.teacherId?.toString());
      const matchSubject = selectedSubjects.length === 0 || selectedSubjects.includes(t.subjectId?.toString());

      const keyword = searchKeyword.trim().toLowerCase();
      const matchSearch = keyword.length === 0 ||
        (t.subjectName || "").toLowerCase().includes(keyword) ||
        (t.teacherName || "").toLowerCase().includes(keyword);

      const roomKey = roomKeyword.trim().toLowerCase();
      const matchRoom = roomKey.length === 0 || (t.room || "").toLowerCase().includes(roomKey);

      const tStart = toMinutes(t.startTime);
      const tEnd = toMinutes(t.endTime);
      const matchStartFrom = fromMins === null || (tStart !== null && tStart >= fromMins);
      const matchEndTo = toMins === null || (tEnd !== null && tEnd <= toMins);

      return matchCourse && matchDay && matchTeacher && matchSubject && matchSearch && matchRoom && matchStartFrom && matchEndTo;
    });
  };


  const filteredTimetables = getFilteredTimetables();

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Class Timetable</h4>
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-plus-lg me-2"></i>Add Schedule
        </Button>
      </div>

      {/* Advanced Multi-Select Filter Bar */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-center bg-light rounded">
          <div className="fw-semibold text-secondary me-2"><i className="bi bi-funnel-fill me-1"></i> Filters:</div>


          
          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Courses {selectedCourses.length > 0 && <Badge bg="primary" className="ms-1">{selectedCourses.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '200px', maxHeight: '300px', overflowY: 'auto' }}>
              {courses.map(c => (
                <Form.Check 
                  key={c.id}
                  type="checkbox"
                  label={c.name}
                  checked={selectedCourses.includes(c.id.toString())}
                  onChange={() => toggleFilter(setSelectedCourses, selectedCourses, c.id.toString())}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Days {selectedDays.length > 0 && <Badge bg="primary" className="ms-1">{selectedDays.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '200px' }}>
              {daysOfWeek.map(day => (
                <Form.Check 
                  key={day}
                  type="checkbox"
                  label={day}
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleFilter(setSelectedDays, selectedDays, day)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Teachers {selectedTeachers.length > 0 && <Badge bg="primary" className="ms-1">{selectedTeachers.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '220px', maxHeight: '300px', overflowY: 'auto' }}>
              {teachers.map((t) => (
                <Form.Check
                  key={t.id}
                  type="checkbox"
                  label={`${t.firstName} ${t.lastName}`.trim()}
                  checked={selectedTeachers.includes(t.id.toString())}
                  onChange={() => toggleFilter(setSelectedTeachers, selectedTeachers, t.id.toString())}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Subjects {selectedSubjects.length > 0 && <Badge bg="primary" className="ms-1">{selectedSubjects.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '220px', maxHeight: '300px', overflowY: 'auto' }}>
              {subjects.map((s) => (
                <Form.Check
                  key={s.id}
                  type="checkbox"
                  label={s.name}
                  checked={selectedSubjects.includes(s.id.toString())}
                  onChange={() => toggleFilter(setSelectedSubjects, selectedSubjects, s.id.toString())}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control 
            type="text" 
            placeholder="Search subject or teacher..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: '300px' }}
            className="shadow-sm border-white"
          />

          <Form.Control 
            type="text" 
            placeholder="Room (optional)..." 
            value={roomKeyword}
            onChange={(e) => setRoomKeyword(e.target.value)}
            style={{ maxWidth: '230px' }}
            className="shadow-sm border-white"
          />

          <div className="d-flex align-items-center gap-2" style={{ maxWidth: 360 }}>
            <Form.Control
              type="time"
              value={startTimeFrom}
              onChange={(e) => setStartTimeFrom(e.target.value)}
              className="shadow-sm border-white"
              aria-label="Start time from"
            />
            <div className="text-secondary">to</div>
            <Form.Control
              type="time"
              value={endTimeTo}
              onChange={(e) => setEndTimeTo(e.target.value)}
              className="shadow-sm border-white"
              aria-label="End time to"
            />
          </div>


          {(selectedCourses.length > 0 || selectedDays.length > 0 || selectedTeachers.length > 0 || selectedSubjects.length > 0 || searchKeyword || roomKeyword || startTimeFrom || endTimeTo) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={() => {
              setSelectedCourses([]);
              setSelectedDays([]);
              setSelectedTeachers([]);
              setSelectedSubjects([]);
              setSearchKeyword("");
              setRoomKeyword("");
              setStartTimeFrom("");
              setEndTimeTo("");
            }}>
              Clear Filters
            </Button>
          )}

        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Room</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetables.length > 0 ? filteredTimetables.map((t) => (
                  <tr key={t.id}>
                    <td><Badge bg="info" className="text-dark bg-opacity-25">{t.dayOfWeek}</Badge></td>
                    <td className="fw-medium">{t.startTime} - {t.endTime}</td>
                    <td>{t.courseName}</td>
                    <td className="fw-bold">{t.subjectName}</td>
                    <td>{t.teacherName}</td>
                    <td>{t.room || 'TBA'}</td>
                    <td className="text-end">
                      <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShow(t)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(t.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">No schedules found matching the criteria.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">{currentTimetable?.id ? 'Edit' : 'Add'} Schedule</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Course</Form.Label>
                <Form.Select name="courseId" value={currentTimetable?.courseId || ""} onChange={handleChange} required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Day of Week</Form.Label>
                <Form.Select name="dayOfWeek" value={currentTimetable?.dayOfWeek || ""} onChange={handleChange} required>
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Subject</Form.Label>
                <Form.Select name="subjectId" value={currentTimetable?.subjectId || ""} onChange={handleChange} required>
                  <option value="">Select Subject</option>
                  {subjects
                    .filter(s => !currentTimetable?.courseId || s.course?.id === currentTimetable.courseId)
                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Start Time</Form.Label>
                <Form.Control type="time" name="startTime" value={currentTimetable?.startTime || ""} onChange={handleChange} required />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">End Time</Form.Label>
                <Form.Control type="time" name="endTime" value={currentTimetable?.endTime || ""} onChange={handleChange} required />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Teacher</Form.Label>
                <Form.Select name="teacherId" value={currentTimetable?.teacherId || ""} onChange={handleChange} required>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Room (Optional)</Form.Label>
                <Form.Control type="text" name="room" value={currentTimetable?.room || ""} onChange={handleChange} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Schedule</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Timetable;
