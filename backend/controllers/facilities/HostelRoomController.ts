import { Request, Response } from "express";
import HostelRoomService from "../../Services/facilities/HostelRoomService.ts";

class HostelRoomController {
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = await HostelRoomService.createRoom(req.body);
      res.status(201).json({
        success: true,
        message: "Hostel room created successfully",
        data: room,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create hostel room",
      });
    }
  }

  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const room = await HostelRoomService.getRoomById(req.params.id);
      if (!room) {
        res.status(404).json({
          success: false,
          message: "Hostel room not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch hostel room",
      });
    }
  }

  async getAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await HostelRoomService.getAllRooms();
      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch hostel rooms",
      });
    }
  }

  async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = await HostelRoomService.updateRoom(req.params.id, req.body);
      if (!room) {
        res.status(404).json({
          success: false,
          message: "Hostel room not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Hostel room updated successfully",
        data: room,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update hostel room",
      });
    }
  }

  async deleteRoom(req: Request, res: Response): Promise<void> {
    try {
      const room = await HostelRoomService.deleteRoom(req.params.id);
      if (!room) {
        res.status(404).json({
          success: false,
          message: "Hostel room not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Hostel room deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete hostel room",
      });
    }
  }

  async getAvailableRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await HostelRoomService.getAvailableRooms();
      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch available rooms",
      });
    }
  }

  async getRoomsByHostel(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await HostelRoomService.getRoomsByHostel(req.params.hostelName);
      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch rooms by hostel",
      });
    }
  }

  async updateRoomStatus(req: Request, res: Response): Promise<void> {
    try {
      const room = await HostelRoomService.updateRoomStatus(req.params.id, req.body.status);
      if (!room) {
        res.status(404).json({
          success: false,
          message: "Hostel room not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Room status updated successfully",
        data: room,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update room status",
      });
    }
  }
}

export default new HostelRoomController();
