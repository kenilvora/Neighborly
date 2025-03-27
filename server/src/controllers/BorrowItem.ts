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
import Notification from "../models/Notification";

export const borrowItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    const borrower = await User.findById(id).session(session);

    if (!borrower) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const item = await Item.findById(itemId).session(session);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    const lender = await User.findById(item.lenderId).session(session);

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
      new Date(startDate).toISOString().slice(0, 10) <
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

      const transaction = await Transaction.findById(transactionId).session(
        session
      );

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

      if (transaction.payerId !== id) {
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

      if (transaction.transactionType !== "Borrow Fee") {
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

      const transaction = await Transaction.create(
        [
          {
            payerId: id,
            payeeId: item.lenderId,
            borrowItemId: itemId,
            transactionType: "Borrow Fee",
            amount: totalAmount + deliveryCharges,
            paymentId: `Wallet-${new Date().getTime()}`,
            status: "Completed",
          },
        ],
        { session }
      );

      const notification = await Notification.create(
        [
          {
            message: `Payment Received Of ₹${
              totalAmount + deliveryCharges
            } to your wallet for borrowing ${item.name} from ${
              borrower.firstName
            } ${borrower.lastName}`,
            recipient: item.lenderId,
            isRead: false,
            type: "Transaction",
          },
        ],
        { session }
      );

      const notification2 = await Notification.create(
        [
          {
            message: `Payment Deducted Of ₹${
              totalAmount + deliveryCharges
            } from your wallet for borrowing ${item.name}`,
            recipient: id,
            isRead: false,
            type: "Transaction",
          },
        ],
        { session }
      );

      borrower.transactions?.push(transaction[0]._id);
      borrower.notifications?.push(notification2[0]._id);

      lender.notifications?.push(notification[0]._id);

      await lender.save({ session });

      paymentStatus = "Paid";
    }

    const dC = deliveryType === "Delivery" ? item.deliveryCharges : 0;

    item.isAvailable = false;

    item.currentBorrowerId = id;

    item.borrowers.push(id);

    const endingDate = new Date(endDate);
    item.availableFrom = new Date(endingDate.setDate(endingDate.getDate() + 1));

    await item.save({ session });

    borrower.borrowItems.push(item._id);

    await BorrowItem.create(
      [
        {
          item: itemId,
          borrower: id,
          lender: item.lenderId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          paymentMode,
          paymentStatus,
          deliveryType,
          deliveryCharges: dC,
          deliveryStatus: deliveryType === "Delivery" ? "Pending" : undefined,
          transactionId: paymentMode === "Online" ? transactionId : undefined,
          type: "Currently Borrowed",
        },
      ],
      { session }
    );

    if (paymentMode !== "Cash") {
      let itemStat = await ItemStat.findOne(
        {
          itemId: itemId,
          userId: item.lenderId,
        },
        null,
        { session }
      );

      if (itemStat) {
        itemStat.borrowCount += 1;
        itemStat.totalProfit += totalAmount + deliveryCharges;
        await itemStat.save({ session });
      } else {
        let newItemStat = await ItemStat.create(
          [
            {
              itemId: itemId,
              userId: item.lenderId,
              borrowCount: 1,
              totalProfit: item.price,
            },
          ],
          { session }
        );
        lender.statisticalData?.push(newItemStat[0]._id);
      }
    }

    const recentActivity = await RecentActivity.create(
      [
        {
          userId: id,
          itemID: itemId,
          type: "Borrowed",
          status: "Success",
        },
      ],
      { session }
    );

    borrower.recentActivities?.push(recentActivity[0]._id);

    await borrower.save({ session });

    await lender.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Item borrowed successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: true,
      message: "Internal server error",
    });
  } finally {
    session.endSession();
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

    const borrower = await User.findById(item.currentBorrowerId);

    if (!borrower) {
      res.status(404).json({
        success: false,
        message: "Borrower not found",
      });
      return;
    }

    const borrowItem = await BorrowItem.findOne({
      item: itemId,
      borrower: item.currentBorrowerId,
      lender: id,
    }).sort({ createdAt: -1 });

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
      userId: borrower._id,
      itemID: itemId,
      type: "Returned",
      status: "Success",
    });

    borrower.recentActivities?.push(recentActivity._id);

    await borrower.save();

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
    }).sort({ createdAt: -1 });

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
    let type = req.query.type || "";
    let paymentStatus = req.query.paymentStatus || "";

    if (
      !id ||
      (type !== "CB" && type !== "PB" && type !== "") ||
      (paymentStatus !== "Paid" &&
        paymentStatus !== "Pending" &&
        paymentStatus !== "")
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    type =
      type === "CB"
        ? "Currently Borrowed"
        : type === "PB"
        ? "Previously Borrowed"
        : "";

    const borrowedItems = (await BorrowItem.find({
      borrower: id,
      type: {
        $regex: type,
        $options: "i",
      },
      paymentStatus: {
        $regex: paymentStatus,
        $options: "i",
      },
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
