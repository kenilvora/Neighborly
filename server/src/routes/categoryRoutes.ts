import express from "express";
import { auth, isAdmin } from "../middlewares/Auth";
import {
  addCategory,
  deleteCategory,
  getCategories,
} from "../controllers/Category";

const router = express.Router();

// Add Category Route
router.post("/create", auth, isAdmin, addCategory);

// Delete Category Route
router.delete("/delete/:id", auth, isAdmin, deleteCategory);

// Get All Categories Route
router.get("/getAll", getCategories);

export default router;
