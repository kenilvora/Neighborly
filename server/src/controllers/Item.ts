import { Request, Response } from "express";
import { AuthRequest, FileUploadRequest } from "../middlewares/Auth";
import { z } from "zod";
import { uploadFileToCloudinary } from "../utils/uploadFileToCloudinary";
import Item from "../models/Item";
import Category from "../models/Category";
import Profile from "../models/Profile";
import User from "../models/User";
import mongoose from "mongoose";

const addItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  depositAmount: z.number(),
  category: z.string(),
  tags: z.array(z.string()),
  isAvailable: z.boolean(),
  condition: z.enum(["New", "Like New", "Good", "Average", "Poor"]),
  availableFrom: z.date(),
});

export const addItem = async (
  req: FileUploadRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = addItemSchema.safeParse(req.body);
    const id = req.user?.id;

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const {
      name,
      description,
      price,
      depositAmount,
      category,
      tags,
      isAvailable,
      condition,
      availableFrom,
    } = parsedData.data;

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      res.status(400).json({
        success: false,
        message: "Category does not exist",
      });
      return;
    }

    if (depositAmount <= 0 || price <= 0 || depositAmount <= price) {
      res.status(400).json({
        success: false,
        message: "Invalid price or deposit amount",
      });
      return;
    }

    const images = req.files?.images;

    if (!images || (Array.isArray(images) && images.length === 0)) {
      res.status(400).json({
        success: false,
        message: "No images found",
      });
      return;
    }

    const imageArray = Array.isArray(images) ? images : [images];

    const uploadPromise = imageArray.map((image) =>
      uploadFileToCloudinary(image, process.env.CLOUD_FOLDER_NAME as string)
    );

    const results = await Promise.all(uploadPromise);

    const fileUrls = results.map((result) => result.secure_url);

    const item = await Item.create({
      name,
      description,
      price,
      depositAmount,
      category,
      tags,
      lenderId: id,
      borrowers: [],
      ratingAndReviews: [],
      isAvailable,
      images: fileUrls,
      condition,
      currentBorrowerId: undefined,
      availableFrom,
    });

    const user = await User.findById(id);

    await Profile.findByIdAndUpdate(user?.profileId, {
      $push: {
        lendItems: item._id,
      },
    });

    await Category.findByIdAndUpdate(category, {
      $inc: { itemCount: 1 },
      $push: { items: item._id },
    });

    res.status(201).json({
      success: true,
      message: "Item added successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.itemId;
    const id = req.user?.id;

    if (!itemId || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    if (item.isAvailable) {
      const user = await User.findById(id);

      const profile = await Profile.findById(user?.profileId);

      const uuid = new mongoose.Schema.Types.ObjectId(itemId);

      if (profile?.lendItems.includes(uuid)) {
        res.status(400).json({
          success: false,
          message: "Item not found",
        });
        return;
      }

      await Category.findByIdAndUpdate(item.category, {
        $inc: { itemCount: -1 },
        $pull: { items: item._id },
      });

      await Profile.findByIdAndUpdate(user?.profileId, {
        $pull: { lendItems: item._id },
      });

      await Item.findByIdAndDelete(itemId);

      res.status(200).json({
        success: true,
        message: "Item deleted successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Item is currently borrowed",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getItemsOfALender = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {};
