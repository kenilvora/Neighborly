import Razorpay from "razorpay";
import { config } from "dotenv";

config();

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY as string,
  key_secret: process.env.RAZORPAY_SECRET,
});
