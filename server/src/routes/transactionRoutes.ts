import express from "express";
import { auth, isUser } from "../middlewares/Auth";
import {
  addMoney,
  getAllTransactions,
  verifyPayment,
} from "../controllers/Transaction";

const router = express.Router();

router.get("/getAll", auth, isUser, getAllTransactions);

router.post("/addMoney", auth, isUser, addMoney);

router.post("/verifyPayment", verifyPayment);

export default router;
