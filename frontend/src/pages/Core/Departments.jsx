// import React, { useState, useEffect } from 'react';
// import { Table, Button, Modal, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
// import api from '../../services/api';

// const Departments = () => {
//   const [departments, setDepartments] = useState([]);
//   const [totalPages, setTotalPages] = useState(0);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [searchParams, setSearchParams] = useState({
//     status: '',
//     keyword: ''
//   });

//   const [showModal, setShowModal] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [currentDepartment, setCurrentDepartment] = useState({
//     name: '',
//     code: '',
//     description: '',
//     establishedYear: '',
//     status: 'ACTIVE'
//   });

//   useEffect(() => {
//     fetchDepartments();
//   }, [currentPage, searchParams]);

//   const fetchDepartments = async () => {
//     try {
//       const response = await api.get('localhost:5000/api/v1/', {
//         params: { ...searchParams, page: currentPage, size: 10 }
//       });
//       setDepartments(response.data.content || response.data); // Support pagination or raw list
//       setTotalPages(response.data.totalPages || 1);
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//     }
//   };

//   const handleSearchChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams(prev => ({ ...prev, [name]: value }));
//     setCurrentPage(0);
//   };

//   const handleOpenAddModal = () => {
//     setIsEdit(false);
//     setCurrentDepartment({
//       name: '', code: '', description: '', establishedYear: '', status: 'ACTIVE'
//     });
//     setShowModal(true);
//   };

//   const handleOpenEditModal = (department) => {
//     setIsEdit(true);
//     setCurrentDepartment({
//       ...department
//     });
//     setShowModal(true);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentDepartment(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSaveDepartment = async (e) => {
//     e.preventDefault();
//     try {
//       // Sanitize payload: convert empty strings to null for numeric fields,
//       // and strip nested entity objects (hod) to avoid deserialization errors.
//       const payload = {
//         name: currentDepartment.name,
//         code: currentDepartment.code || null,
//         description: currentDepartment.description || null,
//         establishedYear: currentDepartment.establishedYear !== '' && currentDepartment.establishedYear != null
//           ? parseInt(currentDepartment.establishedYear, 10)
//           : null,
//         status: currentDepartment.status,
//       };
//       if (isEdit) {
//         await api.put(`/departments/${currentDepartment.id}`, payload);
//       } else {
//         await api.post('/departments', payload);
//       }
//       setShowModal(false);
//       fetchDepartments();
//     } catch (error) {
//       console.error('Error saving department:', error);
//     }
//   };

//   const handleDeleteDepartment = async (id) => {
//     if (window.confirm('Are you sure you want to delete this department?')) {
//       try {
//         await api.delete(`/departments/${id}`);
//         fetchDepartments();
//       } catch (error) {
//         console.error('Error deleting department:', error);
//       }
//     }
//   };

//   return (
//     <div className="container-fluid">
//       <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
//         <h2 className="text-dark fw-bold mb-0">Department Management</h2>
//         <Button variant="primary" className="shadow-sm rounded-pill px-4 py-2 fw-semibold" onClick={handleOpenAddModal}>
//           <i className="bi bi-plus-lg me-2"></i>Add Department
//         </Button>
//       </div>

//       <div className="card glass-panel mb-4">
//         <div className="card-body">
//           <Row className="g-3">
//             <Col md={6}>
//               <Form.Control type="text" placeholder="Search by name, code..." name="keyword" value={searchParams.keyword} onChange={handleSearchChange} className="rounded-3" />
//             </Col>
//             <Col md={6}>
//               <Form.Select name="status" value={searchParams.status} onChange={handleSearchChange} className="rounded-3">
//                 <option value="">All Statuses</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="INACTIVE">Inactive</option>
//               </Form.Select>
//             </Col>
//           </Row>
//         </div>
//       </div>

//       <div className="card glass-panel shadow-sm">
//         <div className="card-body p-0">
//           <Table responsive hover className="mb-0 align-middle">
//             <thead className="bg-light">
//               <tr>
//                 <th className="px-4 py-3">Code</th>
//                 <th>Name</th>
//                 <th>Description</th>
//                 <th>Est. Year</th>
//                 <th>Status</th>
//                 <th className="text-end px-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {departments.length > 0 ? departments.map(dept => (
//                 <tr key={dept.id}>
//                   <td className="px-4 fw-bold text-primary">{dept.code}</td>
//                   <td className="fw-semibold text-dark">{dept.name}</td>
//                   <td>
//                     <div className="text-truncate" style={{ maxWidth: '250px' }} title={dept.description}>
//                       {dept.description || 'N/A'}
//                     </div>
//                   </td>
//                   <td>{dept.establishedYear || 'N/A'}</td>
//                   <td>
//                     <Badge bg={dept.status === 'ACTIVE' ? 'success' : 'secondary'} className="rounded-pill px-3 py-1">
//                       {dept.status}
//                     </Badge>
//                   </td>
//                   <td className="text-end px-4">
//                     <Button variant="light" size="sm" className="me-2 text-primary shadow-sm" onClick={() => handleOpenEditModal(dept)}>
//                       <i className="bi bi-pencil-square"></i>
//                     </Button>
//                     <Button variant="light" size="sm" className="text-danger shadow-sm" onClick={() => handleDeleteDepartment(dept.id)}>
//                       <i className="bi bi-trash-fill"></i>
//                     </Button>
//                   </td>
//                 </tr>
//               )) : (
//                 <tr><td colSpan="6" className="text-center py-5 text-muted"><i className="bi bi-building fs-2 d-block mb-2"></i>No departments found.</td></tr>
//               )}
//             </tbody>
//           </Table>
//         </div>
//       </div>

