import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, Badge, Dropdown, Card } from "react-bootstrap";
import api from "../../services/api";

const ExamSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // Filters State
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [examType, setExamType] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const examTypes = ['MID_TERM', 'FINAL', 'PRACTICAL', 'VIVA'];

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/academic-features/exam-schedules"); 
      setSchedules(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShow = (schedule = null) => {
    setCurrentSchedule(schedule || { examName: "", courseId: "", semester: 1, examType: "FINAL", examDate: "", startTime: "10:00", endTime: "13:00", subject: "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setCurrentSchedule(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setCurrentSchedule({ ...currentSchedule, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSchedule.id) {
        await api.put(`/academic-features/exam-schedules/${currentSchedule.id}`, currentSchedule);
      } else {
        await api.post("/academic-features/exam-schedules", currentSchedule);
      }
      fetchSchedules();
      handleClose();
    } catch (err) {
      console.error("Error saving schedule", err);
    }
  };

  const toggleFilter = (setFilterState, filterState, value) => {
    if (filterState.includes(value)) {
      setFilterState(filterState.filter(item => item !== value));
    } else {
      setFilterState([...filterState, value]);
    }
  };

  const filteredSchedules = schedules.filter(s => {
    const matchCourse = selectedCourses.length === 0 || selectedCourses.includes(s.courseId?.toString());
    const matchType = !examType || s.examType === examType;
    const matchSearch = (s.examName || "").toLowerCase().includes(searchKeyword.toLowerCase()) || 
                        (s.subject || "").toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCourse && matchType && matchSearch;
  });

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Exam Schedules</h4>
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-calendar-plus me-2"></i>Schedule Exam
        </Button>
      </div>

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

          <Form.Select 
            value={examType} 
            onChange={(e) => setExamType(e.target.value)} 
            className="shadow-sm border-white w-auto"
          >
            <option value="">All Types</option>
            {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </Form.Select>

          <Form.Control 
            type="text" 
            placeholder="Search exam or subject..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: '250px' }}
            className="shadow-sm border-white flex-grow-1"
          />

          {(selectedCourses.length > 0 || examType || searchKeyword) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={() => {
              setSelectedCourses([]);
              setExamType("");
              setSearchKeyword("");
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
                  <th>Date & Time</th>
                  <th>Exam Name</th>
                  <th>Type</th>
                  <th>Course (Sem)</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length > 0 ? filteredSchedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-bold">{s.examDate}</div>
                      <small className="text-muted">{s.startTime} - {s.endTime}</small>
                    </td>
                    <td className="fw-medium">{s.examName}</td>
                    <td><Badge bg={s.examType === 'FINAL' ? 'danger' : 'primary'} className="bg-opacity-75">{s.examType}</Badge></td>
                    <td>{s.courseName} <Badge bg="secondary">Sem {s.semester}</Badge></td>
                    <td>{s.subject}</td>
                    <td>{s.room || 'TBA'}</td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" className="me-2" title="Generate Hall Tickets">
                        <i className="bi bi-ticket-detailed"></i>
                      </Button>
                      <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShow(s)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">No exam schedules found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} backdrop="static" size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">{currentSchedule?.id ? 'Edit' : 'Schedule'} Exam</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Exam Title</Form.Label>
                <Form.Control type="text" name="examName" value={currentSchedule?.examName || ""} onChange={handleChange} required placeholder="e.g. Fall Semester Final 2026" />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Course</Form.Label>
                <Form.Select name="courseId" value={currentSchedule?.courseId || ""} onChange={handleChange} required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-semibold text-muted mb-1">Semester</Form.Label>
                <Form.Control type="number" name="semester" min="1" max="10" value={currentSchedule?.semester || ""} onChange={handleChange} required />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-semibold text-muted mb-1">Type</Form.Label>
                <Form.Select name="examType" value={currentSchedule?.examType || ""} onChange={handleChange} required>
                  {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Subject Name</Form.Label>
                <Form.Control type="text" name="subject" value={currentSchedule?.subject || ""} onChange={handleChange} required />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-semibold text-muted mb-1">Date</Form.Label>
                <Form.Control type="date" name="examDate" value={currentSchedule?.examDate || ""} onChange={handleChange} required />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-semibold text-muted mb-1">Start Time</Form.Label>
                <Form.Control type="time" name="startTime" value={currentSchedule?.startTime || ""} onChange={handleChange} required />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-semibold text-muted mb-1">End Time</Form.Label>
                <Form.Control type="time" name="endTime" value={currentSchedule?.endTime || ""} onChange={handleChange} required />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Room / Venue (Optional)</Form.Label>
                <Form.Control type="text" name="room" value={currentSchedule?.room || ""} onChange={handleChange} placeholder="e.g. Main Hall" />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Schedule Exam</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamSchedules;
