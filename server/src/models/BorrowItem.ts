import mongoose from "mongoose";

interface IBorrowItem extends mongoose.Document {
  item: mongoose.Schema.Types.ObjectId;
  borrower: mongoose.Schema.Types.ObjectId;
  lender: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  paymentMode: "Cash" | "Online";
  paymentStatus: "Pending" | "Paid";
  deliveryType: "Pickup" | "Delivery";
  deliveryCharges?: number;
  deliveryStatus?: "Pending" | "Accepted" | "Rejected";
  transactionId?: mongoose.Schema.Types.ObjectId;
  isReturned: boolean;
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
      enum: ["Cash", "Online"],
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
  },
  { timestamps: true }
);

export default mongoose.model<IBorrowItem>("BorrowItem", borrowItemSchema);
