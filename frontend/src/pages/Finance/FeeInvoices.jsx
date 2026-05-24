import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Card, Dropdown } from "react-bootstrap";
import api from "../../services/api";

const FeeInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const statuses = ['PAID', 'PARTIAL', 'UNPAID'];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/finance/invoices");
      setInvoices(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowPayment = (invoice) => {
    setCurrentInvoice(invoice);
    const balance = invoice.totalAmount - (invoice.paidAmount || 0);
    setPaymentAmount(balance.toString());
    setShowPaymentModal(true);
  };

  const handleClosePayment = () => {
    setCurrentInvoice(null);
    setShowPaymentModal(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/finance/invoices/${currentInvoice.id}/payments`, {
        amount: parseFloat(paymentAmount),
        paymentMethod: "CASH",
        referenceNumber: "TXN" + Date.now()
      });
      fetchInvoices();
      handleClosePayment();
    } catch (err) {
      console.error("Error processing payment", err);
    }
  };

  const toggleFilter = (setFilterState, filterState, value) => {
    if (filterState.includes(value)) {
      setFilterState(filterState.filter(item => item !== value));
    } else {
      setFilterState([...filterState, value]);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(inv.status);
    const matchSearch = (inv.studentName || "").toLowerCase().includes(searchKeyword.toLowerCase()) || 
                        (inv.invoiceNumber || "").toLowerCase().includes(searchKeyword.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 text-dark">Fee Invoices</h4>
        <Button variant="primary">
          <i className="bi bi-receipt me-2"></i>Generate Invoices
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
            placeholder="Search student or invoice #..." 
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
                  <th>Invoice #</th>
                  <th>Student</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                  const balance = inv.totalAmount - (inv.paidAmount || 0);
                  return (
                    <tr key={inv.id}>
                      <td className="fw-bold text-primary">{inv.invoiceNumber}</td>
                      <td className="fw-medium">{inv.studentName}</td>
                      <td>{inv.dueDate}</td>
                      <td>${inv.totalAmount.toFixed(2)}</td>
                      <td className="text-success">${(inv.paidAmount || 0).toFixed(2)}</td>
                      <td className="fw-bold text-danger">${balance.toFixed(2)}</td>
                      <td>
                        <Badge bg={
                          inv.status === 'PAID' ? 'success' : 
                          inv.status === 'UNPAID' ? 'danger' : 'warning'
                        }>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          disabled={inv.status === 'PAID'}
                          onClick={() => handleShowPayment(inv)}
                        >
                          <i className="bi bi-credit-card me-1"></i>Pay
                        </Button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showPaymentModal} onHide={handleClosePayment} backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Record Payment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePaymentSubmit}>
          <Modal.Body>
            <div className="bg-light p-3 rounded mb-4 shadow-sm border">
              <h6 className="fw-bold mb-2 text-primary">{currentInvoice?.studentName}</h6>
              <p className="mb-1 small"><strong>Invoice:</strong> {currentInvoice?.invoiceNumber}</p>
              <p className="mb-0 small text-danger fw-bold"><strong>Outstanding Balance:</strong> ${(currentInvoice?.totalAmount - (currentInvoice?.paidAmount || 0)).toFixed(2)}</p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Payment Amount ($)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01" 
                min="1" 
                max={currentInvoice?.totalAmount - (currentInvoice?.paidAmount || 0)}
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={handleClosePayment}>Cancel</Button>
            <Button variant="success" type="submit">Confirm Payment</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FeeInvoices;
