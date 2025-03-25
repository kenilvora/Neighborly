import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: mongoose.Types.ObjectId;
  role: "User" | "Admin";
  profileImage: string;
  transactions: mongoose.Types.ObjectId[];
  ratingAndReviews: mongoose.Types.ObjectId[];
  borrowItems: mongoose.Types.ObjectId[];
  lendItems: mongoose.Types.ObjectId[];
  upiId?: string;
  upiIdVerified?: boolean;
  accountBalance: number;
  notifications: mongoose.Types.ObjectId[];
  twoFactorAuth?: boolean;
  statisticalData?: mongoose.Types.ObjectId[];
  disputesCreatedByMe?: mongoose.Types.ObjectId[];
  disputesCreatedAgainstMe?: mongoose.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  recentActivities?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    profileImage: {
      type: String,
      required: true,
      trim: true,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],
    borrowItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    lendItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    upiId: {
      type: String,
      trim: true,
    },
    upiIdVerified: {
      type: Boolean,
      default: false,
    },
    accountBalance: {
      type: Number,
      required: true,
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    statisticalData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemStat",
      },
    ],
    disputesCreatedByMe: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dispute",
      },
    ],
    disputesCreatedAgainstMe: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dispute",
      },
    ],
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    recentActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecentActivity",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
