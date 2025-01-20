import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/User";
import Otp from "../models/Otp";
import bcrypt from "bcrypt";
import Address from "../models/Address";
import emailValidator from "../utils/emailValidator";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import { AuthRequest } from "../middlewares/Auth";
import mailSender from "../utils/mailSender";
import { resetPasswordTokenTemplate } from "../mails/resetPasswordTokenTemplate";
import mongoose from "mongoose";
import { populate } from "dotenv";

const signUpSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  contactNumber: z.string().min(10),
  otp: z.number().min(100000).max(999999),
  role: z.enum(["User", "Admin"]),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pincode: z.string(),
  isPrimary: z.boolean(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  otp: z.number().min(100000).max(999999).optional(),
});

const sendOtpSchema = z.object({
  email: z.string().email(),
  type: z.enum(["signup", "login", "twoFactorAuth"]),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const resetPasswordTokenSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

const enableTwoFactorAuthSchema = z.object({
  otp: z.number().min(100000).max(999999),
  twoFactorAuth: z.boolean(),
});

const updateUserDetailsSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  contactNumber: z.string().min(10).optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

interface IRatingAndReview {
  rating: number;
}

interface IStatisticalData {
  itemId: {
    name: string;
    description: string;
    price: number;
    category: {
      name: string;
    };
    images: string[];
    ratingAndReviews: IRatingAndReview[];
  };
  borrowedCount: number;
  totalProfit: number;
  avgRating?: number;
}

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
      role,
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

    const valid = await emailValidator(email);

    if (!valid) {
      res.status(400).json({
        success: false,
        message: "Invalid email",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    }

    const recentOtp = await Otp.findOne({ email, type: "signup" })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOtp || recentOtp.otp !== otp || recentOtp.expiry <= new Date()) {
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

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
      address: address._id,
      governmentId: "",
      governmentIdType: "",
      governmentIdVerified: false,
      role,
      profileImage: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
      transactions: [],
      ratingAndReviews: [],
      borrowItems: [],
      lendItems: [],
      upiId: "",
      upiIdVerified: false,
      accountBalance: 0,
      notifications: [],
      twoFactorAuth: false,
      statisticalData: [],
      disputes: [],
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = loginSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { email, password, otp } = parsedData.data;

    const valid = await emailValidator(email);

    if (!valid) {
      res.status(400).json({
        success: false,
        message: "Invalid email",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist with this email",
      });
      return;
    }

    if (user.twoFactorAuth && !otp) {
      res.status(400).json({
        success: false,
        message: "OTP required for login",
      });
      return;
    } else if (user.twoFactorAuth) {
      const recentOtp = await Otp.findOne({ email, type: "login" })
        .sort({ createdAt: -1 })
        .limit(1);

      if (
        !recentOtp ||
        recentOtp.otp !== otp ||
        recentOtp.expiry <= new Date()
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
        return;
      }
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(400).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 31536000000,
    });

    res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = sendOtpSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { email, type } = parsedData.data;

    const valid = await emailValidator(email);

    if (!valid) {
      res.status(400).json({
        success: false,
        message: "Invalid email",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (type === "signup" && user) {
      res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
      return;
    } else if ((type === "login" || type === "twoFactorAuth") && !user) {
      res.status(400).json({
        success: false,
        message: "User does not exist with this email",
      });
      return;
    }

    let otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    let result = await Otp.findOne({
      email,
      otp,
      type,
    });

    while (result) {
      otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      result = await Otp.findOne({
        email,
        otp,
        type,
      });
    }

    await Otp.create({
      email,
      otp,
      type,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.user?.id;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const user = await User.findById(id)
      .select(
        "-password -transactions -ratingAndReviews -borrowItems -lendItems -notifications -resetPasswordToken -resetPasswordExpires -statisticalData -disputes"
      )
      .populate({
        path: "address",
        select: "-userId",
      })
      .populate<{ ratingAndReviews: IRatingAndReview[] }>({
        path: "ratingAndReviews",
        select: "rating",
      });

    let totalRating = 0,
      avgRating = 0;

    if (user?.ratingAndReviews.length === 0) {
      user?.ratingAndReviews.forEach((ratingAndReview) => {
        totalRating += ratingAndReview.rating;
      });

      avgRating = totalRating / user?.ratingAndReviews.length;
    }

    const updatedUser = { ...user, avgRating };

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const parsedData = changePasswordSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { oldPassword, newPassword } = parsedData.data;

    const user = await User.findById(id);

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist",
      });
      return;
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPasswordToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsedData = resetPasswordTokenSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { email } = parsedData.data;

    const valid = await emailValidator(email);

    if (!valid) {
      res.status(400).json({
        success: false,
        message: "Invalid email",
      });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist with this email",
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      const name = `${user.firstName} ${user.lastName}`;

      await mailSender(
        email,
        "Reset Your Password",
        resetPasswordTokenTemplate(resetUrl, name)
      );
    } catch (error) {
      throw new Error("Error sending email");
    }

    res.status(200).json({
      success: true,
      message: "Reset password mail sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsedData = resetPasswordSchema.safeParse(req.body);
    const token = req.params.token;

    if (!parsedData.success || !token) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { password, confirmPassword } = parsedData.data;

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
      return;
    }

    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const enableTwoFactorAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = enableTwoFactorAuthSchema.safeParse(req.body);
    const id = req.user?.id;

    if (!parsedData.success || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { otp, twoFactorAuth } = parsedData.data;

    const user = await User.findById(id);

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist",
      });
      return;
    }

    const recentOtp = await Otp.findOne({
      email: user.email,
      type: "twoFactorAuth",
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!recentOtp || recentOtp.otp !== otp || recentOtp.expiry <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    user.twoFactorAuth = twoFactorAuth;

    await user.save();

    if (twoFactorAuth) {
      res.status(200).json({
        success: true,
        message: "Two Factor Authentication enabled successfully",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Two Factor Authentication disabled successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUserDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    const parsedData = updateUserDetailsSchema.safeParse(req.body);

    if (!parsedData.success || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const user = await User.findById(id);

    const address = await Address.findById(user?.address);

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist",
      });
      return;
    }

    if (!address) {
      res.status(400).json({
        success: false,
        message: "Previous address not found",
      });
      return;
    }

    const {
      firstName = user.firstName,
      lastName = user.lastName,
      contactNumber = user.contactNumber,
      addressLine1 = address.addressLine1,
      addressLine2 = address.addressLine2,
      city = address.city,
      state = address.state,
      country = address.country,
      pincode = address.pincode,
      isPrimary = address.isPrimary,
    } = parsedData.data;

    user.firstName = firstName;
    user.lastName = lastName;
    user.contactNumber = contactNumber;

    address.addressLine1 = addressLine1;
    address.addressLine2 = addressLine2;
    address.city = city;
    address.state = state;
    address.country = country;
    address.pincode = pincode;
    address.isPrimary = isPrimary;

    await user.save();

    await address.save();

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const user = await User.findById(id)
      .select(
        "-password -transactions -borrowItems -lendItems -notifications -resetPasswordToken -resetPasswordExpires -statisticalData -disputes -twoFactorAuth -accountBalance"
      )
      .populate({
        path: "address",
        select: "-userId",
      })
      .populate<{ ratingAndReviews: IRatingAndReview[] }>({
        path: "ratingAndReviews",
        select: "rating",
      });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let totalRating = 0,
      avgRating = 0;

    if (user?.ratingAndReviews.length === 0) {
      user?.ratingAndReviews.forEach((ratingAndReview) => {
        totalRating += ratingAndReview.rating;
      });

      avgRating = totalRating / user?.ratingAndReviews.length;
    }

    const updatedUser = { ...user, avgRating };

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStatisticalData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const statsData = (await User.findById(id)
      .select("statisticalData")
      .populate({
        path: "statisticalData",
        select: "-userId",
        populate: {
          path: "itemId",
          select: "name description price category images ratingAndReviews",
          populate: [
            {
              path: "ratingAndReviews",
              select: "rating",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        },
      })) as unknown as IStatisticalData[];

    if (!statsData) {
      res.status(400).json({
        success: false,
        message: "No statistical data found",
      });
      return;
    }

    let totalRating = 0,
      avgRating = 0;

    statsData.forEach((data) => {
      totalRating = 0;
      avgRating = 0;

      if (data.itemId.ratingAndReviews.length !== 0) {
        data.itemId.ratingAndReviews.forEach((ratingAndReview) => {
          totalRating += ratingAndReview.rating;
        });

        avgRating = totalRating / data.itemId.ratingAndReviews.length;
      }

      data.avgRating = avgRating;
    });

    res.status(200).json({
      success: true,
      statsData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
