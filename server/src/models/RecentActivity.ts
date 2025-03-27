import mongoose from "mongoose";

interface IRecentActivity extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  itemID?: mongoose.Types.ObjectId;
  lenderId?: mongoose.Types.ObjectId;
  type:
    | "Borrowed"
    | "Lent"
    | "Returned"
    | "Dispute Created"
    | "Dispute Raised"
    | "Review Created For Lender"
    | "Review Created For Item";
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const recentActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Borrowed",
        "Lent",
        "Returned",
        "Dispute Created",
        "Dispute Raised",
        "Review Created For Lender",
        "Review Created For Item",
      ],
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRecentActivity>(
  "RecentActivity",
  recentActivitySchema
);
