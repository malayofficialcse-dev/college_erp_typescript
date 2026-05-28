import { Request, Response } from "express";
import LibraryIssueService from "../../Services/facilities/LibraryIssueService.ts";

class LibraryIssueController {
  async issueBook(req: Request, res: Response): Promise<void> {
    try {
      const issue = await LibraryIssueService.issueBook(req.body);
      res.status(201).json({
        success: true,
        message: "Book issued successfully",
        data: issue,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to issue book",
      });
    }
  }

  async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const issue = await LibraryIssueService.returnBook(req.params.id, req.body);
      if (!issue) {
        res.status(404).json({
          success: false,
          message: "Library issue not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Book returned successfully",
        data: issue,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to return book",
      });
    }
  }

  async getIssueById(req: Request, res: Response): Promise<void> {
    try {
      const issue = await LibraryIssueService.getIssueById(req.params.id);
      if (!issue) {
        res.status(404).json({
          success: false,
          message: "Library issue not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: issue,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch issue",
      });
    }
  }

  async getAllIssues(req: Request, res: Response): Promise<void> {
    try {
      const issues = await LibraryIssueService.getAllIssues();
      res.status(200).json({
        success: true,
        data: issues,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch issues",
      });
    }
  }

  async getStudentIssues(req: Request, res: Response): Promise<void> {
    try {
      const issues = await LibraryIssueService.getStudentIssues(req.params.studentId);
      res.status(200).json({
        success: true,
        data: issues,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch student issues",
      });
    }
  }

  async getOverdueBooks(req: Request, res: Response): Promise<void> {
    try {
      const issues = await LibraryIssueService.getOverdueBooks();
      res.status(200).json({
        success: true,
        data: issues,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch overdue books",
      });
    }
  }

  async updateFine(req: Request, res: Response): Promise<void> {
    try {
      const issue = await LibraryIssueService.updateFine(req.params.id, req.body.fineAmount);
      if (!issue) {
        res.status(404).json({
          success: false,
          message: "Library issue not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Fine updated successfully",
        data: issue,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update fine",
      });
    }
  }
}

export default new LibraryIssueController();
