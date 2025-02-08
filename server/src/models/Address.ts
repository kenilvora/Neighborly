import mongoose from "mongoose";

interface IAddress extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>("Address", addressSchema);
