import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import User from "../models/User";
import { instance } from "../config/razorpay";
import mongoose from "mongoose";
import crypto from "crypto";

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

export const addMoney = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId)
      .select("firstName lastName email")
      .session(session);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!amount || amount <= 0 || isNaN(amount)) {
      res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
      return;
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `${user.firstName}_${amount}_${Date.now()
        .toLocaleString()
        .slice(0, 10)}`,
    };

    try {
      const order = await instance.orders.create(options);

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        data: order,
      });
      return;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in creating order", error);
      res.status(400).json({
        success: false,
        message: "Failed to create order",
      });
      return;
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    session.endSession();
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const shasum = crypto.createHmac("sha256", secret as string);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      res.status(200).json({
        success: true,
        message: "Payment verified",
      });
      return;
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not verified",
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
