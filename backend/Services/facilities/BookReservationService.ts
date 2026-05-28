import { IBookReservation } from "../../Interfaces/Facilities/BookReservation.ts";
import BookReservation from "../../Models/Facilities/BookReservation.ts";

class BookReservationService {
  async createReservation(data: Partial<IBookReservation>): Promise<IBookReservation> {
    try {
      const reservation = new BookReservation(data);
      return await reservation.save();
    } catch (error) {
      throw new Error(
        `Failed to create reservation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getReservationById(id: string): Promise<IBookReservation | null> {
    try {
      return await BookReservation.findById(id)
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to fetch reservation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllReservations(): Promise<IBookReservation[]> {
    try {
      return await BookReservation.find()
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to fetch reservations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateReservation(id: string, data: Partial<IBookReservation>): Promise<IBookReservation | null> {
    try {
      return await BookReservation.findByIdAndUpdate(id, data, { new: true })
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to update reservation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async cancelReservation(id: string): Promise<IBookReservation | null> {
    try {
      return await BookReservation.findByIdAndUpdate(
        id,
        { status: "CANCELLED" },
        { new: true }
      )
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to cancel reservation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async fulfillReservation(id: string): Promise<IBookReservation | null> {
    try {
      return await BookReservation.findByIdAndUpdate(
        id,
        { status: "FULFILLED" },
        { new: true }
      )
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to fulfill reservation: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getPendingReservations(): Promise<IBookReservation[]> {
    try {
      return await BookReservation.find({ status: "PENDING" })
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to fetch pending reservations: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getReservationsByBook(bookId: string): Promise<IBookReservation[]> {
    try {
      return await BookReservation.find({ book: bookId })
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to fetch reservations by book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getReservationsByBorrower(borrowerId: string, borrowerType: string): Promise<IBookReservation[]> {
    try {
      const query: any = { borrowerType };
      if (borrowerType === "STUDENT") {
        query.student = borrowerId;
      } else if (borrowerType === "EMPLOYEE") {
        query.employee = borrowerId;
      }

      return await BookReservation.find(query)
        .populate("book")
        .populate("student")
        .populate("employee");
    } catch (error) {
      throw new Error(
        `Failed to fetch reservations by borrower: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new BookReservationService();
