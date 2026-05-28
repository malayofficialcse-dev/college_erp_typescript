import { IBook } from "../../Interfaces/Facilities/Book.ts";
import Book from "../../Models/Facilities/Book.ts";

class BookService {
  async createBook(data: Partial<IBook>): Promise<IBook> {
    try {
      const book = new Book(data);
      return await book.save();
    } catch (error) {
      throw new Error(
        `Failed to create book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getBookById(id: string): Promise<IBook | null> {
    try {
      return await Book.findById(id);
    } catch (error) {
      throw new Error(
        `Failed to fetch book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAllBooks(): Promise<IBook[]> {
    try {
      return await Book.find();
    } catch (error) {
      throw new Error(
        `Failed to fetch books: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updateBook(id: string, data: Partial<IBook>): Promise<IBook | null> {
    try {
      return await Book.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(
        `Failed to update book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async deleteBook(id: string): Promise<IBook | null> {
    try {
      return await Book.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete book: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getAvailableBooks(): Promise<IBook[]> {
    try {
      return await Book.find({
        status: "AVAILABLE",
        available: { $gt: 0 },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch available books: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getBookByCategory(category: string): Promise<IBook[]> {
    try {
      return await Book.find({ category });
    } catch (error) {
      throw new Error(
        `Failed to fetch books by category: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async decreaseAvailableCount(bookId: string): Promise<IBook | null> {
    try {
      return await Book.findByIdAndUpdate(
        bookId,
        { $inc: { available: -1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(
        `Failed to decrease book count: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async increaseAvailableCount(bookId: string): Promise<IBook | null> {
    try {
      return await Book.findByIdAndUpdate(
        bookId,
        { $inc: { available: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(
        `Failed to increase book count: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default new BookService();
