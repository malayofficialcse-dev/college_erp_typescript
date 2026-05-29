import express from "express";
import { 
  BookController, 
  LibraryIssueController, 
  BookReservationController 
} from "../../controllers/facilities/index.ts";

const router = express.Router();

// Books
router.post("/books", BookController.createBook);
router.get("/books", BookController.getAllBooks);
router.get("/books/available", BookController.getAvailableBooks);
router.get("/books/:id", BookController.getBookById);
router.put("/books/:id", BookController.updateBook);
router.delete("/books/:id", BookController.deleteBook);
router.get("/books/category/:category", BookController.getBookByCategory);

// Issues
router.post("/issues", LibraryIssueController.issueBook);
router.get("/issues", LibraryIssueController.getAllIssues);
router.get("/issues/overdue", LibraryIssueController.getOverdueBooks);
router.get("/issues/student/:studentId", LibraryIssueController.getStudentIssues);
router.patch("/issues/:id/return", LibraryIssueController.returnBook);
router.get("/issues/:id", LibraryIssueController.getIssueById);

// Reservations
router.post("/features/reservations", BookReservationController.createReservation);
router.get("/features/reservations/all", BookReservationController.getAllReservations);
router.get("/features/reservations/:id", BookReservationController.getReservationById);
router.put("/features/reservations/:id/cancel", BookReservationController.cancelReservation);
router.get("/features/reservations/student/:studentId", BookReservationController.getReservationsByStudent);

export default router;
