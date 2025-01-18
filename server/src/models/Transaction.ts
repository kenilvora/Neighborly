import mongoose from "mongoose";

interface ITransaction extends mongoose.Document {
  borrowerId: mongoose.Schema.Types.ObjectId;
  lenderId: mongoose.Schema.Types.ObjectId;
  borrowItemId: mongoose.Schema.Types.ObjectId;
  transactionType:
    | "Deposit"
    | "Withdraw"
    | "Refund"
    | "RentPayment"
    | "Penalty";
  amount: number;
  status: "Pending" | "Completed" | "Failed";
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
      enum: ["Deposit", "Withdraw", "Refund", "RentPayment", "Penalty"],
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
