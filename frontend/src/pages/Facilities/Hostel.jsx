import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import api from '../../services/api';

const Hostel = () => {
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  
  // Room modal state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [isRoomEdit, setIsRoomEdit] = useState(false);
  const [currentRoom, setCurrentRoom] = useState({
    roomNumber: '', roomType: 'DOUBLE', capacity: 2, monthlyRent: '', facilities: '', status: 'AVAILABLE'
  });

  // Allocation modal state
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [currentAlloc, setCurrentAlloc] = useState({
    roomId: '', studentId: '', remarks: ''
  });

  useEffect(() => {
    fetchRooms();
    fetchAllocations();
    fetchStudents();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/hostel/rooms');
      setRooms(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get('/hostel/allocations');
      setAllocations(response.data.content || response.data);
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

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (isRoomEdit) {
        await api.put(`/hostel/rooms/${currentRoom.id}`, currentRoom);
      } else {
        await api.post('/hostel/rooms', currentRoom);
      }
      setShowRoomModal(false);
      fetchRooms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        hostelRoom: { id: parseInt(currentAlloc.roomId) },
        student: { id: parseInt(currentAlloc.studentId) },
        remarks: currentAlloc.remarks
      };
      await api.post('/hostel/allocations', payload);
      setShowAllocModal(false);
      fetchAllocations();
      fetchRooms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVacate = async (id) => {
    if (window.confirm('Vacate student from this room?')) {
      try {
        await api.patch(`/hostel/allocations/${id}/vacate`);
        fetchAllocations();
        fetchRooms();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Hostel Management</h2>
        {activeTab === 'rooms' ? (
          <Button variant="primary" onClick={() => { setIsRoomEdit(false); setCurrentRoom({ roomNumber: '', roomType: 'DOUBLE', capacity: 2, monthlyRent: '', facilities: '', status: 'AVAILABLE' }); setShowRoomModal(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Add Room
          </Button>
        ) : (
          <Button variant="success" onClick={() => { setCurrentAlloc({ roomId: '', studentId: '', remarks: '' }); setShowAllocModal(true); }}>
            <i className="bi bi-person-plus me-2"></i>Allocate Room
          </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="rooms" title="Rooms Inventory">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Room No</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Occupied</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 fw-bold">{r.roomNumber}</td>
                      <td>{r.roomType}</td>
                      <td>{r.capacity}</td>
                      <td>{r.occupied}</td>
                      <td>${r.monthlyRent}</td>
                      <td>
                        <Badge bg={r.status === 'AVAILABLE' ? 'success' : r.status === 'FULL' ? 'danger' : 'warning'}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <Button variant="outline-primary" size="sm" onClick={() => { setIsRoomEdit(true); setCurrentRoom(r); setShowRoomModal(true); }}>
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
        <Tab eventKey="allocations" title="Hostel Allocations">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th>Room No</th>
                    <th>Allocation Date</th>
                    <th>Status</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 fw-bold">{a.student?.firstName} {a.student?.lastName}</td>
                      <td>{a.hostelRoom?.roomNumber}</td>
                      <td>{a.allocationDate}</td>
                      <td>
                        <Badge bg={a.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        {a.status === 'ACTIVE' && (
                          <Button variant="outline-danger" size="sm" onClick={() => handleVacate(a.id)}>
                            Vacate Room
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

      {/* Room Add/Edit Modal */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isRoomEdit ? 'Edit Room' : 'Add Room'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveRoom}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Room Number</Form.Label>
              <Form.Control type="text" name="roomNumber" value={currentRoom.roomNumber} onChange={e => setCurrentRoom({...currentRoom, roomNumber: e.target.value})} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Type</Form.Label>
                  <Form.Select name="roomType" value={currentRoom.roomType} onChange={e => setCurrentRoom({...currentRoom, roomType: e.target.value})}>
                    <option value="SINGLE">Single</option>
                    <option value="DOUBLE">Double</option>
                    <option value="TRIPLE">Triple</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control type="number" name="capacity" value={currentRoom.capacity} onChange={e => setCurrentRoom({...currentRoom, capacity: parseInt(e.target.value)})} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly Rent</Form.Label>
                  <Form.Control type="number" name="monthlyRent" value={currentRoom.monthlyRent} onChange={e => setCurrentRoom({...currentRoom, monthlyRent: parseFloat(e.target.value)})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={currentRoom.status} onChange={e => setCurrentRoom({...currentRoom, status: e.target.value})}>
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="FULL">Full</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Facilities</Form.Label>
              <Form.Control type="text" name="facilities" value={currentRoom.facilities} onChange={e => setCurrentRoom({...currentRoom, facilities: e.target.value})} placeholder="e.g. AC, Wifi, Attached Bathroom" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoomModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Allocation Modal */}
      <Modal show={showAllocModal} onHide={() => setShowAllocModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Allocate Room</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAllocate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Available Room</Form.Label>
              <Form.Select name="roomId" value={currentAlloc.roomId} onChange={e => setCurrentAlloc({...currentAlloc, roomId: e.target.value})} required>
                <option value="">Select Room</option>
                {rooms.filter(r => r.status === 'AVAILABLE').map(r => (
                  <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType} - {r.capacity - r.occupied} left)</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select name="studentId" value={currentAlloc.studentId} onChange={e => setCurrentAlloc({...currentAlloc, studentId: e.target.value})} required>
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control type="text" name="remarks" value={currentAlloc.remarks} onChange={e => setCurrentAlloc({...currentAlloc, remarks: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAllocModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Allocate</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Hostel;
