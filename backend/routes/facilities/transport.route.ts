import express from "express";
import { 
  VehicleController, 
  TransportRouteController, 
  TransportAllocationController 
} from "../../controllers/facilities/index.ts";

const router = express.Router();

// Vehicles
router.post("/vehicles", VehicleController.createVehicle);
router.get("/vehicles", VehicleController.getAllVehicles);
router.get("/vehicles/:id", VehicleController.getVehicleById);
router.put("/vehicles/:id", VehicleController.updateVehicle);
router.delete("/vehicles/:id", VehicleController.deleteVehicle);

// Routes
router.post("/routes", TransportRouteController.createRoute);
router.get("/routes", TransportRouteController.getAllRoutes);
router.get("/routes/:id", TransportRouteController.getRouteById);
router.put("/routes/:id", TransportRouteController.updateRoute);
router.delete("/routes/:id", TransportRouteController.deleteRoute);

// Allocations
router.post("/allocations", TransportAllocationController.allocateTransport);
router.get("/allocations", TransportAllocationController.getAllAllocations);
router.get("/allocations/active", TransportAllocationController.getActiveAllocations);
router.get("/allocations/student/:studentId", TransportAllocationController.getStudentAllocation);
router.put("/allocations/:id/cancel", TransportAllocationController.cancelAllocation);
router.get("/allocations/:id", TransportAllocationController.getAllocationById);

export default router;
