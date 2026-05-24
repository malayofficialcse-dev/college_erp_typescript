import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import api from '../../services/api';

const ExamResults = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchParams, setSearchParams] = useState({ studentId: '', subjectId: '' });
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentResult, setCurrentResult] = useState({
    studentId: '', examId: 1, subjectId: '', marksObtained: '', totalMarks: '', grade: '', gradePoint: '', resultStatus: 'PASS', semester: '', remarks: ''
  });

  useEffect(() => {
    fetchResults();
    fetchStudents();
    fetchSubjects();
  }, [searchParams]);

  const fetchResults = async () => {
    try {
      const response = await api.get('/exam-results', { params: searchParams });
      setResults(response.data.content || response.data);
    } catch (error) {
      console.error('Error fetching exam results:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/search', { params: { size: 100 } });
      setStudents(response.data.content || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects/search', { params: { size: 100 } });
      setSubjects(response.data.content || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentResult({ studentId: searchParams.studentId, examId: 1, subjectId: searchParams.subjectId, marksObtained: '', totalMarks: 100, grade: '', gradePoint: '', resultStatus: 'PASS', semester: '', remarks: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (result) => {
    setIsEdit(true);
    setCurrentResult({
      ...result,
      studentId: result.student?.id || '',
      subjectId: result.subject?.id || '',
      examId: result.exam?.id || 1
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentResult(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...currentResult,
        student: currentResult.studentId ? { id: parseInt(currentResult.studentId) } : null,
        subject: currentResult.subjectId ? { id: parseInt(currentResult.subjectId) } : null,
        exam: currentResult.examId ? { id: parseInt(currentResult.examId) } : { id: 1 } // Dummy exam for now
      };
      
      if (isEdit) {
        await api.put(`/exam-results/${currentResult.id}`, payload);
      } else {
        await api.post('/exam-results', payload);
      }
      setShowModal(false);
      fetchResults();
    } catch (error) {
      console.error('Error saving exam result:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/exam-results/${id}`);
        fetchResults();
      } catch (error) {
        console.error('Error deleting exam result:', error);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Exam Results</h2>
        <Button variant="primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Add Result
        </Button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <Row className="g-3">
            <Col md={4}>
              <Form.Select name="studentId" value={searchParams.studentId} onChange={handleSearchChange}>
                <option value="">All Students</option>
                {students.map(st => <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>)}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select name="subjectId" value={searchParams.subjectId} onChange={handleSearchChange}>
                <option value="">All Subjects</option>
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Status</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(res => (
                <tr key={res.id}>
                  <td className="px-4 fw-bold">{res.student?.firstName} {res.student?.lastName}</td>
                  <td>{res.subject?.name}</td>
                  <td>{res.marksObtained} / {res.totalMarks}</td>
                  <td>{res.grade}</td>
                  <td>
                    <Badge bg={res.resultStatus === 'PASS' ? 'success' : 'danger'}>
                      {res.resultStatus}
                    </Badge>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleOpenEdit(res)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(res.id)}>
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
          <Modal.Title>{isEdit ? 'Edit Result' : 'Add Result'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Student</Form.Label>
                  <Form.Select name="studentId" value={currentResult.studentId} onChange={handleFormChange} required>
                    <option value="">Select Student</option>
                    {students.map(st => <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Subject</Form.Label>
                  <Form.Select name="subjectId" value={currentResult.subjectId} onChange={handleFormChange} required>
                    <option value="">Select Subject</option>
                    {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Marks Obtained</Form.Label>
                  <Form.Control type="number" step="0.1" name="marksObtained" value={currentResult.marksObtained} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Marks</Form.Label>
                  <Form.Control type="number" name="totalMarks" value={currentResult.totalMarks} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Grade</Form.Label>
                  <Form.Control type="text" name="grade" value={currentResult.grade} onChange={handleFormChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Grade Point</Form.Label>
                  <Form.Control type="number" step="0.1" name="gradePoint" value={currentResult.gradePoint} onChange={handleFormChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="resultStatus" value={currentResult.resultStatus} onChange={handleFormChange}>
                    <option value="PASS">Pass</option>
                    <option value="FAIL">Fail</option>
                    <option value="ABSENT">Absent</option>
                    <option value="WITHHELD">Withheld</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Semester Info</Form.Label>
                  <Form.Control type="text" name="semester" value={currentResult.semester} onChange={handleFormChange} placeholder="e.g. Semester I 2025-26" />
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

export default ExamResults;
