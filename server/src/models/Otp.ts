import mongoose from "mongoose";

interface IOtp extends mongoose.Document {
  email: string;
  otp: string;
  expiry: Date;
}

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
      default: () => new Date(new Date().getTime() + 5 * 60000),
    },
  },
  { timestamps: true }
);

otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>("Otp", otpSchema);
