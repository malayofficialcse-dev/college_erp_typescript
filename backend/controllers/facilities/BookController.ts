import { Request, Response } from "express";
import BookService from "../../Services/facilities/BookService.ts";

class BookController {
  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const book = await BookService.createBook(req.body);
      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: book,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create book",
      });
    }
  }

  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const book = await BookService.getBookById(req.params.id);
      if (!book) {
        res.status(404).json({
          success: false,
          message: "Book not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch book",
      });
    }
  }

  async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookService.getAllBooks();
      res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch books",
      });
    }
  }

  async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const book = await BookService.updateBook(req.params.id, req.body);
      if (!book) {
        res.status(404).json({
          success: false,
          message: "Book not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: book,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update book",
      });
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const book = await BookService.deleteBook(req.params.id);
      if (!book) {
        res.status(404).json({
          success: false,
          message: "Book not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete book",
      });
    }
  }

  async getAvailableBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookService.getAvailableBooks();
      res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch available books",
      });
    }
  }

  async getBookByCategory(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookService.getBookByCategory(req.params.category);
      res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch books by category",
      });
    }
  }
}

export default new BookController();
