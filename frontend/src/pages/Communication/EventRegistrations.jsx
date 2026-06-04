import React, { useState, useEffect } from "react";
import { Table, Button, Card, Badge, Form, Modal, Row, Col } from "react-bootstrap";
import api from "../../services/api";

const EventRegistrations = () => {
  const [events, setEvents]               = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm] = useState({
    attendeeName: "", attendeeRole: "STUDENT", status: "CONFIRMED",
  });

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => {
    if (selectedEvent) fetchRegistrations(selectedEvent);
    else setRegistrations([]);
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setEvents(list);
    } catch (err) { console.error(err); }
  };

  const fetchRegistrations = async (eventId) => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${eventId}/registrations`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setRegistrations(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/events/${selectedEvent}/registrations`, form);
      setShowModal(false);
      setForm({ attendeeName: "", attendeeRole: "STUDENT", status: "CONFIRMED" });
      fetchRegistrations(selectedEvent);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this registration?")) return;
    try {
      await api.delete(`/events/registrations/${id}`);
      fetchRegistrations(selectedEvent);
    } catch (err) { console.error(err); }
  };

  const statusColor = (s) =>
    s === "CONFIRMED" ? "success" : s === "PENDING" ? "warning" : "secondary";

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Event Registrations</h4>
        {selectedEvent && (
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-1"></i>Add Registration
          </Button>
        )}
      </div>

      {/* Event Selector */}
      <Card className="border-0 shadow-sm mb-3 p-3">
        <Form.Select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">— Select an Event to view registrations —</option>
          {events.map((ev) => (
            <option key={ev._id || ev.id} value={ev._id || ev.id}>
              {ev.title} ({ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : "—"})
            </option>
          ))}
        </Form.Select>
      </Card>

      {/* Registrations Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4">Attendee Name</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th className="text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">Loading…</td></tr>
                ) : !selectedEvent ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">Please select an event above.</td></tr>
                ) : registrations.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No registrations found.</td></tr>
                ) : registrations.map((r) => (
                  <tr key={r._id || r.id}>
                    <td className="px-4 fw-medium">{r.attendeeName}</td>
                    <td><Badge bg="secondary">{r.attendeeRole}</Badge></td>
                    <td>{r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : "—"}</td>
                    <td><Badge bg={statusColor(r.status)}>{r.status}</Badge></td>
                    <td className="text-end px-4">
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(r._id || r.id)}>
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add Registration Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Registration</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Attendee Name</Form.Label>
                  <Form.Control
                    value={form.attendeeName}
                    onChange={(e) => setForm({ ...form, attendeeName: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={form.attendeeRole} onChange={(e) => setForm({ ...form, attendeeRole: e.target.value })}>
                    <option value="STUDENT">Student</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="GUEST">Guest</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Register</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EventRegistrations;
