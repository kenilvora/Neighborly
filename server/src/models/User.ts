import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: mongoose.Schema.Types.ObjectId;
  role: "User" | "Admin";
  profileImage: string;
  transactions: mongoose.Schema.Types.ObjectId[];
  ratingAndReviews: mongoose.Schema.Types.ObjectId[];
  borrowItems: mongoose.Schema.Types.ObjectId[];
  lendItems: mongoose.Schema.Types.ObjectId[];
  upiId?: string;
  upiIdVerified?: boolean;
  accountBalance: number;
  notofications: mongoose.Schema.Types.ObjectId[];
  twoFactorAuth?: boolean;
  statisticalData?: mongoose.Schema.Types.ObjectId[];
  disputesCreatedByMe?: mongoose.Schema.Types.ObjectId[];
  disputesCreatedAgainstMe?: mongoose.Schema.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  recentActivities?: mongoose.Schema.Types.ObjectId[];
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
    notofications: [
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
