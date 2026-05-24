import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Card, Dropdown } from "react-bootstrap";
import api from "../../services/api";

const BookReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const statuses = ['PENDING', 'FULFILLED', 'CANCELLED'];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get("/library/features/reservations/all");
      setReservations(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShow = (res = null) => {
    setCurrentReservation(res || { bookTitle: "", borrowerName: "", reservationDate: "", status: "PENDING" });
    setShowModal(true);
  };

  const handleClose = () => {
    setCurrentReservation(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentReservation.id) {
        // Mock update
      } else {
        await api.post("/library/features/reservations", currentReservation);
      }
      fetchReservations();
      handleClose();
    } catch (err) {
      console.error("Error saving reservation", err);
    }
  };

  const toggleFilter = (setFilterState, filterState, value) => {
    if (filterState.includes(value)) {
      setFilterState(filterState.filter(item => item !== value));
    } else {
      setFilterState([...filterState, value]);
    }
  };

  const filteredReservations = reservations.filter(r => {
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(r.status);
    const matchSearch = (r.bookTitle || "").toLowerCase().includes(searchKeyword.toLowerCase()) || 
                        (r.borrowerName || "").toLowerCase().includes(searchKeyword.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Book Reservations</h4>
        <Button variant="primary" onClick={() => handleShow()}>
          <i className="bi bi-bookmark-plus me-2"></i>New Reservation
        </Button>
      </div>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex flex-wrap gap-3 align-items-center bg-light rounded">
          <div className="fw-semibold text-secondary me-2"><i className="bi bi-funnel-fill me-1"></i> Filters:</div>
          
          <Dropdown>
            <Dropdown.Toggle variant="white" className="border shadow-sm">
              Status {selectedStatuses.length > 0 && <Badge bg="primary" className="ms-1">{selectedStatuses.length}</Badge>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="p-2 shadow" style={{ minWidth: '150px' }}>
              {statuses.map(st => (
                <Form.Check 
                  key={st}
                  type="checkbox"
                  label={st}
                  checked={selectedStatuses.includes(st)}
                  onChange={() => toggleFilter(setSelectedStatuses, selectedStatuses, st)}
                  className="mb-1"
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control 
            type="text" 
            placeholder="Search book or borrower..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ maxWidth: '300px' }}
            className="shadow-sm border-white flex-grow-1"
          />

          {(selectedStatuses.length > 0 || searchKeyword) && (
            <Button variant="link" className="text-danger text-decoration-none ms-auto" onClick={() => {
              setSelectedStatuses([]);
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
                  <th>Date</th>
                  <th>Book Title</th>
                  <th>Borrower</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length > 0 ? filteredReservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.reservationDate}</td>
                    <td className="fw-bold">{r.bookTitle}</td>
                    <td className="fw-medium">{r.borrowerName}</td>
                    <td><Badge bg="secondary">{r.borrowerType}</Badge></td>
                    <td>
                      <Badge bg={
                        r.status === 'FULFILLED' ? 'success' : 
                        r.status === 'CANCELLED' ? 'danger' : 'warning'
                      }>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button variant="light" size="sm" className="me-2 text-primary">
                        <i className="bi bi-pencil"></i>
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No reservations found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Reserve Book</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Book Title</Form.Label>
              <Form.Control type="text" name="bookTitle" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Borrower Name</Form.Label>
              <Form.Control type="text" name="borrowerName" required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm Reserve</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default BookReservations;
