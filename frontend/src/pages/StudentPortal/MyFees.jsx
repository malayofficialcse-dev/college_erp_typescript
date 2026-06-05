import React, { useState, useEffect, useContext } from "react";
import { Card, Table, Spinner, Alert, Badge, Button } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { fetchMyStudentProfile } from "../../services/studentSelfService";
import api from "../../services/api";

const MyFees = () => {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentProfile = await fetchMyStudentProfile(user);
      if (!studentProfile) {
        setError("No student profile linked to your account.");
        setLoading(false);
        return;
      }
      setStudent(studentProfile);

      const res = await api.get(`/student-portal/${studentProfile._id || studentProfile.id}/fees`);
      setFees(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      setError("Failed to load fee invoices.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Fees</h2>
      </div>

      {fees.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <i className="bi bi-receipt fs-1 d-block mb-3"></i>
            No fee invoices found.
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="px-4">Invoice #</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th className="text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee._id || fee.id}>
                    <td className="px-4 fw-medium text-primary">{fee.invoiceNumber}</td>
                    <td>{fee.description || 'Semester Fee'}</td>
                    <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="fw-bold">${fee.totalAmount.toFixed(2)}</td>
                    <td className="text-success">${(fee.paidAmount || 0).toFixed(2)}</td>
                    <td>
                      <Badge bg={fee.status === 'PAID' ? 'success' : fee.status === 'PARTIAL' ? 'warning' : 'danger'}>
                        {fee.status}
                      </Badge>
                    </td>
                    <td className="text-end px-4">
                      {fee.status !== 'PAID' ? (
                        <Button variant="primary" size="sm" className="rounded-pill px-3">
                          Pay Now
                        </Button>
                      ) : (
                        <Button variant="outline-secondary" size="sm" className="rounded-pill px-3">
                          <i className="bi bi-download me-1"></i>Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MyFees;
