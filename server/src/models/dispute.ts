import mongoose from "mongoose";

interface IDispute extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId;
  itemId: mongoose.Schema.Types.ObjectId;
  reason: string;
  images: string[];
  type: "Create By Other" | "Create By You";
  status: "Open" | "Resolved" | "Closed";
}

const disputeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowItem",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    type: {
      type: String,
      required: true,
      enum: ["Create By Other", "Create By You"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Resolved", "Closed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDispute>("Dispute", disputeSchema);
