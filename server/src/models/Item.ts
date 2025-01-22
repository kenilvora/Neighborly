import mongoose from "mongoose";
import mailSender from "../utils/mailSender";
import { itemAddedTemplate } from "../mails/itemAddedTemplate";

interface IItem extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  category: mongoose.Schema.Types.ObjectId;
  tags: string[];
  lenderId: mongoose.Schema.Types.ObjectId;
  borrowers: mongoose.Schema.Types.ObjectId[];
  ratingAndReviews: mongoose.Schema.Types.ObjectId[];
  isAvailable: boolean;
  images: string[];
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  currentBorrowerId?: mongoose.Schema.Types.ObjectId;
  availableFrom: Date;
  deliveryCharges?: number;
  deliveryType?: "Pickup" | "Delivery" | "Both (Pickup & Delivery)";
  deliveryRadius?: number;
  itemLocation: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
        type: String,
        trim: true,
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
      default: true,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
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
      default: Date.now,
    },
    deliveryCharges: {
      type: Number,
    },
    deliveryType: {
      type: String,
      enum: ["Pickup", "Delivery", "Both (Pickup & Delivery)"],
    },
    deliveryRadius: {
      type: Number,
    },
    itemLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
  },
  { timestamps: true }
);

itemSchema.post("save", async function (doc: IItem) {
  try {
    await mailSender(doc.name, "New item added", itemAddedTemplate(doc.name));
  } catch (error) {
    throw new Error("Error sending mail");
  }
});

export default mongoose.model<IItem>("Item", itemSchema);
