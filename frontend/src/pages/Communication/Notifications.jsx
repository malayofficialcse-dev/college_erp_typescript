import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import api from "../../services/api";

const audienceColor = (a) =>
  ({ ALL: "primary", STUDENTS: "success", STAFF: "info", TEACHERS: "warning" }[a] || "secondary");

const typeIcon = (t) =>
  ({ GENERAL: "bi-bell", ACADEMIC: "bi-book", EXAM: "bi-pencil-square", HOLIDAY: "bi-calendar-x", URGENT: "bi-exclamation-triangle-fill" }[t] || "bi-bell");

const urgencyColor = (t) =>
  ({ URGENT: "danger", HOLIDAY: "warning", EXAM: "primary", ACADEMIC: "info", GENERAL: "secondary" }[t] || "secondary");

const Notifications = () => {
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState({ noticeType: "", targetAudience: "" });
  const [readSet, setReadSet]     = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("readNotices") || "[]")); }
    catch { return new Set(); }
  });

  useEffect(() => { fetchNotices(); }, [filter]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.noticeType)     params.noticeType     = filter.noticeType;
      if (filter.targetAudience) params.targetAudience = filter.targetAudience;
      const res = await api.get("/notices", { params });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setNotices(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const markRead = (id) => {
    const next = new Set(readSet);
    next.add(String(id));
    setReadSet(next);
    localStorage.setItem("readNotices", JSON.stringify([...next]));
  };

  const markAllRead = () => {
    const next = new Set(notices.map((n) => String(n._id || n.id)));
    setReadSet(next);
    localStorage.setItem("readNotices", JSON.stringify([...next]));
  };

  const unreadCount = notices.filter((n) => !readSet.has(String(n._id || n.id))).length;

  return (
    <div className="py-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <h4 className="fw-bold mb-0 text-dark">Notifications</h4>
          {unreadCount > 0 && (
            <Badge bg="danger" pill>{unreadCount} new</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline-secondary" size="sm" onClick={markAllRead}>
            <i className="bi bi-check2-all me-1"></i>Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4 p-3">
        <Row className="g-2 align-items-center">
          <Col xs={12} md={4}>
            <Form.Select
              size="sm"
              value={filter.noticeType}
              onChange={(e) => setFilter({ ...filter, noticeType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="GENERAL">General</option>
              <option value="ACADEMIC">Academic</option>
              <option value="EXAM">Exam</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="URGENT">Urgent</option>
            </Form.Select>
          </Col>
          <Col xs={12} md={4}>
            <Form.Select
              size="sm"
              value={filter.targetAudience}
              onChange={(e) => setFilter({ ...filter, targetAudience: e.target.value })}
            >
              <option value="">All Audiences</option>
              <option value="ALL">Everyone</option>
              <option value="STUDENTS">Students</option>
              <option value="STAFF">Staff</option>
              <option value="TEACHERS">Teachers</option>
            </Form.Select>
          </Col>
          <Col xs={12} md={4}>
            <Button variant="outline-primary" size="sm" className="w-100" onClick={fetchNotices}>
              <i className="bi bi-arrow-clockwise me-1"></i>Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Notification Feed */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : notices.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>
            No notifications found.
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notices.map((notice) => {
            const id     = String(notice._id || notice.id);
            const isRead = readSet.has(id);
            return (
              <Card
                key={id}
                className={`border-0 shadow-sm ${isRead ? "opacity-75" : "border-start border-4 border-" + urgencyColor(notice.noticeType)}`}
                style={{ borderLeftColor: isRead ? undefined : undefined }}
              >
                <Card.Body className="d-flex justify-content-between align-items-start gap-3">
                  <div className="d-flex gap-3 align-items-start">
                    {/* Icon */}
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center bg-${urgencyColor(notice.noticeType)} bg-opacity-10`}
                      style={{ width: 44, height: 44, flexShrink: 0 }}
                    >
                      <i className={`bi ${typeIcon(notice.noticeType)} text-${urgencyColor(notice.noticeType)} fs-5`}></i>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className="fw-bold">{notice.title}</span>
                        {!isRead && <Badge bg="danger" pill style={{ fontSize: "0.65rem" }}>NEW</Badge>}
                        <Badge bg={urgencyColor(notice.noticeType)} className="text-capitalize">
                          {notice.noticeType}
                        </Badge>
                        <Badge bg={audienceColor(notice.targetAudience)}>
                          {notice.targetAudience}
                        </Badge>
                      </div>
                      <p className="mb-1 text-secondary small">{notice.content}</p>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {notice.publishDate
                          ? new Date(notice.publishDate).toLocaleString()
                          : new Date(notice.createdAt).toLocaleString()}
                        {notice.expiryDate && (
                          <span className="ms-2 text-warning">
                            · Expires {new Date(notice.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </small>
                    </div>
                  </div>

                  {/* Mark Read */}
                  {!isRead && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      style={{ whiteSpace: "nowrap" }}
                      onClick={() => markRead(id)}
                    >
                      <i className="bi bi-check2 me-1"></i>Mark Read
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
