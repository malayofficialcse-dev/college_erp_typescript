import { Request, Response } from "express";
import TransportAllocationService from "../../Services/facilities/TransportAllocationService.ts";

class TransportAllocationController {
  async allocateTransport(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await TransportAllocationService.allocateTransport(req.body);
      res.status(201).json({
        success: true,
        message: "Transport allocated successfully",
        data: allocation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to allocate transport",
      });
    }
  }

  async getAllocationById(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await TransportAllocationService.getAllocationById(req.params.id);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Transport allocation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: allocation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch transport allocation",
      });
    }
  }

  async getAllAllocations(req: Request, res: Response): Promise<void> {
    try {
      const allocations = await TransportAllocationService.getAllAllocations();
      res.status(200).json({
        success: true,
        data: allocations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch transport allocations",
      });
    }
  }

  async getStudentAllocation(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await TransportAllocationService.getStudentAllocation(req.params.studentId);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Student transport allocation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: allocation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch student allocation",
      });
    }
  }

  async cancelAllocation(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await TransportAllocationService.cancelAllocation(req.params.id);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Transport allocation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Transport allocation cancelled successfully",
        data: allocation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel allocation",
      });
    }
  }

  async getActiveAllocations(req: Request, res: Response): Promise<void> {
    try {
      const allocations = await TransportAllocationService.getActiveAllocations();
      res.status(200).json({
        success: true,
        data: allocations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch active allocations",
      });
    }
  }

  async getRouteAllocations(req: Request, res: Response): Promise<void> {
    try {
      const allocations = await TransportAllocationService.getRouteAllocations(req.params.routeId);
      res.status(200).json({
        success: true,
        data: allocations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch route allocations",
      });
    }
  }
}

export default new TransportAllocationController();
