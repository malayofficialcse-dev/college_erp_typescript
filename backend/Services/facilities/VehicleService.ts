import { IVehicle } from "../../Interfaces/Facilities/Vehicle.ts";
import Vehicle from "../../Models/Facilities/Vehicle.ts";

class VehicleService {
  async createVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
    try {
      const vehicle = new Vehicle(data);
      return await vehicle.save();
    } catch (error) {
      throw new Error(
        `Failed to create vehicle: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getVehicleById(id: string): Promise<IVehicle | null> {
    try {
      return await Vehicle.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to fetch vehicle: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllVehicles(): Promise<IVehicle[]> {
    try {
      return await Vehicle.find();
    } catch (error) {
      throw new Error(
        `Failed to fetch vehicles: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateVehicle(id: string, data: Partial<IVehicle>): Promise<IVehicle | null> {
    try {
      return await Vehicle.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(
        `Failed to update vehicle: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deleteVehicle(id: string): Promise<IVehicle | null> {
    try {
      return await Vehicle.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete vehicle: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getActiveVehicles(): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ status: "ACTIVE" });
    } catch (error) {
      throw new Error(
        `Failed to fetch active vehicles: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateVehicleStatus(id: string, status: string): Promise<IVehicle | null> {
    try {
      return await Vehicle.findByIdAndUpdate(id, { status }, { new: true });
    } catch (error) {
      throw new Error(
        `Failed to update vehicle status: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getVehiclesByType(type: string): Promise<IVehicle[]> {
    try {
      return await Vehicle.find({ vehicleType: type });
    } catch (error) {
      throw new Error(
        `Failed to fetch vehicles by type: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getVehicleByNumber(vehicleNumber: string): Promise<IVehicle | null> {
    try {
      return await Vehicle.findOne({ vehicleNumber });
    } catch (error) {
      throw new Error(
        `Failed to fetch vehicle by number: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new VehicleService();
