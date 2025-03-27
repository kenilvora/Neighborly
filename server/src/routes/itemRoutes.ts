import express from "express";
import { auth, isUser } from "../middlewares/Auth";
import {
  addItem,
  deleteItem,
  getAllItems,
  getItemById,
  getItemsOfALender,
  updateItem,
} from "../controllers/Item";
import {
  borrowItem,
  getAllBorrowedItems,
  itemDelivered,
  paymentReceived,
  returnItem,
} from "../controllers/BorrowItem";

const router = express.Router();

// Add New Item Route
router.post("/create", auth, isUser, addItem);

// Delete Item Route
router.delete("/delete/:itemId", auth, isUser, deleteItem);

// Get Items of a Lender Route
router.get("/getItemsOfALender", auth, getItemsOfALender);

// Get Item by Id Route
router.get("/getItem/:itemId", getItemById);

// Get All Items Route
router.get("/getAllItems", getAllItems);

// Update Item Route
router.put("/update/:itemId", auth, isUser, updateItem);

// Borrow Item Route
router.post("/borrowItem", auth, isUser, borrowItem);

// Return Item Route
router.put("/returnItem/:itemId", auth, isUser, returnItem);

// Payment Received Route
router.put("/paymentReceived/:itemId", auth, isUser, paymentReceived);

// Mark Item Delivered Successfully Route
router.put("/itemDelivered/:itemId", auth, isUser, itemDelivered);

// Get All Borrowed Items Route
router.get("/getAllBorrowedItems", auth, isUser, getAllBorrowedItems);

export default router;
