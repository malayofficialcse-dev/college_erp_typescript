import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import api from '../../services/api';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Book modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [isBookEdit, setIsBookEdit] = useState(false);
  const [currentBook, setCurrentBook] = useState({
    title: '', author: '', isbn: '', publisher: '', quantity: 1, available: 1, location: ''
  });

  // Issue modal state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [currentIssue, setCurrentIssue] = useState({
    bookId: '', studentId: '', remarks: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchIssues();
    fetchStudents();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/library/books');
      setBooks(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchIssues = async () => {
    try {
      // Overdue or all issues
      const response = await api.get('/library/issues/overdue');
      setIssues(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 100 } });
      setStudents(response.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Book
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (isBookEdit) {
        await api.put(`/library/books/${currentBook.id}`, currentBook);
      } else {
        await api.post('/library/books', currentBook);
      }
      setShowBookModal(false);
      fetchBooks();
    } catch (e) {
      console.error(e);
    }
  };

  // Issue Book
  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        book: { id: parseInt(currentIssue.bookId) },
        student: { id: parseInt(currentIssue.studentId) },
        remarks: currentIssue.remarks
      };
      await api.post('/library/issues', payload);
      setShowIssueModal(false);
      fetchIssues();
      fetchBooks();
    } catch (e) {
      console.error(e);
    }
  };

  // Return Book
  const handleReturnBook = async (issueId) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await api.patch(`/library/issues/${issueId}/return`);
        fetchIssues();
        fetchBooks();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Library Management</h2>
        {activeTab === 'inventory' ? (
          <Button variant="primary" onClick={() => { setIsBookEdit(false); setCurrentBook({ title: '', author: '', isbn: '', publisher: '', quantity: 1, available: 1, location: '' }); setShowBookModal(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Add Book
          </Button>
        ) : (
          <Button variant="success" onClick={() => { setCurrentIssue({ bookId: '', studentId: '', remarks: '' }); setShowIssueModal(true); }}>
            <i className="bi bi-journal-plus me-2"></i>Issue Book
          </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="inventory" title="Book Inventory">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Publisher</th>
                    <th>Qty (Available)</th>
                    <th>Location</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b.id}>
                      <td className="px-4 fw-bold">{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.isbn}</td>
                      <td>{b.publisher}</td>
                      <td>{b.quantity} ({b.available})</td>
                      <td>{b.location}</td>
                      <td className="text-end px-4">
                        <Button variant="outline-primary" size="sm" onClick={() => { setIsBookEdit(true); setCurrentBook(b); setShowBookModal(true); }}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Tab>
        <Tab eventKey="borrowed" title="Borrowed / Overdue Books">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th>Book Title</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map(i => (
                    <tr key={i.id}>
                      <td className="px-4 fw-bold">{i.student?.firstName} {i.student?.lastName}</td>
                      <td>{i.book?.title}</td>
                      <td>{i.issueDate}</td>
                      <td>{i.dueDate}</td>
                      <td>{i.returnDate ? i.returnDate : <Badge bg="danger">Pending</Badge>}</td>
                      <td className="text-end px-4">
                        {!i.returnDate && (
                          <Button variant="outline-success" size="sm" onClick={() => handleReturnBook(i.id)}>
                            Return Book
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Tab>
      </Tabs>

      {/* Book Add/Edit Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isBookEdit ? 'Edit Book' : 'Add Book'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveBook}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Book Title</Form.Label>
              <Form.Control type="text" name="title" value={currentBook.title} onChange={e => setCurrentBook({...currentBook, title: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Author</Form.Label>
              <Form.Control type="text" name="author" value={currentBook.author} onChange={e => setCurrentBook({...currentBook, author: e.target.value})} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN</Form.Label>
                  <Form.Control type="text" name="isbn" value={currentBook.isbn} onChange={e => setCurrentBook({...currentBook, isbn: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Publisher</Form.Label>
                  <Form.Control type="text" name="publisher" value={currentBook.publisher} onChange={e => setCurrentBook({...currentBook, publisher: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control type="number" name="quantity" value={currentBook.quantity} onChange={e => setCurrentBook({...currentBook, quantity: parseInt(e.target.value)})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location (Shelf/Row)</Form.Label>
                  <Form.Control type="text" name="location" value={currentBook.location} onChange={e => setCurrentBook({...currentBook, location: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBookModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Book Issue Modal */}
      <Modal show={showIssueModal} onHide={() => setShowIssueModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Issue Book</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleIssueBook}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Book</Form.Label>
              <Form.Select name="bookId" value={currentIssue.bookId} onChange={e => setCurrentIssue({...currentIssue, bookId: e.target.value})} required>
                <option value="">Select Book</option>
                {books.filter(b => b.available > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} by {b.author}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select name="studentId" value={currentIssue.studentId} onChange={e => setCurrentIssue({...currentIssue, studentId: e.target.value})} required>
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control type="text" name="remarks" value={currentIssue.remarks} onChange={e => setCurrentIssue({...currentIssue, remarks: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowIssueModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Issue</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Library;
