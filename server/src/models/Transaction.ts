import mongoose from "mongoose";

interface ITransaction extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  payerId: mongoose.Types.ObjectId;
  payeeId?: mongoose.Types.ObjectId;
  borrowItemId?: mongoose.Types.ObjectId;
  transactionType:
    | "Borrow Fee"
    | "Withdraw"
    | "Refund"
    | "Penalty"
    | "Add Funds";
  amount: number;
  paymentId: string;
  status: "Completed" | "Failed";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema(
  {
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    borrowItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["Borrow Fee", "Withdraw", "Refund", "Penalty", "Add Funds"],
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
      enum: ["Completed", "Failed", "Pending"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
