import mongoose from "mongoose";

interface INotification extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  message: string;
  recipient: mongoose.Types.ObjectId;
  isRead: boolean;
  type: "System" | "User" | "Transaction";
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["System", "User", "Transaction"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
