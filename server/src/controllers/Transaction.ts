import { Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import User from "../models/User";

export const getAllTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const transactions = await User.findById(userId)
      .select("transactions -_id")
      .populate({
        path: "transactions",
        populate: [
          {
            path: "lenderId",
            select: "firstName lastName email contactNumber profileImage",
          },
          {
            path: "borrowItemId",
            select: "name price depositAmount",
          },
        ],
      });

    res.status(200).json({
      success: true,
      data: transactions?.transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
