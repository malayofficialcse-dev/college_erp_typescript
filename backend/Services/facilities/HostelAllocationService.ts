import { IHostelAllocation } from "../../Interfaces/Facilities/HostelAllocation.ts";
import HostelAllocation from "../../Models/Facilities/HostelAllocation.ts";
import HostelRoomService from "./HostelRoomService.ts";

class HostelAllocationService {
  async allocateHostel(data: Partial<IHostelAllocation>): Promise<IHostelAllocation> {
    try {
      const allocation = new HostelAllocation(data);
      const savedAllocation = await allocation.save();

      // Add occupant to room
      if (data.hostelRoom) {
        await HostelRoomService.addOccupant(data.hostelRoom.toString());
      }

      return savedAllocation;
    } catch (error) {
      throw new Error(
        `Failed to allocate hostel: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllocationById(id: string): Promise<IHostelAllocation | null> {
    try {
      return await HostelAllocation.findById(id)
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch hostel allocation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllAllocations(): Promise<IHostelAllocation[]> {
    try {
      return await HostelAllocation.find()
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch hostel allocations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getStudentAllocation(studentId: string): Promise<IHostelAllocation | null> {
    try {
      return await HostelAllocation.findOne({
        student: studentId,
        status: "ACTIVE",
      })
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch student allocation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async vacateHostel(id: string, vacateDate: Date): Promise<IHostelAllocation | null> {
    try {
      const allocation = await HostelAllocation.findById(id);
      if (!allocation) return null;

      // Remove occupant from room
      if (allocation.hostelRoom) {
        await HostelRoomService.removeOccupant(allocation.hostelRoom.toString());
      }

      return await HostelAllocation.findByIdAndUpdate(
        id,
        {
          vacateDate,
          status: "VACATED",
        },
        { new: true }
      )
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to vacate hostel: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async cancelAllocation(id: string): Promise<IHostelAllocation | null> {
    try {
      const allocation = await HostelAllocation.findById(id);
      if (!allocation) return null;

      // Remove occupant from room
      if (allocation.hostelRoom) {
        await HostelRoomService.removeOccupant(allocation.hostelRoom.toString());
      }

      return await HostelAllocation.findByIdAndUpdate(
        id,
        { status: "CANCELLED" },
        { new: true }
      )
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to cancel allocation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getActiveAllocations(): Promise<IHostelAllocation[]> {
    try {
      return await HostelAllocation.find({ status: "ACTIVE" })
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch active allocations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllocationsByRoom(roomId: string): Promise<IHostelAllocation[]> {
    try {
      return await HostelAllocation.find({ hostelRoom: roomId })
        .populate("hostelRoom")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch allocations by room: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new HostelAllocationService();
