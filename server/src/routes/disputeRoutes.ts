import express from "express";
import { auth, isAdmin, isUser } from "../middlewares/Auth";
import {
  changeDisputeStatus,
  createDispute,
  getDisputeById,
  getDisputesCreatedAgainstMe,
  getDisputesCreatedByMe,
} from "../controllers/Dispute";

const router = express.Router();

// Create Dispute Route
router.post("/create", auth, isUser, createDispute);

// Get Dispute Created By Me Route
router.get("/getDisputeCreatedByMe", auth, isUser, getDisputesCreatedByMe);

// Get Dispute Created Against Me Route
router.get("/getDisputeAgainstMe", auth, isUser, getDisputesCreatedAgainstMe);

// Change Dispute Status Route
router.put("/changeDisputeStatus/:id", auth, isAdmin, changeDisputeStatus);

// Get Dispute By Id Route
router.get("/getDispute/:id", auth, getDisputeById);

export default router;
