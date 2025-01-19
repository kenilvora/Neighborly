import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  address: mongoose.Schema.Types.ObjectId;
  governmentId?: string;
  governmentIdType?: "Aadhar" | "PAN" | "Driving License";
  governmentIdVerified?: boolean;
  profileId: mongoose.Schema.Types.ObjectId;
  transactions: mongoose.Schema.Types.ObjectId[];
  ratingAndReviews: mongoose.Schema.Types.ObjectId[];
  twoFactorAuth?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: "User" | "Admin";
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
    governmentId: {
      type: String,
      trim: true,
    },
    governmentIdType: {
      type: String,
      enum: ["Aadhar", "PAN", "Driving License"],
      trim: true,
    },
    governmentIdVerified: {
      type: Boolean,
      default: false,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
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
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
