import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge, Tabs, Tab } from 'react-bootstrap';
import api from '../../services/api';

const Transport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');

  // Vehicle Modal State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [isVehicleEdit, setIsVehicleEdit] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState({
    vehicleNumber: '', vehicleType: 'BUS', capacity: 40, driverName: '', driverPhone: '', status: 'ACTIVE'
  });

  // Route Modal State
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [isRouteEdit, setIsRouteEdit] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({
    routeName: '', startLocation: '', endLocation: '', stops: '', routeCost: ''
  });

  // Allocation Modal State
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [currentAlloc, setCurrentAlloc] = useState({
    routeId: '', studentId: '', pickupPoint: '', status: 'ACTIVE'
  });

  useEffect(() => {
    fetchVehicles();
    fetchRoutes();
    fetchAllocations();
    fetchStudents();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/transport/vehicles');
      setVehicles(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/transport/routes');
      setRoutes(response.data.content || response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get('/transport/allocations');
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

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      if (isVehicleEdit) {
        await api.put(`/transport/vehicles/${currentVehicle.id}`, currentVehicle);
      } else {
        await api.post('/transport/vehicles', currentVehicle);
      }
      setShowVehicleModal(false);
      fetchVehicles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      if (isRouteEdit) {
        await api.put(`/transport/routes/${currentRoute.id}`, currentRoute);
      } else {
        await api.post('/transport/routes', currentRoute);
      }
      setShowRouteModal(false);
      fetchRoutes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        transportRoute: { id: parseInt(currentAlloc.routeId) },
        student: { id: parseInt(currentAlloc.studentId) },
        pickupPoint: currentAlloc.pickupPoint,
        status: currentAlloc.status
      };
      await api.post('/transport/allocations', payload);
      setShowAllocModal(false);
      fetchAllocations();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/transport/allocations/${id}/status?status=${status}`);
      fetchAllocations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Transport Management</h2>
        {activeTab === 'vehicles' && (
          <Button variant="primary" onClick={() => { setIsVehicleEdit(false); setCurrentVehicle({ vehicleNumber: '', vehicleType: 'BUS', capacity: 40, driverName: '', driverPhone: '', status: 'ACTIVE' }); setShowVehicleModal(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Add Vehicle
          </Button>
        )}
        {activeTab === 'routes' && (
          <Button variant="primary" onClick={() => { setIsRouteEdit(false); setCurrentRoute({ routeName: '', startLocation: '', endLocation: '', stops: '', routeCost: '' }); setShowRouteModal(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Add Route
          </Button>
        )}
        {activeTab === 'allocations' && (
          <Button variant="success" onClick={() => { setCurrentAlloc({ routeId: '', studentId: '', pickupPoint: '', status: 'ACTIVE' }); setShowAllocModal(true); }}>
            <i className="bi bi-plus-lg me-2"></i>Allocate Transport
          </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} className="mb-4">
        <Tab eventKey="vehicles" title="Vehicles">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Vehicle Number</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Driver Name</th>
                    <th>Driver Phone</th>
                    <th>Status</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v.id}>
                      <td className="px-4 fw-bold">{v.vehicleNumber}</td>
                      <td>{v.vehicleType}</td>
                      <td>{v.capacity}</td>
                      <td>{v.driverName}</td>
                      <td>{v.driverPhone}</td>
                      <td>
                        <Badge bg={v.status === 'ACTIVE' ? 'success' : 'danger'}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        <Button variant="outline-primary" size="sm" onClick={() => { setIsVehicleEdit(true); setCurrentVehicle(v); setShowVehicleModal(true); }}>
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
        <Tab eventKey="routes" title="Routes">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Route Name</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Stops</th>
                    <th>Cost</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 fw-bold">{r.routeName}</td>
                      <td>{r.startLocation}</td>
                      <td>{r.endLocation}</td>
                      <td>{r.stops}</td>
                      <td>${r.routeCost}</td>
                      <td className="text-end px-4">
                        <Button variant="outline-primary" size="sm" onClick={() => { setIsRouteEdit(true); setCurrentRoute(r); setShowRouteModal(true); }}>
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
        <Tab eventKey="allocations" title="Allocations">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th>Route</th>
                    <th>Pickup Point</th>
                    <th>Status</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 fw-bold">{a.student?.firstName} {a.student?.lastName}</td>
                      <td>{a.transportRoute?.routeName}</td>
                      <td>{a.pickupPoint}</td>
                      <td>
                        <Badge bg={a.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="text-end px-4">
                        {a.status === 'ACTIVE' ? (
                          <Button variant="outline-danger" size="sm" onClick={() => handleUpdateStatus(a.id, 'INACTIVE')}>
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="outline-success" size="sm" onClick={() => handleUpdateStatus(a.id, 'ACTIVE')}>
                            Activate
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

      {/* Vehicle Modal */}
      <Modal show={showVehicleModal} onHide={() => setShowVehicleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isVehicleEdit ? 'Edit Vehicle' : 'Add Vehicle'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveVehicle}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Vehicle Number</Form.Label>
              <Form.Control type="text" name="vehicleNumber" value={currentVehicle.vehicleNumber} onChange={e => setCurrentVehicle({...currentVehicle, vehicleNumber: e.target.value})} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="vehicleType" value={currentVehicle.vehicleType} onChange={e => setCurrentVehicle({...currentVehicle, vehicleType: e.target.value})}>
                    <option value="BUS">Bus</option>
                    <option value="VAN">Van</option>
                    <option value="MINIBUS">Mini Bus</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control type="number" name="capacity" value={currentVehicle.capacity} onChange={e => setCurrentVehicle({...currentVehicle, capacity: parseInt(e.target.value)})} required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Driver Name</Form.Label>
                  <Form.Control type="text" name="driverName" value={currentVehicle.driverName} onChange={e => setCurrentVehicle({...currentVehicle, driverName: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Driver Phone</Form.Label>
                  <Form.Control type="text" name="driverPhone" value={currentVehicle.driverPhone} onChange={e => setCurrentVehicle({...currentVehicle, driverPhone: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Route Modal */}
      <Modal show={showRouteModal} onHide={() => setShowRouteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isRouteEdit ? 'Edit Route' : 'Add Route'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveRoute}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Route Name</Form.Label>
              <Form.Control type="text" name="routeName" value={currentRoute.routeName} onChange={e => setCurrentRoute({...currentRoute, routeName: e.target.value})} required />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Location</Form.Label>
                  <Form.Control type="text" name="startLocation" value={currentRoute.startLocation} onChange={e => setCurrentRoute({...currentRoute, startLocation: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Location</Form.Label>
                  <Form.Control type="text" name="endLocation" value={currentRoute.endLocation} onChange={e => setCurrentRoute({...currentRoute, endLocation: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Stops (comma separated)</Form.Label>
              <Form.Control type="text" name="stops" value={currentRoute.stops} onChange={e => setCurrentRoute({...currentRoute, stops: e.target.value})} placeholder="Stop A, Stop B, Stop C" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Route Cost</Form.Label>
              <Form.Control type="number" name="routeCost" value={currentRoute.routeCost} onChange={e => setCurrentRoute({...currentRoute, routeCost: parseFloat(e.target.value)})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRouteModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Allocation Modal */}
      <Modal show={showAllocModal} onHide={() => setShowAllocModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Allocate Transport</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAllocate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Route</Form.Label>
              <Form.Select name="routeId" value={currentAlloc.routeId} onChange={e => setCurrentAlloc({...currentAlloc, routeId: e.target.value})} required>
                <option value="">Select Route</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeName} (${r.routeCost})</option>
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
              <Form.Label>Pickup Point</Form.Label>
              <Form.Control type="text" name="pickupPoint" value={currentAlloc.pickupPoint} onChange={e => setCurrentAlloc({...currentAlloc, pickupPoint: e.target.value})} required />
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

export default Transport;
