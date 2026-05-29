import express from "express";
import { 
  HostelRoomController, 
  HostelAllocationController 
} from "../../controllers/facilities/index.ts";

const router = express.Router();

// Rooms
router.post("/rooms", HostelRoomController.createRoom);
router.get("/rooms", HostelRoomController.getAllRooms);
router.get("/rooms/available", HostelRoomController.getAvailableRooms);
router.get("/rooms/:id", HostelRoomController.getRoomById);
router.put("/rooms/:id", HostelRoomController.updateRoom);
router.delete("/rooms/:id", HostelRoomController.deleteRoom);
router.get("/rooms/category/:hostelName", HostelRoomController.getRoomsByHostel);
router.patch("/rooms/:id/status", HostelRoomController.updateRoomStatus);

// Allocations
router.post("/allocations", HostelAllocationController.allocateHostel);
router.get("/allocations", HostelAllocationController.getAllAllocations);
router.get("/allocations/active", HostelAllocationController.getActiveAllocations);
router.get("/allocations/student/:studentId", HostelAllocationController.getStudentAllocation);
router.patch("/allocations/:id/vacate", HostelAllocationController.vacateHostel);
router.patch("/allocations/:id/cancel", HostelAllocationController.cancelAllocation);
router.get("/allocations/:id", HostelAllocationController.getAllocationById);

export default router;
