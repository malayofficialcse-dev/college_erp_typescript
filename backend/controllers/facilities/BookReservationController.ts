import { Request, Response } from "express";
import BookReservationService from "../../Services/facilities/BookReservationService.ts";

class BookReservationController {
  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservation = await BookReservationService.createReservation(req.body);
      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        data: reservation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create reservation",
      });
    }
  }

  async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      const reservation = await BookReservationService.getReservationById(req.params.id);
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch reservation",
      });
    }
  }

  async getAllReservations(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await BookReservationService.getAllReservations();
      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch reservations",
      });
    }
  }

  async updateReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservation = await BookReservationService.updateReservation(req.params.id, req.body);
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Reservation updated successfully",
        data: reservation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update reservation",
      });
    }
  }

  async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservation = await BookReservationService.cancelReservation(req.params.id);
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Reservation cancelled successfully",
        data: reservation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel reservation",
      });
    }
  }

  async fulfillReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservation = await BookReservationService.fulfillReservation(req.params.id);
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Reservation fulfilled successfully",
        data: reservation,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fulfill reservation",
      });
    }
  }

  async getPendingReservations(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await BookReservationService.getPendingReservations();
      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch pending reservations",
      });
    }
  }

  async getReservationsByStudent(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await BookReservationService.getReservationsByBorrower(req.params.studentId, "STUDENT");
      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch student reservations",
      });
    }
  }
}

export default new BookReservationController();
