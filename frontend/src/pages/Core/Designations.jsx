import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Badge,
} from "react-bootstrap";

import api from "../../services/api";

const Designations = () => {

  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [currentDesignation, setCurrentDesignation] = useState({
    title: "",
    code: "",
    description: "",
    department: "",
    level: 1,
    _id: null,
  });

  // ================= FETCH ALL DEPARTMENTS =================

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // ================= FETCH ALL DESIGNATIONS =================

  const fetchDesignations = async () => {
    try {
      const response = await api.get("/designations");
      setDesignations(response.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  // ================= HANDLE FORM CHANGE =================

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentDesignation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= CREATE / UPDATE DESIGNATION =================

  const handleSaveDesignation = async (e) => {
    e.preventDefault();

    try {
      if (!currentDesignation.code || !currentDesignation.title) {
        throw new Error("Designation code and title are required");
      }

      const payload = {
        title: currentDesignation.title,
        code: currentDesignation.code,
        description: currentDesignation.description,
        department: currentDesignation.department || undefined,
        level: Number(currentDesignation.level),
      };

      if (currentDesignation._id) {
        await api.put(`/designations/${currentDesignation._id}`, payload);
      } else {
        await api.post("/designations", payload);
      }

      setShowModal(false);

      setCurrentDesignation({
        title: "",
        code: "",
        description: "",
        department: "",
        level: 1,
        _id: null,
      });

      setIsEdit(false);
      fetchDesignations();

    } catch (error) {
      console.error("Error saving designation:", error);
      alert(error.response?.data?.message || "Error saving designation");
    }
  };

  // ================= DELETE DESIGNATION =================

  const handleDeleteDesignation = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/designations/${id}`);
      fetchDesignations();
    } catch (error) {
      console.error("Error deleting designation:", error);
    }
  };

  const handleEditDesignation = (designation) => {
    setCurrentDesignation({
      _id: designation._id,
      title: designation.title || "",
      code: designation.code || "",
      description: designation.description || "",
      department: designation.department?._id || designation.department?.id || "",
      level: designation.level || 1,
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleCreateDesignation = () => {
    setCurrentDesignation({
      title: "",
      code: "",
      description: "",
      department: "",
      level: 1,
      _id: null,
    });
    setIsEdit(false);
    setShowModal(true);
  };

  return (
    <div className="container-fluid mt-3">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          Designation Management
        </h2>
        <Button variant="primary" onClick={handleCreateDesignation}>
          Add Designation
        </Button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Department</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {designations.length > 0 ? (
                designations.map((desig) => (
                  <tr key={desig._id}>
                    <td className="fw-bold text-primary">{desig.code}</td>
                    <td>{desig.title}</td>
                    <td>
                      {desig.department ? desig.department.name : <span className="text-muted">Global</span>}
                    </td>
                    <td>{desig.level}</td>
                    <td>
                      <Badge bg={desig.isActive !== false ? "success" : "secondary"}>
                        {desig.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditDesignation(desig)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteDesignation(desig._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No Designations Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
              {isEdit ? "Edit Designation" : "Create Designation"}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSaveDesignation}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Designation Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={currentDesignation.code}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Hierarchy Level</Form.Label>
                  <Form.Control
                    type="number"
                    name="level"
                    value={currentDesignation.level}
                    onChange={handleFormChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Designation Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={currentDesignation.title}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Department (Optional)</Form.Label>
                  <Form.Select
                    name="department"
                    value={currentDesignation.department}
                    onChange={handleFormChange}
                  >
                    <option value="">Global (All Departments)</option>
                    {departments.map(dept => (
                      <option key={dept._id || dept.id} value={dept._id || dept.id}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={currentDesignation.description}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isEdit ? "Save Changes" : "Create Designation"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default Designations;
