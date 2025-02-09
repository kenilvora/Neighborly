import express from "express";
import { auth, isUser } from "../middlewares/Auth";
import { getAllTransactions } from "../controllers/Transaction";

const router = express.Router();

router.get("/", auth, isUser, getAllTransactions);

export default router;
