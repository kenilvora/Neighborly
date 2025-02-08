import mongoose from "mongoose";

interface IItemStat extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  borrowCount: number;
  totalProfit: number;
  createdAt: Date;
  updatedAt: Date;
}

const itemStatSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowCount: {
      type: Number,
      required: true,
    },
    totalProfit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IItemStat>("ItemStat", itemStatSchema);
