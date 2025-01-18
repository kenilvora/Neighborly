import mongoose from "mongoose";

interface IItem extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  category: mongoose.Schema.Types.ObjectId;
  tags: mongoose.Schema.Types.ObjectId[];
  lenderId: mongoose.Schema.Types.ObjectId;
  borrowers: mongoose.Schema.Types.ObjectId[];
  ratingAndReviews: mongoose.Schema.Types.ObjectId[];
  isAvailable: boolean;
  image: string;
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  currentBorrowerId?: mongoose.Schema.Types.ObjectId;
  availableFrom?: Date;
}

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    borrowers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],
    isAvailable: {
      type: Boolean,
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Average", "Poor"],
      required: true,
      trim: true,
    },
    currentBorrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    availableFrom: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IItem>("Item", itemSchema);
