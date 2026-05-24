import React, { useState, useEffect } from "react";
import { Table, Button, Card, Badge, Pagination } from "react-bootstrap";
import api from "../../services/api";

const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage]);

  const fetchRegistrations = async () => {
    try {
      // Assuming a generic mock fetch for event 1 for now
      const res = await api.get(`/communication/events/1/registrations`, {
        params: { page: currentPage, size: 10 }
      });
      setRegistrations(res.data.content || res.data || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Event Registrations</h4>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Attendee Name</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length > 0 ? registrations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.registrationDate}</td>
                    <td className="fw-medium">{r.attendeeName}</td>
                    <td><Badge bg="secondary">{r.attendeeRole}</Badge></td>
                    <td>
                      <Badge bg={r.status === 'CONFIRMED' ? 'success' : 'warning'}>
                        {r.status || 'CONFIRMED'}
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">No registrations found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination className="shadow-sm">
            <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} />
            {[...Array(totalPages).keys()].map(page => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
                {page + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)} />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
