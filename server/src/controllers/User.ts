import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/User";
import Otp from "../models/Otp";
import bcrypt from "bcrypt";
import Address from "../models/Address";
import Profile from "../models/Profile";

const signUpSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  contactNumber: z.string().min(10),
  otp: z.number().min(100000).max(999999),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pincode: z.string(),
  isPrimary: z.boolean(),
});

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = signUpSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const {
      firstName,
      lastName,
      email,
      password,
      contactNumber,
      otp,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      isPrimary,
    } = parsedData.data;

    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    const recentOtp = await Otp.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOtp || recentOtp.otp !== otp) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const address = await Address.create({
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      isPrimary,
    });

    const profile = await Profile.create({
      profileImage: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
      borrowItems: [],
      lendItems: [],
      upiId: "",
      upiIdVerified: false,
      accountBalance: 0,
    });

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      address: address._id,
      profileId: profile._id,
      transactions: [],
      ratingAndReviews: [],
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};