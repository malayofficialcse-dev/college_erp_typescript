import { ILibraryIssue } from "../../Interfaces/Facilities/LibraryIssue.ts";
import LibraryIssue from "../../Models/Facilities/LibraryIssue.ts";
import BookService from "./BookService.ts";

class LibraryIssueService {
  async issueBook(data: Partial<ILibraryIssue>): Promise<ILibraryIssue> {
    try {
      const issue = new LibraryIssue(data);
      const savedIssue = await issue.save();
      
      // Decrease available book count
      if (data.book) {
        await BookService.decreaseAvailableCount(data.book.toString());
      }
      
      return savedIssue;
    } catch (error) {
      throw new Error(
        `Failed to issue book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async returnBook(id: string, data: { returnDate?: Date; fineAmount?: number }): Promise<ILibraryIssue | null> {
    try {
      const issue = await LibraryIssue.findById(id);
      if (!issue) return null;

      // Calculate fine if overdue
      const dueDate = new Date(issue.dueDate);
      const returnDate = data.returnDate || new Date();
      const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      const fineAmount = daysOverdue > 0 ? daysOverdue * 10 : 0;

      const updatedIssue = await LibraryIssue.findByIdAndUpdate(
        id,
        {
          returnDate: returnDate,
          fineAmount: data.fineAmount || fineAmount,
          status: "RETURNED",
        },
        { new: true }
      );

      // Increase available book count
      if (issue.book) {
        await BookService.increaseAvailableCount(issue.book.toString());
      }

      return updatedIssue;
    } catch (error) {
      throw new Error(
        `Failed to return book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getIssueById(id: string): Promise<ILibraryIssue | null> {
    try {
      return await LibraryIssue.findById(id)
        .populate("book")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch issue: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllIssues(): Promise<ILibraryIssue[]> {
    try {
      return await LibraryIssue.find()
        .populate("book")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch issues: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getStudentIssues(studentId: string): Promise<ILibraryIssue[]> {
    try {
      return await LibraryIssue.find({ student: studentId })
        .populate("book")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch student issues: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getOverdueBooks(): Promise<ILibraryIssue[]> {
    try {
      const now = new Date();
      return await LibraryIssue.find({
        dueDate: { $lt: now },
        status: { $ne: "RETURNED" },
      })
        .populate("book")
        .populate("student");
    } catch (error) {
      throw new Error(
        `Failed to fetch overdue books: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateFine(id: string, fineAmount: number): Promise<ILibraryIssue | null> {
    try {
      return await LibraryIssue.findByIdAndUpdate(
        id,
        { fineAmount },
        { new: true }
      );
    } catch (error) {
      throw new Error(
        `Failed to update fine: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async markAsLost(id: string): Promise<ILibraryIssue | null> {
    try {
      const issue = await LibraryIssue.findByIdAndUpdate(
        id,
        { status: "LOST" },
        { new: true }
      );

      // Don't increase book count if marked as lost
      return issue;
    } catch (error) {
      throw new Error(
        `Failed to mark as lost: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new LibraryIssueService();
