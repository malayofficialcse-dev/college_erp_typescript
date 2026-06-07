import React, { useState, useEffect, useContext, useRef } from "react";
import { Card, Table, Spinner, Alert, Badge, Button, Modal } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { fetchMyStudentProfile } from "../../services/studentSelfService";
import api from "../../services/api";
import StudentPortalHeader from "../../components/StudentPortalHeader";

/* ─────────────────────────────────────────────
   Receipt Modal – rendered in a print-friendly
   layout; user can hit "Print / Download PDF"
───────────────────────────────────────────── */
const ReceiptModal = ({ show, onHide, fee, student }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Fee Receipt – ${fee?.invoiceNumber || ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 0; }
    .receipt-wrap { max-width: 750px; margin: 0 auto; padding: 40px 32px; }

    /* Header */
    .receipt-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 3px solid #4f46e5; margin-bottom: 24px; }
    .college-info h1 { font-size: 22px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
    .college-info p { font-size: 12px; color: #6b7280; margin-top: 3px; }
    .receipt-title { text-align: right; }
    .receipt-title h2 { font-size: 26px; font-weight: 800; color: #1a1a2e; text-transform: uppercase; letter-spacing: 2px; }
    .receipt-title .badge-paid { display: inline-block; background: #10b981; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px; letter-spacing: 1px; }
    .receipt-title .badge-pending { display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px; letter-spacing: 1px; }
    .receipt-title .badge-overdue { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px; letter-spacing: 1px; }

    /* Info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 28px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    .info-section { padding: 16px 20px; }
    .info-section:first-child { border-right: 1px solid #e5e7eb; background: #fafafa; }
    .info-section h3 { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .info-row span:first-child { color: #6b7280; }
    .info-row span:last-child { font-weight: 600; color: #1a1a2e; text-align: right; }

    /* Amount table */
    .amount-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13.5px; }
    .amount-table thead tr { background: #4f46e5; color: #fff; }
    .amount-table thead th { padding: 10px 16px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .amount-table tbody tr { border-bottom: 1px solid #f3f4f6; }
    .amount-table tbody tr:last-child { border-bottom: none; }
    .amount-table tbody td { padding: 12px 16px; }
    .amount-table .total-row { background: #f5f3ff; font-weight: 700; }
    .amount-table .total-row td { padding: 13px 16px; font-size: 14px; }
    .amount-table .balance-row td { color: #ef4444; font-weight: 700; }

    /* Payment details */
    .payment-details { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
    .payment-details h3 { font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
    .pd-item span:first-child { color: #6b7280; display: block; font-size: 11px; margin-bottom: 2px; }
    .pd-item span:last-child { font-weight: 600; color: #1a1a2e; }

    /* Footer */
    .receipt-footer { border-top: 2px dashed #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .stamp-area { font-size: 11px; color: #9ca3af; }
    .stamp-area p { margin-bottom: 4px; }
    .sig-line { width: 140px; height: 50px; border-bottom: 1.5px solid #d1d5db; margin-bottom: 4px; }
    .sig-label { font-size: 11px; color: #6b7280; text-align: center; }
    .generated-note { font-size: 10px; color: #d1d5db; text-align: right; }

    @media print {
      body { padding: 0; }
      .receipt-wrap { padding: 20px; }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  if (!fee || !student) return null;

  const isPaid = fee.status === "PAID";
  const balance = (fee.totalAmount || 0) - (fee.paidAmount || 0);
  const badgeClass = fee.status === "PAID" ? "badge-paid" : fee.status === "OVERDUE" ? "badge-overdue" : "badge-pending";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="receipt-modal-dialog">
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-receipt me-2 text-primary"></i>Fee Receipt
        </Modal.Title>
        <div className="ms-auto d-flex gap-2">
          <Button variant="primary" size="sm" className="rounded-pill px-3" onClick={handlePrint}>
            <i className="bi bi-printer me-1"></i>Print / Download PDF
          </Button>
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={onHide}>
            Close
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="pt-2">
        {/* The printable content */}
        <div ref={receiptRef}>
          <div className="receipt-wrap">
            {/* ── College header ── */}
            <div className="receipt-header">
              <div className="college-info">
                <h1>ERP Pro College</h1>
                <p>Accredited Institution | Est. 2001</p>
                <p>finance@erprocollege.edu &nbsp;|&nbsp; +91-9000000000</p>
              </div>
              <div className="receipt-title">
                <h2>Receipt</h2>
                <div className={badgeClass}>{fee.status}</div>
              </div>
            </div>

            {/* ── Info grid ── */}
            <div className="info-grid">
              {/* Student info */}
              <div className="info-section">
                <h3>Student Details</h3>
                <div className="info-row">
                  <span>Name</span>
                  <span>{student.firstName} {student.lastName}</span>
                </div>
                <div className="info-row">
                  <span>Enrollment No.</span>
                  <span>{student.enrollmentNumber}</span>
                </div>
                <div className="info-row">
                  <span>Department</span>
                  <span>{student.department?.name || student.department || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span>Course</span>
                  <span>{student.course?.name || student.course || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span>Section</span>
                  <span>{student.section?.name || student.section || "N/A"}</span>
                </div>
                <div className="info-row">
                  <span>Academic Year</span>
                  <span>{student.academicYear?.name || student.academicYear || "N/A"}</span>
                </div>
              </div>

              {/* Receipt info */}
              <div className="info-section">
                <h3>Receipt Details</h3>
                <div className="info-row">
                  <span>Invoice No.</span>
                  <span>{fee.invoiceNumber}</span>
                </div>
                {fee.receiptNumber && (
                  <div className="info-row">
                    <span>Receipt No.</span>
                    <span>{fee.receiptNumber}</span>
                  </div>
                )}
                <div className="info-row">
                  <span>Description</span>
                  <span>{fee.description || "Fee Payment"}</span>
                </div>
                <div className="info-row">
                  <span>Due Date</span>
                  <span>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</span>
                </div>
                {fee.paidDate && (
                  <div className="info-row">
                    <span>Paid On</span>
                    <span>{new Date(fee.paidDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                )}
                <div className="info-row">
                  <span>Generated</span>
                  <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* ── Amount table ── */}
            <table className="amount-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{fee.description || "Fee Installment"}</td>
                  <td style={{ textAlign: "right" }}>₹{(fee.totalAmount || 0).toFixed(2)}</td>
                </tr>
                {fee.fineAmount > 0 && (
                  <tr>
                    <td style={{ color: "#ef4444" }}>Late Fine</td>
                    <td style={{ textAlign: "right", color: "#ef4444" }}>₹{fee.fineAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td>Total Payable</td>
                  <td style={{ textAlign: "right" }}>₹{(fee.totalAmount || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>Amount Paid</td>
                  <td style={{ textAlign: "right", color: "#10b981", fontWeight: 600 }}>₹{(fee.paidAmount || 0).toFixed(2)}</td>
                </tr>
                {balance > 0 && (
                  <tr className="balance-row">
                    <td>Balance Due</td>
                    <td style={{ textAlign: "right" }}>₹{balance.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ── Payment details (if paid) ── */}
            {(fee.paymentMethod || fee.transactionId || fee.remarks) && (
              <div className="payment-details">
                <h3>Payment Details</h3>
                <div className="pd-grid">
                  {fee.paymentMethod && (
                    <div className="pd-item">
                      <span>Payment Method</span>
                      <span>{fee.paymentMethod}</span>
                    </div>
                  )}
                  {fee.transactionId && (
                    <div className="pd-item">
                      <span>Transaction ID</span>
                      <span>{fee.transactionId}</span>
                    </div>
                  )}
                  {fee.emiNumber && (
                    <div className="pd-item">
                      <span>EMI Number</span>
                      <span>#{fee.emiNumber}</span>
                    </div>
                  )}
                  {fee.remarks && (
                    <div className="pd-item" style={{ gridColumn: "1/-1" }}>
                      <span>Remarks</span>
                      <span>{fee.remarks}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="receipt-footer">
              <div className="stamp-area">
                <p>This is a computer-generated receipt.</p>
                <p>No signature required for digital receipts.</p>
              </div>
              <div>
                <div className="sig-line"></div>
                <div className="sig-label">Authorized Signatory</div>
              </div>
            </div>
            <p className="generated-note" style={{ marginTop: 16 }}>
              Generated via ERP Pro Student Portal on {new Date().toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </Modal.Body>

      {/* Inline styles for the modal print area */}
      <style>{`
        .receipt-wrap {
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        .receipt-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 3px solid #4f46e5;
          margin-bottom: 24px;
        }
        .college-info h1 { font-size: 20px; font-weight: 800; color: #4f46e5; }
        .college-info p  { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .receipt-title   { text-align: right; }
        .receipt-title h2 { font-size: 24px; font-weight: 800; color: #1a1a2e; text-transform: uppercase; letter-spacing: 2px; }
        .badge-paid    { display: inline-block; background: #10b981; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px; }
        .badge-pending { display: inline-block; background: #f59e0b; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px; }
        .badge-overdue { display: inline-block; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 12px; border-radius: 20px; margin-top: 6px; }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .info-section { padding: 16px 20px; }
        .info-section:first-child { border-right: 1px solid #e5e7eb; background: #fafafa; }
        .info-section h3 { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; gap: 8px; }
        .info-row span:first-child { color: #6b7280; white-space: nowrap; }
        .info-row span:last-child  { font-weight: 600; color: #1a1a2e; text-align: right; }
        .amount-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13.5px; }
        .amount-table thead tr { background: #4f46e5; color: #fff; }
        .amount-table thead th { padding: 10px 16px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; }
        .amount-table tbody tr { border-bottom: 1px solid #f3f4f6; }
        .amount-table tbody td { padding: 11px 16px; }
        .amount-table .total-row { background: #f5f3ff; font-weight: 700; }
        .payment-details { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
        .payment-details h3 { font-size: 10px; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .pd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
        .pd-item span:first-child { color: #6b7280; display: block; font-size: 11px; margin-bottom: 2px; }
        .pd-item span:last-child  { font-weight: 600; color: #1a1a2e; }
        .receipt-footer { border-top: 2px dashed #e5e7eb; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8px; }
        .stamp-area { font-size: 11px; color: #9ca3af; }
        .stamp-area p { margin-bottom: 3px; }
        .sig-line { width: 140px; height: 50px; border-bottom: 1.5px solid #d1d5db; margin-bottom: 4px; }
        .sig-label { font-size: 11px; color: #6b7280; text-align: center; }
        .generated-note { font-size: 10px; color: #9ca3af; text-align: right; margin-top: 12px; }
      `}</style>
    </Modal>
  );
};

/* ─────────────────────────────────────────────
   Main MyFees page
───────────────────────────────────────────── */
const MyFees = () => {
  const { user } = useContext(AuthContext);
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

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

  const openReceipt = (fee) => {
    setSelectedFee(fee);
    setShowReceipt(true);
  };

  const statusBadge = (status) => {
    const map = { PAID: "success", PARTIAL: "warning", OVERDUE: "danger", PENDING: "secondary", WAIVED: "info" };
    return <Badge bg={map[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error)   return <Alert variant="danger" className="mt-3">{error}</Alert>;

  const totalDue  = fees.reduce((s, f) => s + (f.totalAmount || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount  || 0), 0);
  const balance   = totalDue - totalPaid;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Fees</h2>
      </div>
      <StudentPortalHeader student={student} />

      {/* Summary cards */}
      {fees.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { label: "Total Fee",   value: totalDue,  color: "primary", icon: "bi-cash-stack" },
            { label: "Amount Paid", value: totalPaid, color: "success", icon: "bi-check-circle" },
            { label: "Balance Due", value: balance,   color: balance > 0 ? "danger" : "success", icon: "bi-wallet2" },
          ].map((item) => (
            <div key={item.label} className="col-12 col-md-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className={`rounded-circle bg-${item.color} bg-opacity-10 d-flex align-items-center justify-content-center`}
                       style={{ width: 48, height: 48, flexShrink: 0 }}>
                    <i className={`bi ${item.icon} text-${item.color} fs-5`}></i>
                  </div>
                  <div>
                    <div className="text-muted small">{item.label}</div>
                    <div className={`fw-bold fs-5 text-${item.color}`}>₹{item.value.toFixed(2)}</div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

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
                    <td>{fee.description || "Semester Fee"}</td>
                    <td>{new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="fw-bold">₹{(fee.totalAmount || 0).toFixed(2)}</td>
                    <td className="text-success">₹{(fee.paidAmount || 0).toFixed(2)}</td>
                    <td>{statusBadge(fee.status)}</td>
                    <td className="text-end px-4">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-3"
                        onClick={() => openReceipt(fee)}
                      >
                        <i className="bi bi-receipt me-1"></i>
                        {fee.status === "PAID" ? "Receipt" : "View Invoice"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        show={showReceipt}
        onHide={() => setShowReceipt(false)}
        fee={selectedFee}
        student={student}
      />
    </div>
  );
};

export default MyFees;
