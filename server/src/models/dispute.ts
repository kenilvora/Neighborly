import mongoose from "mongoose";

interface IDispute extends mongoose.Document {
  borrowItemId: mongoose.Schema.Types.ObjectId;
  lenderId: mongoose.Schema.Types.ObjectId;
  borrowerId: mongoose.Schema.Types.ObjectId;
  reason: string;
  status: "Open" | "Resolved" | "Closed";
}

const disputeSchema = new mongoose.Schema(
  {
    borrowItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowItem",
      required: true,
    },
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Resolved", "Closed"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDispute>("Dispute", disputeSchema);
