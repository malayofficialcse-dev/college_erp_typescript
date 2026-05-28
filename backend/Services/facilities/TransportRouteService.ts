import { ITransportRoute } from "../../Interfaces/Facilities/TransportRoute.ts";
import TransportRoute from "../../Models/Facilities/TransportRoute.ts";

class TransportRouteService {
  async createRoute(data: Partial<ITransportRoute>): Promise<ITransportRoute> {
    try {
      const route = new TransportRoute(data);
      return await route.save();
    } catch (error) {
      throw new Error(
        `Failed to create transport route: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRouteById(id: string): Promise<ITransportRoute | null> {
    try {
      return await TransportRoute.findById(id).populate("vehicle");
    } catch (error) {
      throw new Error(
        `Failed to fetch transport route: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllRoutes(): Promise<ITransportRoute[]> {
    try {
      return await TransportRoute.find().populate("vehicle");
    } catch (error) {
      throw new Error(
        `Failed to fetch transport routes: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateRoute(id: string, data: Partial<ITransportRoute>): Promise<ITransportRoute | null> {
    try {
      return await TransportRoute.findByIdAndUpdate(id, data, { new: true }).populate(
        "vehicle"
      );
    } catch (error) {
      throw new Error(
        `Failed to update transport route: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deleteRoute(id: string): Promise<ITransportRoute | null> {
    try {
      return await TransportRoute.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete transport route: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getActiveRoutes(): Promise<ITransportRoute[]> {
    try {
      return await TransportRoute.find({ status: "ACTIVE" }).populate("vehicle");
    } catch (error) {
      throw new Error(
        `Failed to fetch active routes: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRouteByLocation(
    startLocation: string,
    endLocation: string
  ): Promise<ITransportRoute | null> {
    try {
      return await TransportRoute.findOne({
        startLocation,
        endLocation,
      }).populate("vehicle");
    } catch (error) {
      throw new Error(
        `Failed to fetch route by location: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRoutesByStartLocation(startLocation: string): Promise<ITransportRoute[]> {
    try {
      return await TransportRoute.find({ startLocation }).populate("vehicle");
    } catch (error) {
      throw new Error(
        `Failed to fetch routes by start location: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRoutesByVehicle(vehicleId: string): Promise<ITransportRoute[]> {
    try {
      return await TransportRoute.find({ vehicle: vehicleId }).populate("vehicle");
    } catch (error) {
      throw new Error(
        `Failed to fetch routes by vehicle: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new TransportRouteService();
