import { Request, Response } from "express";
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
import getAvgRating from "../utils/getAverageRating";
import {
  signUpSchema,
  loginSchema,
  sendOtpSchema,
  changePasswordSchema,
  resetPasswordTokenSchema,
  resetPasswordSchema,
  changeTwoFactorAuthSchema,
  updateUserDetailsSchema,
  IRatings,
  IStatisticalData,
  IStatisticalDataWithAvgRating,
  IUserDetails,
} from "@kenil_vora/neighborly";
import BorrowItem from "../models/BorrowItem";
import RecentActivity from "../models/RecentActivity";

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = signUpSchema.safeParse(req.body);

    if (!parsedData.success) {
      console.log(parsedData.error);
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

    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(password);

    if (!hasLength) {
      res.status(400).json({
        success: false,
        message: "Password must be atleast 8 characters long",
      });
      return;
    }

    if (!hasUppercase) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one uppercase letter",
      });
      return;
    }

    if (!hasLowercase) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one lowercase letter",
      });
      return;
    }

    if (!hasNumber) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one number",
      });
      return;
    }

    if (!hasSpecial) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one special character",
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
      disputesCreatedByMe: [],
      disputesCreatedAgainstMe: [],
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
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

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(400).json({
        success: false,
        message: "Invalid password",
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

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string);

    res.cookie("token", token, {
      secure: true,
      sameSite: "lax",
      maxAge: 31536000000,
    });

    res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      token: token,
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
      secure: true,
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

    const user = (await User.findById(id)
      .select(
        "firstName lastName email contactNumber address profileImage ratingAndReviews upiId upiIdVerified accountBalance twoFactorAuth"
      )
      .populate({
        path: "address",
        select: "-userId",
      })
      .populate<{ ratingAndReviews: IRatings[] }>({
        path: "ratingAndReviews",
        select: "rating",
      })) as unknown as IUserDetails;

    if (user?.ratingAndReviews.length === 0) {
      user.avgRating = getAvgRating(user?.ratingAndReviews);
    }

    res.status(200).json({
      success: true,
      user: user,
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

    const { oldPassword, newPassword, confirmPassword } = parsedData.data;

    const user = await User.findById(id);

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist",
      });
      return;
    }

    const hasLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(
      newPassword
    );

    if (!hasLength) {
      res.status(400).json({
        success: false,
        message: "Password must be atleast 8 characters long",
      });
      return;
    }

    if (!hasUppercase) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one uppercase letter",
      });
      return;
    }

    if (!hasLowercase) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one lowercase letter",
      });
      return;
    }

    if (!hasNumber) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one number",
      });
      return;
    }

    if (!hasSpecial) {
      res.status(400).json({
        success: false,
        message: "Password must contain atleast one special character",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
      return;
    }

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      res.status(400).json({
        success: false,
        message: "Invalid Old Password",
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
        message: "Password and Confirm Password do not match",
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

export const changeTwoFactorAuth = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = changeTwoFactorAuthSchema.safeParse(req.body);
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

    const updatedUser = (await User.findById(id)
      .select(
        "firstName lastName email contactNumber address profileImage ratingAndReviews upiId upiIdVerified accountBalance twoFactorAuth"
      )
      .populate({
        path: "address",
        select: "-userId",
      })
      .populate<{ ratingAndReviews: IRatings[] }>({
        path: "ratingAndReviews",
        select: "rating",
      })) as unknown as IUserDetails;

    if (updatedUser?.ratingAndReviews.length === 0) {
      updatedUser.avgRating = getAvgRating(updatedUser?.ratingAndReviews);
    }

    if (twoFactorAuth) {
      res.status(200).json({
        success: true,
        message: "Two Factor Authentication Enabled",
        user: updatedUser,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Two Factor Authentication Disabled",
        user: updatedUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTwoFactorAuthStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const isValid = await emailValidator(email);

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: "Invalid email",
      });
      return;
    }

    const user = await User.findOne({
      email: email,
    }).select("twoFactorAuth password");

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User does not exist",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    res.status(200).json({
      success: true,
      twoFactorAuth: user?.twoFactorAuth,
    });
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
    user.profileImage = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`;
    
    address.addressLine1 = addressLine1;
    address.addressLine2 = addressLine2;
    address.city = city;
    address.state = state;
    address.country = country;
    address.pincode = pincode;
    address.isPrimary = isPrimary;

    await user.save();

    await address.save();

    const updatedUser = (await User.findById(id)
      .select(
        "firstName lastName email contactNumber address profileImage ratingAndReviews upiId upiIdVerified accountBalance twoFactorAuth"
      )
      .populate({
        path: "address",
        select: "-userId",
      })
      .populate<{ ratingAndReviews: IRatings[] }>({
        path: "ratingAndReviews",
        select: "rating",
      })) as unknown as IUserDetails;

    if (updatedUser?.ratingAndReviews.length === 0) {
      updatedUser.avgRating = getAvgRating(updatedUser?.ratingAndReviews);
    }

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: updatedUser,
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
        "firstName lastName email contactNumber profileImage address ratingAndReviews disputesCreatedAgainstMe"
      )
      .populate({
        path: "address",
        select: "-userId",
      })
      .populate<{ ratingAndReviews: IRatings[] }>({
        path: "ratingAndReviews",
        select: "rating",
      })
      .populate({
        path: "disputesCreatedAgainstMe",
        select: "-images",
        match: {
          status: "Open",
        },
        populate: [
          {
            path: "userId",
            select: "firstName lastName email contactNumber profileImage",
          },
          {
            path: "againstWhomId",
            select: {
              $cond: {
                if: { $eq: ["$againstWhom", "User"] },
                then: "firstName lastName email contactNumber profileImage",
                else: "name description price",
              },
            },
          },
        ],
      });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let avgRating = 0;

    if (user?.ratingAndReviews.length === 0) {
      avgRating = getAvgRating(user?.ratingAndReviews);
    }

    const updatedUser = { ...user.toObject(), avgRating };

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

    let updatedStatsData: IStatisticalDataWithAvgRating[] = [];

    updatedStatsData = statsData.map((data) => {
      return {
        statData: data,
        avgRating: getAvgRating(data.itemId.ratingAndReviews),
      };
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

export const getDashboardData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id.toString();

    const data1 = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "borrowItems",
          foreignField: "_id",
          as: "borrowedItems",
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "lendItems",
          foreignField: "_id",
          as: "lentItems",
        },
      },
      {
        $lookup: {
          from: "itemstats",
          localField: "statisticalData",
          foreignField: "_id",
          as: "statisticalData",
        },
      },
      {
        $addFields: {
          borrowedItemsCount: { $size: "$borrowedItems" },
          lentItemsCount: { $size: "$lentItems" },
          totalProfit: { $sum: "$statisticalData.totalProfit" },
        },
      },
    ]);

    const data2 = await BorrowItem.aggregate([
      {
        $match: {
          borrower: new mongoose.Types.ObjectId(id as string),
          isReturned: false,
        },
      },
    ]);

    const recentActivities = await RecentActivity.find({ userId: id })
      .select("-userId")
      .populate({
        path: "itemID",
        select: "name description price",
      })
      .sort({
        createdAt: -1,
      });

    const data = {
      borrowedItemsCount: data1[0].borrowedItemsCount,
      lentItemsCount: data1[0].lentItemsCount,
      totalProfit: data1[0].totalProfit,
      pendingReturns: data2.length,
      recentActivities: recentActivities,
    };

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
