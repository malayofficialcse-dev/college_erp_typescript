import { Request, Response } from "express";
import TransportRouteService from "../../Services/facilities/TransportRouteService.ts";

class TransportRouteController {
  async createRoute(req: Request, res: Response): Promise<void> {
    try {
      const route = await TransportRouteService.createRoute(req.body);
      res.status(201).json({
        success: true,
        message: "Transport route created successfully",
        data: route,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create transport route",
      });
    }
  }

  async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const route = await TransportRouteService.getRouteById(req.params.id);
      if (!route) {
        res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: route,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch transport route",
      });
    }
  }

  async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await TransportRouteService.getAllRoutes();
      res.status(200).json({
        success: true,
        data: routes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch transport routes",
      });
    }
  }

  async updateRoute(req: Request, res: Response): Promise<void> {
    try {
      const route = await TransportRouteService.updateRoute(req.params.id, req.body);
      if (!route) {
        res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Transport route updated successfully",
        data: route,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update transport route",
      });
    }
  }

  async deleteRoute(req: Request, res: Response): Promise<void> {
    try {
      const route = await TransportRouteService.deleteRoute(req.params.id);
      if (!route) {
        res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Transport route deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete transport route",
      });
    }
  }

  async getActiveRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await TransportRouteService.getActiveRoutes();
      res.status(200).json({
        success: true,
        data: routes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch active routes",
      });
    }
  }

  async getRouteByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { startLocation, endLocation } = req.params;
      const route = await TransportRouteService.getRouteByLocation(startLocation, endLocation);
      if (!route) {
        res.status(404).json({
          success: false,
          message: "Route not found for given locations",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: route,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch route by location",
      });
    }
  }
}

export default new TransportRouteController();
