import mongoose from "mongoose";

interface ITransaction extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  borrowerId: mongoose.Types.ObjectId;
  lenderId: mongoose.Types.ObjectId;
  borrowItemId: mongoose.Types.ObjectId;
  transactionType: "Borrow Fee" | "Withdraw" | "Refund" | "Penalty";
  amount: number;
  paymentId: string;
  status: "Completed" | "Failed";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowItem",
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["Borrow Fee", "Withdraw", "Refund", "Penalty"],
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Completed", "Failed"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
