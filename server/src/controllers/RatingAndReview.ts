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

    const data = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id as string),
        },
      },
      {
        $lookup: {
          from: "ratingandreviews",
          localField: "ratingAndReviews",
          foreignField: "_id",
          as: "ratingAndReviews",
        },
      },
      {
        $unwind: {
          path: "$ratingAndReviews",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ratingAndReviews.reviewer",
          foreignField: "_id",
          as: "ratingAndReviews.reviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$ratingAndReviews.reviewerDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          fistName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          ratingAndReviews: {
            $push: {
              _id: "$ratingAndReviews._id",
              rating: "$ratingAndReviews.rating",
              review: "$ratingAndReviews.review",
              reviewer: {
                _id: "$ratingAndReviews.reviewerDetails._id",
                firstName: "$ratingAndReviews.reviewerDetails.firstName",
                lastName: "$ratingAndReviews.reviewerDetails.lastName",
                email: "$ratingAndReviews.reviewerDetails.email",
                image: "$ratingAndReviews.reviewerDetails.profileImage",
              },
              createdAt: "$ratingAndReviews.createdAt",
              updatedAt: "$ratingAndReviews.updatedAt",
            },
          },
          AvgRating: { $avg: "$ratingAndReviews.rating" },
        },
      },
      {
        $addFields: {
          avgRating: {
            $multiply: [{ $round: { $divide: ["$AvgRating", 0.5] } }, 0.5],
          },
          name: {
            $concat: ["$fistName", " ", "$lastName"],
          },
        },
      },
      {
        $project: {
          name: 1,
          ratingAndReviews: 1,
          avgRating: 1,
        },
      },
    ]);

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

export const getRatingAndReviewsOfItemsOfAUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id.toString();

    const data = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "items",
          localField: "lendItems",
          foreignField: "_id",
          as: "lendItems",
        },
      },
      {
        $unwind: {
          path: "$lendItems",
          preserveNullAndEmptyArrays: true, // Ensure it doesn't break if there are no items
        },
      },
      {
        $lookup: {
          from: "ratingandreviews",
          localField: "lendItems.ratingAndReviews",
          foreignField: "_id",
          as: "lendItems.ratingAndReviews",
        },
      },
      {
        $unwind: {
          path: "$lendItems.ratingAndReviews",
          preserveNullAndEmptyArrays: true, // Include items even if they have no reviews
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lendItems.ratingAndReviews.reviewer",
          foreignField: "_id",
          as: "lendItems.ratingAndReviews.reviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$lendItems.ratingAndReviews.reviewerDetails",
          preserveNullAndEmptyArrays: true, // Include reviews without valid reviewers
        },
      },
      {
        $group: {
          _id: {
            itemId: "$lendItems._id",
            itemName: "$lendItems.name",
          },
          itemReviews: {
            $push: {
              _id: "$lendItems.ratingAndReviews._id",
              rating: "$lendItems.ratingAndReviews.rating",
              review: "$lendItems.ratingAndReviews.review",
              reviewer: {
                _id: "$lendItems.ratingAndReviews.reviewerDetails._id",
                firstName:
                  "$lendItems.ratingAndReviews.reviewerDetails.firstName",
                lastName:
                  "$lendItems.ratingAndReviews.reviewerDetails.lastName",
                email: "$lendItems.ratingAndReviews.reviewerDetails.email",
                image:
                  "$lendItems.ratingAndReviews.reviewerDetails.profileImage",
              },
              createdAt: "$lendItems.ratingAndReviews.createdAt",
            },
          },
          AvgRating: { $avg: "$lendItems.ratingAndReviews.rating" }, // Calculate avg rating per item
        },
      },
      {
        $addFields: {
          avgRating: {
            $multiply: [{ $round: { $divide: ["$AvgRating", 0.5] } }, 0.5],
          },
        },
      },
      {
        $project: {
          _id: 0,
          itemId: "$_id.itemId",
          itemName: "$_id.itemName",
          avgRating: 1,
          itemReviews: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: data,
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

    const data = await Item.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id as string),
        },
      },
      {
        $lookup: {
          from: "ratingandreviews",
          localField: "ratingAndReviews",
          foreignField: "_id",
          as: "ratingAndReviews",
        },
      },
      {
        $unwind: {
          path: "$ratingAndReviews",
          preserveNullAndEmptyArrays: true, // To include items without reviews
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ratingAndReviews.reviewer",
          foreignField: "_id",
          as: "ratingAndReviews.reviewerDetails",
        },
      },
      {
        $unwind: {
          path: "$ratingAndReviews.reviewerDetails",
          preserveNullAndEmptyArrays: true, // To include reviews without a valid reviewer
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          ratingAndReviews: {
            $push: {
              _id: "$ratingAndReviews._id",
              rating: "$ratingAndReviews.rating",
              review: "$ratingAndReviews.review",
              reviewer: {
                _id: "$ratingAndReviews.reviewerDetails._id",
                firstName: "$ratingAndReviews.reviewerDetails.firstName",
                lastName: "$ratingAndReviews.reviewerDetails.lastName",
                email: "$ratingAndReviews.reviewerDetails.email",
                image: "$ratingAndReviews.reviewerDetails.profileImage",
              },
              createdAt: "$ratingAndReviews.createdAt",
              updatedAt: "$ratingAndReviews.updatedAt",
            },
          },
          AvgRating: { $avg: "$ratingAndReviews.rating" },
        },
      },
      {
        $addFields: {
          avgRating: {
            $multiply: [{ $round: { $divide: ["$AvgRating", 0.5] } }, 0.5],
          },
        },
      },
      {
        $project: {
          name: 1,
          ratingAndReviews: 1,
          avgRating: 1, // Include computed avgRating
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
