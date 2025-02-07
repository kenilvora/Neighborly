import express from "express";
import { auth } from "../middlewares/Auth";
import {
  changePassword,
  changeTwoFactorAuth,
  getDashboardData,
  getMe,
  getStatisticalData,
  getTwoFactorAuthStatus,
  getUserById,
  login,
  logout,
  resetPassword,
  resetPasswordToken,
  sendOtp,
  signUp,
  updateUserDetails,
} from "../controllers/User";

const router = express.Router();

// Signup Route
router.post("/signup", signUp);

// Login Route
router.post("/login", login);

// Send OTP Route
router.post("/sendOtp", sendOtp);

// Logout Route
router.post("/logout", auth, logout);

// Get Me Route
router.get("/me", auth, getMe);

// Change Password Route
router.put("/changePassword", auth, changePassword);

// Reset Password Token Route
router.post("/resetPasswordToken", resetPasswordToken);

// Reset Password Route
router.put("/resetPassword/:token", resetPassword);

// Enable Two Factor Authentication Route
router.put("/changeTwoFactorAuth", auth, changeTwoFactorAuth);

// Get Two Factor Authentication Route
router.post("/getTwoFactorAuth", getTwoFactorAuthStatus);

// Update User Details Route
router.put("/updateProfile", auth, updateUserDetails);

// Get User By Id Route
router.get("/getUser/:id", auth, getUserById);

// Get Statistical Data Route
router.get("/getStatisticalData", auth, getStatisticalData);

// Get Dashboard Data Route
router.get("/getDashboardData", auth, getDashboardData);

export default router;
