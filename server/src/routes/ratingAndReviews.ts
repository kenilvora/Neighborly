import express from "express";
import { auth, isUser } from "../middlewares/Auth";
import {
  createRatingAndReview,
  getRatingAndReviewsOfAnItem,
  getRatingAndReviewsOfAUser,
} from "../controllers/RatingAndReview";

const router = express.Router();

// Create Rating and Review Route
router.post("/create", auth, isUser, createRatingAndReview);

// Get Rating and Reviews of a User Route
router.get("/getOfUser", auth, isUser, getRatingAndReviewsOfAUser);

// Get Rating and Reviews of an Item Route
router.get("/getOfItem", auth, isUser, getRatingAndReviewsOfAnItem);

export default router;
