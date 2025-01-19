import mongoose from "mongoose";
import mailSender from "../utils/mailSender";
import { otpTemplate } from "../mails/otpTemplate";

interface IOtp extends mongoose.Document {
  email: string;
  otp: number;
  type: "signup" | "login";
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
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["signup", "login"],
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

async function sendOtp(email: string, otp: number) {
  try {
    await mailSender(email, "Verify your email", otpTemplate(otp));
  } catch (error) {
    throw new Error("Error sending OTP");
  }
}

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendOtp(this.email, this.otp);
  }
  next();
});

export default mongoose.model<IOtp>("Otp", otpSchema);
