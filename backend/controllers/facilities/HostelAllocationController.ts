import { Request, Response } from "express";
import HostelAllocationService from "../../Services/facilities/HostelAllocationService.ts";

class HostelAllocationController {
  async allocateHostel(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await HostelAllocationService.allocateHostel(req.body);
      res.status(201).json({
        success: true,
        message: "Hostel allocated successfully",
        data: allocation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to allocate hostel",
      });
    }
  }

  async getAllocationById(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await HostelAllocationService.getAllocationById(req.params.id);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Hostel allocation not found",
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
        message: error instanceof Error ? error.message : "Failed to fetch hostel allocation",
      });
    }
  }

  async getAllAllocations(req: Request, res: Response): Promise<void> {
    try {
      const allocations = await HostelAllocationService.getAllAllocations();
      res.status(200).json({
        success: true,
        data: allocations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch hostel allocations",
      });
    }
  }

  async getStudentAllocation(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await HostelAllocationService.getStudentAllocation(req.params.studentId);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Student allocation not found",
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

  async vacateHostel(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await HostelAllocationService.vacateHostel(req.params.id, req.body.vacateDate);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Hostel allocation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Hostel vacated successfully",
        data: allocation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to vacate hostel",
      });
    }
  }

  async cancelAllocation(req: Request, res: Response): Promise<void> {
    try {
      const allocation = await HostelAllocationService.cancelAllocation(req.params.id);
      if (!allocation) {
        res.status(404).json({
          success: false,
          message: "Hostel allocation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Allocation cancelled successfully",
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
      const allocations = await HostelAllocationService.getActiveAllocations();
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
}

export default new HostelAllocationController();
