import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import mongoose from "mongoose";

type UserPayload = {
  id: mongoose.Schema.Types.ObjectId;
  email: string;
  role: "User" | "Admin";
};

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;

    if (!payload || !payload.id || !payload.email || !payload.role) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    const user = await User.findById(payload.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const isUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role !== "User") {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.role !== "Admin") {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
