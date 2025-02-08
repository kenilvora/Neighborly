import mongoose from "mongoose";

interface IDispute extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  againstWhomId: mongoose.Types.ObjectId;
  againstWhom: "User" | "Item";
  reason: string;
  images?: string[];
  status: "Open" | "Resolved" | "Closed";
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    againstWhomId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "againstWhom",
      required: true,
    },
    againstWhom: {
      type: String,
      required: true,
      enum: ["User", "Item"],
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
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
