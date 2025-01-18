import mongoose from "mongoose";

interface IBorrowItem extends mongoose.Document {
  item: mongoose.Schema.Types.ObjectId;
  borrower: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isReturned: boolean;
  totalCost: number;
}

const borrowItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isReturned: {
      type: Boolean,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBorrowItem>("BorrowItem", borrowItemSchema);
