import mongoose from "mongoose";

interface IItemStat extends mongoose.Document {
  itemId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
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
