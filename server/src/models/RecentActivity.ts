import mongoose from "mongoose";

interface IRecentActivity extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  itemID?: mongoose.Types.ObjectId;
  type:
    | "Borrowed"
    | "Lent"
    | "Returned"
    | "Dispute Created"
    | "Dispute Raised"
    | "Review Created"
    | "Review Given To Me";
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
    type: {
      type: String,
      required: true,
      enum: [
        "Borrowed",
        "Lent",
        "Returned",
        "Dispute Created",
        "Dispute Raised",
        "Review Created",
        "Review Given To Me",
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