//       {totalPages > 1 && (
//         <div className="d-flex justify-content-center mt-4">
//           <Pagination className="shadow-sm">
//             <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} />
//             {[...Array(totalPages).keys()].map(page => (
//               <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>
//                 {page + 1}
//               </Pagination.Item>
//             ))}
//             <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)} />
//           </Pagination>
//         </div>
//       )}

//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
//         <Modal.Header closeButton className="border-0 bg-light">
//           <Modal.Title className="fw-bold">{isEdit ? 'Edit Department' : 'Create Department'}</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSaveDepartment}>
//           <Modal.Body className="px-4 py-4">
//             <Row className="g-4">
//               <Col md={4}>
//                 <Form.Group>
//                   <Form.Label className="text-muted small fw-bold">Department Code</Form.Label>
//                   <Form.Control type="text" name="code" value={currentDepartment.code} onChange={handleFormChange} required className="rounded-3" />
//                 </Form.Group>
//               </Col>
//               <Col md={8}>
//                 <Form.Group>
//                   <Form.Label className="text-muted small fw-bold">Department Name</Form.Label>
//                   <Form.Control type="text" name="name" value={currentDepartment.name} onChange={handleFormChange} required className="rounded-3" />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label className="text-muted small fw-bold">Established Year</Form.Label>
//                   <Form.Control type="number" name="establishedYear" value={currentDepartment.establishedYear} onChange={handleFormChange} className="rounded-3" />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label className="text-muted small fw-bold">Status</Form.Label>
//                   <Form.Select name="status" value={currentDepartment.status} onChange={handleFormChange} className="rounded-3">
//                     <option value="ACTIVE">Active</option>
//                     <option value="INACTIVE">Inactive</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={12}>
//                 <Form.Group>
//                   <Form.Label className="text-muted small fw-bold">Description</Form.Label>
//                   <Form.Control as="textarea" rows={3} name="description" value={currentDepartment.description} onChange={handleFormChange} className="rounded-3" />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Modal.Body>
//           <Modal.Footer className="border-0 bg-light">
//             <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">Cancel</Button>
//             <Button variant="primary" type="submit" className="rounded-pill px-4 shadow-sm">{isEdit ? 'Save Changes' : 'Create Department'}</Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default Departments;



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

const Departments = () => {

  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [currentDepartment, setCurrentDepartment] = useState({
    name: "",
    code: "",
    estdYear: "",
  });

  // ================= FETCH ALL DEPARTMENTS =================

  const fetchDepartments = async () => {
    try {

      const response = await api.get("/departments");

      console.log(response.data);

      setDepartments(response.data);

    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ================= HANDLE FORM CHANGE =================

  const handleFormChange = (e) => {

    const { name, value } = e.target;

    setCurrentDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= CREATE DEPARTMENT =================

  const handleSaveDepartment = async (e) => {

    e.preventDefault();

    try {

      await api.post("/departments", currentDepartment);

      setShowModal(false);

      setCurrentDepartment({
        name: "",
        code: "",
        estdYear: "",
      });

      fetchDepartments();

    } catch (error) {
      console.error("Error creating department:", error);
    }
  };

  // ================= DELETE DEPARTMENT =================

  const handleDeleteDepartment = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    try {

      await api.delete(`/departments/${id}`);

      fetchDepartments();

    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  return (
    <div className="container-fluid mt-3">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          Department Management
        </h2>

        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          Add Department
        </Button>

      </div>

      {/* TABLE */}

      <div className="card shadow-sm">

        <div className="card-body p-0">

          <Table responsive hover className="mb-0">

            <thead className="table-light">

              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Established Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {departments.length > 0 ? (

                departments.map((dept) => (

                  <tr key={dept._id}>

                    <td className="fw-bold text-primary">
                      {dept.code}
                    </td>

                    <td>
                      {dept.name}
                    </td>

                    <td>
                      {dept.estdYear}
                    </td>

                    <td>

                      <Badge bg="success">
                        Active
                      </Badge>

                    </td>

                    <td>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleDeleteDepartment(dept._id)
                        }
                      >
                        Delete
                      </Button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-4"
                  >
                    No Departments Found
                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </div>

      </div>

      {/* MODAL */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Create Department
          </Modal.Title>

        </Modal.Header>

        <Form onSubmit={handleSaveDepartment}>

          <Modal.Body>

            <Row className="g-3">

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Department Code
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="code"
                    value={currentDepartment.code}
                    onChange={handleFormChange}
                    required
                  />

                </Form.Group>

              </Col>

              <Col md={6}>

                <Form.Group>

                  <Form.Label>
                    Established Year
                  </Form.Label>

                  <Form.Control
                    type="number"
                    name="estdYear"
                    value={currentDepartment.estdYear}
                    onChange={handleFormChange}
                    required
                  />

                </Form.Group>

              </Col>

              <Col md={12}>

                <Form.Group>

                  <Form.Label>
                    Department Name
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="name"
                    value={currentDepartment.name}
                    onChange={handleFormChange}
                    required
                  />

                </Form.Group>

              </Col>

            </Row>

          </Modal.Body>

          <Modal.Footer>

            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
            >
              Create Department
            </Button>

          </Modal.Footer>

        </Form>

      </Modal>

    </div>
  );
};

export default Departments;
