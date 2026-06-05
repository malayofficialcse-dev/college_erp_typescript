import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";

const StudentPortalHeader = ({ student }) => {
  if (!student) return null;

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
          <div>
            <h3 className="mb-2">{student.firstName} {student.lastName}</h3>
            <div className="text-muted small">Enrollment: {student.enrollmentNumber}</div>
            <div className="text-muted small">Email: {student.email}</div>
            <div className="text-muted small">Phone: {student.phone}</div>
          </div>
          <Row className="g-2" style={{ minWidth: 240 }}>
            <Col xs={12} md={6}>
              <div className="text-muted small">Department</div>
              <div>{student.department?.name || 'N/A'}</div>
            </Col>
            <Col xs={12} md={6}>
              <div className="text-muted small">Course</div>
              <div>{student.course?.name || 'N/A'}</div>
            </Col>
            <Col xs={12} md={6}>
              <div className="text-muted small">Section</div>
              <div>{student.section?.name || 'N/A'}</div>
            </Col>
            <Col xs={12} md={6}>
              <div className="text-muted small">Academic Year</div>
              <div>{student.academicYear?.name || 'N/A'}</div>
            </Col>
          </Row>
        </div>
        <div className="mt-3">
          <Badge bg="info">Student Portal</Badge>
          <Badge bg="secondary" className="ms-2">{student.status || 'ACTIVE'}</Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StudentPortalHeader;
