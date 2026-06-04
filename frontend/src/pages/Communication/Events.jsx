import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: '', description: '', eventType: 'CULTURAL', eventDate: '', startTime: '', endTime: '', venue: '', organizedByDeptId: '', organizerName: '', status: 'UPCOMING'
  });

  useEffect(() => {
    fetchEvents();
    fetchDepartments();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      // api interceptor unwraps data; handle both array and {data:[]} shapes
      const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setEvents(list);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const list = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      setDepartments(list);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentEvent({ title: '', description: '', eventType: 'CULTURAL', eventDate: '', startTime: '', endTime: '', venue: '', organizedByDeptId: '', organizerName: '', status: 'UPCOMING' });
    setShowModal(true);
  };

  const handleOpenEdit = (event) => {
    setIsEdit(true);
    setCurrentEvent({
      ...event,
      organizedByDeptId: event.organizedByDept?.id || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title:            currentEvent.title,
        description:      currentEvent.description,
        eventType:        currentEvent.eventType,
        eventDate:        currentEvent.eventDate,
        startTime:        currentEvent.startTime,
        endTime:          currentEvent.endTime,
        venue:            currentEvent.venue,
        organizerName:    currentEvent.organizerName,
        status:           currentEvent.status,
        organizedByDept:  currentEvent.organizedByDeptId || undefined,
      };

      if (isEdit) {
        await api.put(`/events/${currentEvent._id || currentEvent.id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Events</h2>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Create Event
        </Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No events found.</td></tr>
              ) : events.map(event => (
                <tr key={event._id || event.id}>
                  <td className="px-4 fw-bold">{event.title}</td>
                  <td>{event.eventType}</td>
                  <td>{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '—'}</td>
                  <td>{event.venue || '—'}</td>
                  <td>
                    <Badge bg={event.status === 'UPCOMING' ? 'info' : event.status === 'COMPLETED' ? 'success' : event.status === 'ONGOING' ? 'warning' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(event)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(event._id || event.id)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Event' : 'Create Event'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control type="text" name="title" value={currentEvent.title} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={currentEvent.description} onChange={handleFormChange} />
            </Form.Group>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Event Type</Form.Label>
                  <Form.Select name="eventType" value={currentEvent.eventType} onChange={handleFormChange}>
                    <option value="CULTURAL">Cultural</option>
                    <option value="SPORTS">Sports</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="SEMINAR">Seminar</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="eventDate" value={currentEvent.eventDate} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control type="time" name="startTime" value={currentEvent.startTime} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Time</Form.Label>
                  <Form.Control type="time" name="endTime" value={currentEvent.endTime} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Venue</Form.Label>
                  <Form.Control type="text" name="venue" value={currentEvent.venue} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={currentEvent.status} onChange={handleFormChange}>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Organizing Department</Form.Label>
                  <Form.Select name="organizedByDeptId" value={currentEvent.organizedByDeptId} onChange={handleFormChange}>
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept._id || dept.id} value={dept._id || dept.id}>{dept.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Organizer Name</Form.Label>
                  <Form.Control type="text" name="organizerName" value={currentEvent.organizerName} onChange={handleFormChange} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Events;
