import mongoose from "mongoose";

interface IRatingAndReview extends mongoose.Document {
  rating: number;
  review: string;
  reviewer: mongoose.Schema.Types.ObjectId;
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
  },
  { timestamps: true }
);

export default mongoose.model<IRatingAndReview>(
  "RatingAndReview",
  ratingAndReviewSchema
);
