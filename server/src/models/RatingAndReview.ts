import mongoose from "mongoose";

interface IRatingAndReview extends mongoose.Document {
  rating: number;
  review: string;
  reviewer: mongoose.Schema.Types.ObjectId;
  toWhom: mongoose.Schema.Types.ObjectId;
  type: "Item" | "User";
  createdAt: Date;
  updatedAt: Date;
}

const ratingAndReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toWhom: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
      required: true,
    },
    type: {
      type: String,
      enum: ["Item", "User"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRatingAndReview>(
  "RatingAndReview",
  ratingAndReviewSchema
);
