import express from "express";
import { auth, isUser } from "../middlewares/Auth";
import {
  addItem,
  addNewImages,
  deleteItem,
  deleteItemImages,
  getAllItems,
  getItemById,
  getItemsOfALender,
  updateItem,
} from "../controllers/Item";
import { borrowItem, returnItem } from "../controllers/BorrowItem";

const router = express.Router();

// Add New Item Route
router.post("/create", auth, isUser, addItem);

// Delete Item Route
router.delete("/delete/:itemId", auth, isUser, deleteItem);

// Get Items of a Lender Route
router.get("/getItemsOfALender", auth, getItemsOfALender);

// Get Item by Id Route
router.get("/getItem/:itemId", auth, getItemById);

// Get All Items Route
router.get("/getAllItems", auth, getAllItems);

// Update Item Route
router.put("/update/:itemId", auth, isUser, updateItem);

// Delete Item Image Route
router.delete("/deleteItemImage/:itemId", auth, isUser, deleteItemImages);

// Add New Images Route
router.put("/addNewImages/:itemId", auth, isUser, addNewImages);

// Borrow Item Route
router.post("/borrowItem", auth, isUser, borrowItem);

// Return Item Route
router.put("/returnItem/:itemId", auth, isUser, returnItem);

export default router;
