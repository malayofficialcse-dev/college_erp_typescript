import { Request, Response } from "express";
import VehicleService from "../../Services/facilities/VehicleService.ts";

class VehicleController {
  async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create vehicle",
      });
    }
  }

  async getVehicleById(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await VehicleService.getVehicleById(req.params.id);
      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch vehicle",
      });
    }
  }

  async getAllVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await VehicleService.getAllVehicles();
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch vehicles",
      });
    }
  }

  async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await VehicleService.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: vehicle,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update vehicle",
      });
    }
  }

  async deleteVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await VehicleService.deleteVehicle(req.params.id);
      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete vehicle",
      });
    }
  }

  async getActiveVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await VehicleService.getActiveVehicles();
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch active vehicles",
      });
    }
  }

  async updateVehicleStatus(req: Request, res: Response): Promise<void> {
    try {
      const vehicle = await VehicleService.updateVehicleStatus(req.params.id, req.body.status);
      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Vehicle status updated successfully",
        data: vehicle,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update vehicle status",
      });
    }
  }

  async getVehiclesByType(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await VehicleService.getVehiclesByType(req.params.type);
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch vehicles by type",
      });
    }
  }
}

export default new VehicleController();
