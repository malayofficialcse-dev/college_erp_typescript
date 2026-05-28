import { IHostelRoom } from "../../Interfaces/Facilities/HostelRoom.ts";
import HostelRoom from "../../Models/Facilities/HostelRoom.ts";

class HostelRoomService {
  async createRoom(data: Partial<IHostelRoom>): Promise<IHostelRoom> {
    try {
      const room = new HostelRoom(data);
      return await room.save();
    } catch (error) {
      throw new Error(
        `Failed to create hostel room: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRoomById(id: string): Promise<IHostelRoom | null> {
    try {
      return await HostelRoom.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to fetch hostel room: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllRooms(): Promise<IHostelRoom[]> {
    try {
      return await HostelRoom.find();
    } catch (error) {
      throw new Error(
        `Failed to fetch hostel rooms: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateRoom(id: string, data: Partial<IHostelRoom>): Promise<IHostelRoom | null> {
    try {
      return await HostelRoom.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(
        `Failed to update hostel room: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deleteRoom(id: string): Promise<IHostelRoom | null> {
    try {
      return await HostelRoom.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete hostel room: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAvailableRooms(): Promise<IHostelRoom[]> {
    try {
      return await HostelRoom.find({
        status: "AVAILABLE",
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch available rooms: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getRoomsByHostel(hostelName: string): Promise<IHostelRoom[]> {
    try {
      return await HostelRoom.find({ hostelName });
    } catch (error) {
      throw new Error(
        `Failed to fetch rooms by hostel: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateRoomStatus(id: string, status: string): Promise<IHostelRoom | null> {
    try {
      return await HostelRoom.findByIdAndUpdate(id, { status }, { new: true });
    } catch (error) {
      throw new Error(
        `Failed to update room status: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async addOccupant(id: string): Promise<IHostelRoom | null> {
    try {
      const room = await HostelRoom.findById(id);
      if (!room) return null;

      if (room.currentOccupants < room.capacity) {
        return await HostelRoom.findByIdAndUpdate(
          id,
          { $inc: { currentOccupants: 1 } },
          { new: true }
        );
      }

      return room;
    } catch (error) {
      throw new Error(
        `Failed to add occupant: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async removeOccupant(id: string): Promise<IHostelRoom | null> {
    try {
      const room = await HostelRoom.findById(id);
      if (!room) return null;

      if (room.currentOccupants > 0) {
        return await HostelRoom.findByIdAndUpdate(
          id,
          { $inc: { currentOccupants: -1 } },
          { new: true }
        );
      }

      return room;
    } catch (error) {
      throw new Error(
        `Failed to remove occupant: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new HostelRoomService();
