import { ITransportAllocation } from "../../Interfaces/Facilities/TransportAllocation.ts";
import TransportAllocation from "../../Models/Facilities/TransportAllocation.ts";

class TransportAllocationService {
  async allocateTransport(data: Partial<ITransportAllocation>): Promise<ITransportAllocation> {
    try {
      const allocation = new TransportAllocation(data);
      return await allocation.save();
    } catch (error) {
      throw new Error(
        `Failed to allocate transport: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllocationById(id: string): Promise<ITransportAllocation | null> {
    try {
      return await TransportAllocation.findById(id)
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch transport allocation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllAllocations(): Promise<ITransportAllocation[]> {
    try {
      return await TransportAllocation.find()
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch transport allocations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getStudentAllocation(studentId: string): Promise<ITransportAllocation | null> {
    try {
      return await TransportAllocation.findOne({
        student: studentId,
        status: "ACTIVE",
      })
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch student allocation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async cancelAllocation(id: string): Promise<ITransportAllocation | null> {
    try {
      return await TransportAllocation.findByIdAndUpdate(
        id,
        { status: "CANCELLED" },
        { new: true }
      )
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to cancel allocation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getActiveAllocations(): Promise<ITransportAllocation[]> {
    try {
      return await TransportAllocation.find({ status: "ACTIVE" })
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch active allocations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRouteAllocations(routeId: string): Promise<ITransportAllocation[]> {
    try {
      return await TransportAllocation.find({ route: routeId, status: "ACTIVE" })
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch route allocations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllocationsByStudent(studentId: string): Promise<ITransportAllocation[]> {
    try {
      return await TransportAllocation.find({ student: studentId })
        .populate("route")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch allocations by student: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new TransportAllocationService();
