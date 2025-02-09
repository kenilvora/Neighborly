import { Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import User from "../models/User";
import Item from "../models/Item";
import mongoose from "mongoose";
import Transaction from "../models/Transaction";
import BorrowItem from "../models/BorrowItem";
import ItemStat from "../models/ItemStat";
import { borrowItemSchema, IBorrowedItemData } from "@kenil_vora/neighborly";
import RecentActivity from "../models/RecentActivity";

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
        error: parsedData.error,
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
    } = parsedData.data;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const borrower = await User.findById(id);

    if (!borrower) {
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

    const lender = await User.findById(item.lenderId);

    if (!lender) {
      res.status(404).json({
        success: false,
        message: "Lender not found",
      });
      return;
    }

    if (item.deliveryType === "Pickup" && deliveryType === "Delivery") {
      res.status(400).json({
        success: false,
        message: "Delivery is not available for this item",
      });
      return;
    }

    const deliveryCharges =
      deliveryType === "Delivery" ? item?.deliveryCharges ?? 0 : 0;

    if (borrower.lendItems.includes(itemId)) {
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

    if (
      new Date(startDate).toISOString().slice(0, 10) !==
      new Date(item.availableFrom).toISOString().slice(0, 10)
    ) {
      res.status(400).json({
        success: false,
        message: "Start date should be equal to available from date",
      });
      return;
    }

    if (
      new Date(endDate).toISOString().slice(0, 10) <
        new Date().toISOString().slice(0, 10) ||
      new Date(endDate).toISOString().slice(0, 10) <
        new Date(startDate).toISOString().slice(0, 10)
    ) {
      res.status(400).json({
        success: false,
        message: "Start date and end date should be greater than current date",
      });
      return;
    }

    const totalDays =
      Math.ceil(
        Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const totalAmount = item.depositAmount + item.price * totalDays;

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
        if (transaction.amount !== totalAmount + deliveryCharges) {
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
      const userWallet = borrower.accountBalance;

      if (userWallet < totalAmount + deliveryCharges) {
        res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
        return;
      }

      borrower.accountBalance -= totalAmount + deliveryCharges;

      lender.accountBalance += totalAmount + deliveryCharges;

      await lender.save();

      paymentStatus = "Paid";
    }

    item.isAvailable = false;

    item.currentBorrowerId = id;

    item.borrowers.push(id);

    const endingDate = new Date(endDate);
    item.availableFrom = new Date(endingDate.setDate(endingDate.getDate() + 1));

    await item.save();

    borrower.borrowItems.push(item._id);

    await BorrowItem.create({
      item: itemId,
      borrower: id,
      lender: item.lenderId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      paymentMode,
      paymentStatus,
      deliveryType,
      deliveryCharges:
        deliveryType === "Delivery" ? deliveryCharges : undefined,
      deliveryStatus: deliveryType === "Delivery" ? "Pending" : undefined,
      transactionId: paymentMode === "Online" ? transactionId : undefined,
      type: "Currently Borrowed",
    });

    if (paymentMode !== "Cash") {
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
      lender.statisticalData?.push(itemStat._id);
    }

    const recentActivity = await RecentActivity.create({
      userId: id,
      itemID: itemId,
      type: "Borrowed",
      status: "Success",
    });

    borrower.recentActivities?.push(recentActivity._id);

    await borrower.save();

    await lender.save();

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

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    if (item.lenderId.toString() !== id.toString()) {
      res.status(400).json({
        success: false,
        message: "You are not the lender of this item",
      });
      return;
    }

    if (item.isAvailable) {
      res.status(400).json({
        success: false,
        message: "Item is already returned",
      });
    }

    const borrowItem = await BorrowItem.findOne({
      item: itemId,
      borrower: item.currentBorrowerId,
      lender: id,
    });

    if (!borrowItem) {
      res.status(404).json({
        success: false,
        message: "Borrow item not found",
      });
      return;
    }

    if (borrowItem.isReturned) {
      res.status(400).json({
        success: false,
        message: "Item is already returned",
      });
    }

    if (borrowItem.paymentStatus === "Pending") {
      res.status(400).json({
        success: false,
        message: "Payment is pending",
      });
      return;
    }

    item.isAvailable = true;
    item.currentBorrowerId = undefined;
    item.availableFrom = new Date();

    await item.save();

    borrowItem.isReturned = true;
    borrowItem.type = "Previously Borrowed";

    await borrowItem.save();

    const recentActivity = await RecentActivity.create({
      userId: id,
      itemID: itemId,
      type: "Returned",
      status: "Success",
    });

    user.recentActivities?.push(recentActivity._id);

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

export const paymentReceived = async (
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

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    if (item.lenderId.toString() !== id.toString()) {
      res.status(400).json({
        success: false,
        message: "You are not the lender of this item",
      });
      return;
    }

    const borrowItem = await BorrowItem.findOne({
      item: itemId,
      borrower: item.currentBorrowerId,
      lender: id,
    });

    if (!borrowItem) {
      res.status(404).json({
        success: false,
        message: "Borrow item not found",
      });
      return;
    }

    if (borrowItem.paymentMode !== "Cash") {
      res.status(400).json({
        success: false,
        message: "Payment mode is not cash",
      });
      return;
    }

    if (borrowItem.paymentStatus === "Paid") {
      res.status(400).json({
        success: false,
        message: "Payment is already received",
      });
      return;
    }

    borrowItem.paymentStatus = "Paid";

    await borrowItem.save();

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
    user.statisticalData?.push(itemStat._id);

    res.status(200).json({
      success: true,
      message: "Payment received successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllBorrowedItems = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    const type = req.query.type || "CB";
    const paymentStatus = req.query.paymentStatus || "";

    if (!id || !type || (type !== "CB" && type !== "PB")) {
      res.status(401).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const borrowedItems = (await BorrowItem.find({
      borrower: id,
      type: type === "CB" ? "Currently Borrowed" : "Previously Borrowed",
      paymentStatus: paymentStatus ? paymentStatus : { $ne: "" },
    })
      .select("-borrower")
      .populate({
        path: "item",
        select: "name description price depositAmount images itemLocation",
        populate: {
          path: "itemLocation",
          select: "city state country -_id",
        },
      })
      .populate({
        path: "lender",
        select: "firstName lastName email contactNumber profileImage",
      })
      .populate({
        path: "transactionId",
        select: "amount paymentId status transactionType",
      })) as unknown as IBorrowedItemData[];

    if (!borrowedItems) {
      res.status(404).json({
        success: false,
        message: "Borrowed items not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: borrowedItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
