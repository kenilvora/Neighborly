import { Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import { z } from "zod";
import User from "../models/User";
import Item from "../models/Item";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";
import BorrowItem from "../models/BorrowItem";
import ItemStat from "../models/ItemStat";

const borrowItemSchema = z.object({
  itemId: z.instanceof(mongoose.Schema.Types.ObjectId),
  startDate: z.string(),
  endDate: z.string(),
  paymentMode: z.enum(["Cash", "Online", "Wallet"]),
  paymentStatus: z.enum(["Pending", "Paid"]),
  deliveryType: z.enum(["Pickup", "Delivery"]),
  deliveryCharges: z.number().optional(),
  deliveryStatus: z.enum(["Pending", "Accepted", "Rejected"]).optional(),
  transactionId: z.string().optional(),
});

const returnItemSchema = z.object({
  borrowItemId: z.string(),
});

export const borrowItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = borrowItemSchema.safeParse(req.body);
    const id = req.user?.id;

    if (!id || !parsedData.success) {
      res.status(401).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    let {
      itemId,
      startDate,
      endDate,
      paymentMode,
      paymentStatus,
      transactionId,
      deliveryType,
      deliveryCharges,
      deliveryStatus,
    } = parsedData.data;

    if (!mongoose.Types.ObjectId.isValid(itemId.toString())) {
      res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    if (user.lendItems.includes(itemId)) {
      res.status(400).json({
        success: false,
        message: "You can't borrow your own item",
      });
      return;
    }

    if (!item.isAvailable) {
      res.status(400).json({
        success: false,
        message: "Item is not available",
      });
      return;
    }

    if (new Date(startDate) < new Date() || new Date(endDate) < new Date()) {
      res.status(400).json({
        success: false,
        message: "Start date and end date should be greater than current date",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      res.status(400).json({
        success: false,
        message: "End date should be greater than start date",
      });
      return;
    }

    if (paymentMode === "Online") {
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction id is required for online payment",
        });
        return;
      }

      if (paymentStatus !== "Paid") {
        res.status(400).json({
          success: false,
          message: "Payment status should be paid",
        });
        return;
      }

      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
        return;
      }

      if (transaction) {
        const createdAt = new Date(transaction.createdAt);

        const currentDate = new Date();

        const diff = Math.abs(currentDate.getTime() - createdAt.getTime());

        const diffDays = Math.ceil(diff / (1000 * 60 * 3));

        if (diffDays > 1) {
          res.status(400).json({
            success: false,
            message: "Feels like you are trying to manipulate the system",
          });
          return;
        }
      }

      if (transaction.borrowerId !== id) {
        res.status(400).json({
          success: false,
          message: "You are not the borrower of this transaction",
        });
        return;
      }

      if (transaction.borrowItemId !== itemId) {
        res.status(400).json({
          success: false,
          message: "Transaction is not for this item",
        });
        return;
      }

      if (deliveryType === "Delivery") {
        if (
          transaction.amount !==
          item.depositAmount + (deliveryCharges || 0)
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid Transaction amount",
          });
          return;
        }
      }

      if (transaction.transactionType !== "Deposit") {
        res.status(400).json({
          success: false,
          message: "Invalid Transaction",
        });
      }

      if (transaction.status !== "Completed") {
        res.status(400).json({
          success: false,
          message: "Transaction is not completed",
        });
        return;
      }
    }

    if (paymentMode === "Cash" && paymentStatus !== "Pending") {
      res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
      return;
    }

    if (paymentMode === "Wallet") {
      const userWallet = user.accountBalance;

      if (userWallet < item.depositAmount + (deliveryCharges || 0)) {
        res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
        return;
      }

      user.accountBalance -= item.depositAmount + (deliveryCharges || 0);

      paymentStatus = "Paid";
    }

    item.isAvailable = false;

    item.currentBorrowerId = id;

    item.borrowers.push(id);

    item.availableFrom = new Date(endDate);

    await item.save();

    user.borrowItems.push(itemId);

    await BorrowItem.create({
      item: itemId,
      borrower: id,
      lender: item.lenderId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      paymentMode,
      paymentStatus,
      deliveryType,
      deliveryCharges: deliveryCharges || 0,
      deliveryStatus: deliveryStatus || "Pending",
      transactionId: paymentMode === "Online" ? transactionId : undefined,
    });

    let itemStat = await ItemStat.findOne({
      itemId: itemId,
      userId: item.lenderId,
    });

    if (itemStat) {
      itemStat.borrowCount += 1;
      itemStat.totalProfit += item.price;
      await itemStat.save();
    } else {
      itemStat = await ItemStat.create({
        itemId: itemId,
        userId: item.lenderId,
        borrowCount: 1,
        totalProfit: item.price,
      });
    }

    user.statisticalData?.push(new mongoose.Schema.Types.ObjectId(itemStat.id));

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item borrowed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: "Internal server error",
    });
  }
};

export const returnItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    const itemId = req.params.itemId;

    if (!id || !itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(401).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const borrowItem = await BorrowItem.findById(itemId);

    if (!borrowItem) {
      res.status(404).json({
        success: false,
        message: "Borrow item not found",
      });
      return;
    }

    if (borrowItem.borrower !== id) {
      res.status(400).json({
        success: false,
        message: "You are not the borrower of this item",
      });
      return;
    }

    const item = await Item.findById(borrowItem.item);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    if (item.currentBorrowerId !== id) {
      res.status(400).json({
        success: false,
        message: "You are not the current borrower of this item",
      });
      return;
    }

    if (borrowItem.isReturned) {
      res.status(400).json({
        success: false,
        message: "Item is already returned",
      });
      return;
    }

    item.isAvailable = true;

    item.currentBorrowerId = undefined;

    item.availableFrom = new Date();

    await item.save();

    borrowItem.isReturned = true;

    await borrowItem.save();

    user.borrowItems = user.borrowItems.filter(
      (bid) => bid.toString() !== itemId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item returned successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
