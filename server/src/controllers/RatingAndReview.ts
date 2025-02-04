import { Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import User from "../models/User";
import mongoose from "mongoose";
import RatingAndReview from "../models/RatingAndReview";
import Item from "../models/Item";
import getAvgRating from "../utils/getAverageRating";
import {
  createRatingAndReviewSchema,
  IRatingAndReview,
  IGeneralRatingAndReview,
} from "@kenil_vora/neighborly";
import RecentActivity from "../models/RecentActivity";

export const createRatingAndReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = createRatingAndReviewSchema.safeParse(req.body);
    const id = req.user?.id;

    if (!parsedData.success || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
        error: parsedData.error,
      });
      return;
    }

    const { rating, review, toWhom, type } = parsedData.data;

    if (!mongoose.Types.ObjectId.isValid(toWhom.toString())) {
      res.status(400).json({
        success: false,
        message: "Invalid toWhom",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (type === "User" && toWhom === id) {
      res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
      return;
    }

    let toWhomUser, toWhomItem;

    if (type === "User") {
      toWhomUser = await User.findById(toWhom);
      if (!toWhomUser) {
        res.status(404).json({
          success: false,
          message: "Reviewee User not found",
        });
        return;
      }
    } else {
      toWhomItem = await Item.findById(toWhom);
      if (!toWhomItem) {
        res.status(404).json({
          success: false,
          message: "Reviewee Item not found",
        });
        return;
      }
    }

    if (type === "Item" && user.lendItems.includes(toWhom)) {
      res.status(400).json({
        success: false,
        message: "You cannot review your own item",
      });
      return;
    }

    if (type === "Item" && !user.borrowItems.includes(toWhom)) {
      res.status(400).json({
        success: false,
        message: "You cannot review an item you have not borrowed",
      });
      return;
    }

    const existingReview = await RatingAndReview.findOne({
      reviewer: id,
      toWhom,
      type,
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: "You have already reviewed this",
      });
      return;
    }

    const newRatingAndReview = await RatingAndReview.create({
      rating,
      review,
      reviewer: id,
      toWhom,
      type,
    });

    const recentActivity1 = await RecentActivity.create({
      userId: id,
      itemID: toWhomItem ? toWhomItem._id : null,
      type: "Review Created",
      status: `${rating}⭐`,
    });

    user.recentActivities?.push(recentActivity1._id);

    await user.save();

    const recentActivity2 = await RecentActivity.create({
      userId: toWhom,
      itemID: toWhomItem ? toWhomItem._id : null,
      type: "Review Given To Me",
      status: `${rating}⭐`,
    });

    if (type === "User") {
      toWhomUser?.ratingAndReviews.push(
        newRatingAndReview._id as mongoose.Schema.Types.ObjectId
      );
      toWhomUser?.recentActivities?.push(recentActivity2._id);
      await toWhomUser?.save();
    } else {
      toWhomItem?.ratingAndReviews.push(
        newRatingAndReview._id as mongoose.Schema.Types.ObjectId
      );
      const toWhomUser = await User.findById(toWhomItem?.lenderId);
      toWhomUser?.recentActivities?.push(recentActivity2._id);
      await toWhomUser?.save();
      await toWhomItem?.save();
    }

    res.status(201).json({
      success: true,
      message: "Review created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRatingAndReviewsOfAUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let id;
    if (req.query.id) {
      id = req.query.id;
    } else {
      id = req.user?.id;
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid id",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const ratingAndReviews = (await User.findById(id)
      .select("ratingAndReviews")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "reviewer",
          select: "firstName lastName profileImage",
        },
        select: "-toWhom -type",
      })) as unknown as IRatingAndReview[];

    const avgRating = getAvgRating(ratingAndReviews);

    const updatedRatingAndReviews: IGeneralRatingAndReview = {
      ratingAndReviews,
      avgRating,
    };

    res.status(200).json({
      success: true,
      data: updatedRatingAndReviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRatingAndReviewsOfAnItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.query.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid id",
      });
      return;
    }

    const item = await Item.findById(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    const ratingAndReviews = (await Item.findById(id)
      .select("ratingAndReviews")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "reviewer",
          select: "firstName lastName profileImage",
        },
        select: "-toWhom -type",
      })) as unknown as IRatingAndReview[];

    const avgRating = getAvgRating(ratingAndReviews);

    const updatedRatingAndReviews: IGeneralRatingAndReview = {
      ratingAndReviews,
      avgRating,
    };

    res.status(200).json({
      success: true,
      data: updatedRatingAndReviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
