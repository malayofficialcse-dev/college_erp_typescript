import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, Badge, Dropdown, Card } from "react-bootstrap";
import api from "../../services/api";

const EmployeeAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  // Filters State
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [searchKeyword, setSearchKeyword] = useState("");

  const departments = ['Computer Science & Engineering', 'Information Technology', 'Electronics', 'HR', 'Admin'];
  const statuses = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE'];

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/hr/attendance");
      setAttendanceRecords(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShow = (record = null) => {
    setCurrentRecord(record || { employeeId: "", date: dateFilter, status: "PRESENT", remarks: "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setCurrentRecord(null);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setCurrentRecord({ ...currentRecord, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/hr/attendance", currentRecord);
      fetchAttendance();
      handleClose();
    } catch (err) {
      console.error("Error saving attendance", err);
    }
  };

  const toggleFilter = (setFilterState, filterState, value) => {
    if (filterState.includes(value)) {
      setFilterState(filterState.filter(item => item !== value));
    } else {
      setFilterState([...filterState, value]);
    }
  };

  const filteredRecords = attendanceRecords.filter(r => {
    const matchDept = selectedDepts.length === 0 || selectedDepts.includes(r.department);
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(r.status);
    const matchDate = !dateFilter || r.date === dateFilter;
    const matchSearch = (r.employeeName || "").toLowerCase().includes(searchKeyword.toLowerCase());
    return matchDept && matchStatus && matchDate && matchSearch;
  });

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Staff Attendance</h4>
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-person-check me-2"></i>Mark Attendance
        </Button>
      </div>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-center bg-light rounded">
          <div className="fw-semibold text-secondary me-2"><i className="bi bi-funnel-fill me-1"></i> Filters:</div>
          
          <Form.Control 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="shadow-sm border-white w-auto"
            title="Filter by Date"
          />

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Departments {selectedDepts.length > 0 && <Badge bg="primary" className="ms-1">{selectedDepts.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '220px', maxHeight: '300px', overflowY: 'auto' }}>
              {departments.map(dept => (
                <Form.Check 
                  key={dept}
                  type="checkbox"
                  label={dept}
                  checked={selectedDepts.includes(dept)}
                  onChange={() => toggleFilter(setSelectedDepts, selectedDepts, dept)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Status {selectedStatuses.length > 0 && <Badge bg="primary" className="ms-1">{selectedStatuses.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '150px' }}>
              {statuses.map(st => (
                <Form.Check 
                  key={st}
                  type="checkbox"
                  label={st.replace('_', ' ')}
                  checked={selectedStatuses.includes(st)}
                  onChange={() => toggleFilter(setSelectedStatuses, selectedStatuses, st)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control 
            type="text" 
            placeholder="Search staff..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: '200px' }}
            className="shadow-sm border-white flex-grow-1"
          />

          {(selectedDepts.length > 0 || selectedStatuses.length > 0 || searchKeyword || dateFilter) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={() => {
              setSelectedDepts([]);
              setSelectedStatuses([]);
              setSearchKeyword("");
              setDateFilter("");
            }}>
              Clear
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
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-bold">{r.date}</td>
                    <td>{r.employeeName}</td>
                    <td><Badge bg="secondary" className="bg-opacity-50 text-dark">{r.department}</Badge></td>
                    <td>
                      <Badge bg={
                        r.status === 'PRESENT' ? 'success' : 
                        r.status === 'ABSENT' ? 'danger' : 
                        r.status === 'ON_LEAVE' ? 'info' : 'warning'
                      }>
                        {r.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="text-muted small">{r.remarks || '-'}</td>
                    <td className="text-end">
                      <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleShow(r)}>
                        <i className="bi bi-pencil"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No attendance records found for this criteria.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Mark Attendance</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Employee</Form.Label>
                <Form.Select name="employeeId" value={currentRecord?.employeeId || ""} onChange={handleChange} required>
                  <option value="">Select Employee</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Date</Form.Label>
                <Form.Control type="date" name="date" value={currentRecord?.date || ""} onChange={handleChange} required />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-muted mb-1">Status</Form.Label>
                <Form.Select name="status" value={currentRecord?.status || ""} onChange={handleChange} required>
                  {statuses.map(st => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-semibold text-muted mb-1">Remarks (Optional)</Form.Label>
                <Form.Control as="textarea" rows={2} name="remarks" value={currentRecord?.remarks || ""} onChange={handleChange} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Attendance</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeAttendance;
