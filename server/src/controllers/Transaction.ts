import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import User from "../models/User";
import { instance } from "../config/razorpay";
import mongoose from "mongoose";
import crypto from "crypto";
import clients from "../connections";
import { IRatings, IUserDetails } from "@kenil_vora/neighborly";
import getAvgRating from "../utils/getAverageRating";
import Transaction from "../models/Transaction";

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
        options: {
          sort: {
            createdAt: -1,
          },
        },
        populate: [
          {
            path: "payeeId",
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
    console.log("Error in getAllTransactions", error);
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
      notes: {
        user: userId?.toString()!,
      },
    };

    try {
      const order = await instance.orders.create(options);

      await session.commitTransaction();

      const userSocket = clients.get(userId?.toString()!);

      userSocket?.send("Payment initiated");

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
    console.log("Error in addMoney", error);
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("Razorpay webhook secret not configured");
    }

    const rawBody = (req as any).body;
    const bodyStr =
      rawBody instanceof Buffer
        ? rawBody.toString("utf8")
        : JSON.stringify(rawBody);

    // Compute signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(bodyStr);
    const digest = shasum.digest("hex");

    const userId = req.body.payload.payment.entity.notes.user;

    const userSocket = clients.get(userId);

    if (digest === req.headers["x-razorpay-signature"]) {
      const uuid = new mongoose.Types.ObjectId(userId as string);

      const oldTransaction = await Transaction.findOne({
        paymentId: req.body.payload.payment.entity.id,
      }).session(session);

      if (oldTransaction) {
        const message = {
          success: false,
          type: "payment",
          message: "Invalid payment",
        };

        userSocket?.send(JSON.stringify(message));

        await session.abortTransaction();

        res.status(400).json({
          success: false,
          message: "Payment already verified",
        });
        return;
      }

      const transaction = await Transaction.create(
        [
          {
            payerId: uuid,
            transactionType: "Add Funds",
            amount: req.body.payload.payment.entity.amount / 100,
            paymentId: req.body.payload.payment.entity.id,
            status: "Completed",
            payeeId: req.body.payload.payment.entity.notes.payee || null,
            borrowItemId:
              req.body.payload.payment.entity.notes.borrowItem || null,
          },
        ],
        { session }
      );

      const user = await User.findById(uuid)
        .select(
          "firstName lastName email contactNumber address profileImage transactions ratingAndReviews upiId upiIdVerified accountBalance twoFactorAuth"
        )
        .populate({
          path: "address",
          select: "-userId",
        })
        .populate<{ ratingAndReviews: IRatings[] }>({
          path: "ratingAndReviews",
          select: "rating",
        })
        .session(session);

      if (!user) {
        const message = {
          success: false,
          type: "payment",
          message: "Payment not verified",
        };

        userSocket?.send(JSON.stringify(message));

        await session.abortTransaction();
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      user.accountBalance += req.body.payload.payment.entity.amount / 100;
      user.transactions.push(transaction[0]._id);

      await user.save({ session });

      const updatedUser = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
        address: user.address,
        profileImage: user.profileImage,
        ratingAndReviews: user.ratingAndReviews,
        upiId: user.upiId,
        upiIdVerified: user.upiIdVerified,
        accountBalance: user.accountBalance,
        twoFactorAuth: user.twoFactorAuth,
        avgRating: getAvgRating(user.ratingAndReviews),
      };

      const message = {
        success: true,
        type: "payment",
        message: "Payment verified",
        user: updatedUser,
      };

      userSocket?.send(JSON.stringify(message));

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: "Payment verified",
      });
      return;
    } else {
      await session.abortTransaction();

      const message = {
        success: false,
        type: "payment",
        message: "Payment not verified",
      };

      userSocket?.send(JSON.stringify(message));

      res.status(400).json({
        success: false,
        message: "Payment not verified",
      });
      return;
    }
  } catch (error) {
    await session.abortTransaction();

    const message = {
      success: false,
      type: "payment",
      message: "Payment not verified",
    };

    const userSocket = clients.get(req.body.payload.payment.entity.notes.user);

    userSocket?.send(JSON.stringify(message));

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    session.endSession();
  }
};
