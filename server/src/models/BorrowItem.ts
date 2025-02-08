import mongoose from "mongoose";

interface IBorrowItem extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  borrower: mongoose.Types.ObjectId;
  lender: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  paymentMode: "Cash" | "Online" | "Wallet";
  paymentStatus: "Pending" | "Paid";
  deliveryType: "Pickup" | "Delivery";
  deliveryCharges?: number;
  deliveryStatus?: "Pending" | "Accepted" | "Rejected";
  transactionId?: mongoose.Types.ObjectId;
  isReturned: boolean;
  type?: "Currently Borrowed" | "Previously Borrowed";
  createdAt: Date;
  updatedAt: Date;
}

const borrowItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "Online", "Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      required: true,
      default: "Pending",
    },
    deliveryType: {
      type: String,
      enum: ["Pickup", "Delivery"],
      required: true,
    },
    deliveryCharges: {
      type: Number,
      required: function (this: IBorrowItem) {
        return this.deliveryType === "Delivery";
      },
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      required: function (this: IBorrowItem) {
        return this.deliveryType === "Delivery";
      },
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: function (this: IBorrowItem) {
        return this.paymentMode === "Online";
      },
    },
    isReturned: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: {
      type: String,
      enum: ["Currently Borrowed", "Previously Borrowed"],
      default: "Currently Borrowed",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBorrowItem>("BorrowItem", borrowItemSchema);
