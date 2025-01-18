import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

type UserPayload = {
  id: string;
  email: string;
};

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;

    if (!payload || !payload.id || !payload.email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
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
