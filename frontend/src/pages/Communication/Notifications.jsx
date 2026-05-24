import React, { useState, useEffect } from "react";
import { Table, Button, Card, Badge, Pagination } from "react-bootstrap";
import api from "../../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      // Assuming a generic mock fetch for user 1 for now
      const res = await api.get(`/communication/notifications/user/1`, {
        params: { page: currentPage, size: 10 }
      });
      setNotifications(res.data.content || res.data || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/communication/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">My Notifications</h4>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length > 0 ? notifications.map((n) => (
                  <tr key={n.id}>
                    <td>{n.sentDate}</td>
                    <td className="fw-bold">{n.title}</td>
                    <td className="text-muted">{n.message}</td>
                    <td><Badge bg="info">{n.type}</Badge></td>
                    <td>
                      <Badge bg={n.isRead ? 'secondary' : 'primary'}>
                        {n.isRead ? 'READ' : 'NEW'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      {!n.isRead && (
                        <Button variant="outline-success" size="sm" onClick={() => markAsRead(n.id)}>
                          Mark Read
                        </Button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No notifications found.</td>
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

export default Notifications;
