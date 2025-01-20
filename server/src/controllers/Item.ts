import { Request, Response } from "express";
import { AuthRequest, FileUploadRequest } from "../middlewares/Auth";
import { z } from "zod";
import { uploadFileToCloudinary } from "../utils/uploadFileToCloudinary";
import Item from "../models/Item";
import Category from "../models/Category";
import User from "../models/User";
import mongoose, { model } from "mongoose";
import Notification from "../models/Notification";

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
  deliveryCharges: z.number().optional(),
  deliveryType: z
    .enum(["Pickup", "Delivery", "Both (Pickup & Delivery)"])
    .optional(),
  deliveryRadius: z.number().optional(),
});

const updateItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  depositAmount: z.number().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  condition: z.enum(["New", "Like New", "Good", "Average", "Poor"]).optional(),
  availableFrom: z.date().optional(),
  deliveryCharges: z.number().optional(),
  deliveryType: z
    .enum(["Pickup", "Delivery", "Both (Pickup & Delivery)"])
    .optional(),
  deliveryRadius: z.number().optional(),
});

const deleteItemImagesSchema = z.object({
  images: z.array(z.string()),
});

interface IRating {
  rating: number;
  review?: string;
}

interface IAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  upiId?: string;
  profileImage: string;
}

interface ILendItem {
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  category: { name: string };
  tags: string[];
  lenderId?: IUser;
  borrowers?: IUser[];
  ratingAndReviews: IRating[];
  isAvailable: boolean;
  images: string[];
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  availableFrom: Date;
  avgRating?: number; // Add the calculated property
  deliveryCharges?: number;
  deliveryType?: "Pickup" | "Delivery" | "Both (Pickup & Delivery)";
  deliveryRadius?: number;
  itemLocation?: IAddress;
}

interface IAllItems {
  lendItems: ILendItem[];
}

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
      deliveryCharges = 0,
      deliveryType = "Pickup",
      deliveryRadius = 0,
    } = parsedData.data;

    const user = await User.findById(id);

    if (!user?.upiIdVerified) {
      res.status(400).json({
        success: false,
        message: "Please verify your UPI ID first",
      });
      return;
    }

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
      deliveryCharges: deliveryCharges || 0,
      deliveryType: deliveryType || "Pickup",
      deliveryRadius: deliveryRadius || 0,
      itemLocation: user?.address,
    });

    user.lendItems.push(item._id as mongoose.Schema.Types.ObjectId);

    await user.save();

    await Category.findByIdAndUpdate(category, {
      $inc: { itemCount: 1 },
      $push: { items: item._id },
    });

    await Notification.create({
      message: `You have successfully added a new item named ${name}`,
      recipient: id,
      isRead: false,
      type: "System",
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
      const uuid = new mongoose.Schema.Types.ObjectId(id as string);

      if (item.lenderId !== uuid) {
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

      await User.findByIdAndUpdate(id, {
        $pull: { lendItems: item._id },
      });

      await Item.findByIdAndDelete(itemId);

      await Notification.create({
        message: `You have successfully deleted an item named ${item.name}`,
        recipient: id,
        isRead: false,
        type: "System",
      });

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
): Promise<void> => {
  try {
    const id = req.user?.id;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string) || 15;

    const items = (await User.findById(id)
      .select("lendItems")
      .populate<ILendItem>({
        path: "lendItems",
        options: {
          sort: { createdAt: -1 },
          limit,
          skip: (page - 1) * limit,
        },
        populate: [
          {
            path: "category",
            select: "name",
          },
          {
            path: "ratingAndReviews",
            select: "rating",
          },
        ],
        select:
          "-lenderId -borrowers -currentBorrowerId -itemLocation -statisticalData",
      })) as unknown as IAllItems;

    if (items?.lendItems && items.lendItems.length > 0) {
      items.lendItems.forEach((item) => {
        let totalRating = 0; // Reset for each item
        if (item.ratingAndReviews && item.ratingAndReviews.length > 0) {
          item.ratingAndReviews.forEach((rating) => {
            totalRating += rating.rating;
          });
          // Calculate and assign avgRating
          item.avgRating = totalRating / item.ratingAndReviews.length;
        } else {
          item.avgRating = 0; // Default if no ratings
        }
      });
    }

    if (items?.lendItems && items.lendItems.length === 0) {
      res.status(404).json({
        success: false,
        message: "No items found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: items?.lendItems,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getItemById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.itemId;

    if (!itemId) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const item = (await Item.findById(itemId)
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "lenderId",
        select: "firstName lastName email contactNumber upiId profileImage",
      })
      .populate({
        path: "borrowers",
        select: "firstName lastName email contactNumber profileImage",
        options: {
          sort: { createdAt: -1 },
          limit: 10,
        },
      })
      .populate({
        path: "ratingAndReviews",
        select: "rating review",
        options: {
          sort: { createdAt: -1 },
          limit: 10,
        },
      })
      .populate({
        path: "currentBorrowerId",
        select: "firstName lastName email contactNumber profileImage",
      })
      .populate({
        path: "itemLocation",
      })) as unknown as ILendItem;

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    let totalRating = 0;

    if (item.ratingAndReviews && item.ratingAndReviews.length > 0) {
      item.ratingAndReviews.forEach((rating) => {
        totalRating += rating.rating;
      });
      item.avgRating = totalRating / item.ratingAndReviews.length;
    } else {
      item.avgRating = 0;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = (req.query.filter as string) || "";
    const filterPrice = parseInt(req.query.filterPrice as string) || 0;
    const filterDeposit = parseInt(req.query.filterDeposit as string) || 0;
    const filterCondition = (req.query.filterCondition as string) || "";
    const filterCategory = (req.query.filterCategory as string) || "";
    const filterDeliveryType = (req.query.filterDeliveryType as string) || "";
    const filterCity = (req.query.filterCity as string) || "";
    const filterState = (req.query.filterState as string) || "";

    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string) || 15;

    const items = (await Item.find({
      $or: [
        {
          name: {
            $regex: filter,
            $options: "i",
          },
        },
        {
          description: {
            $regex: filter,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: filter,
            $options: "i",
          },
        },
      ],
      price: {
        $gte: filterPrice,
      },
      depositAmount: {
        $gte: filterDeposit,
      },
      condition: {
        $regex: filterCondition,
        $options: "i",
      },
      deliveryType: {
        $regex: filterDeliveryType,
        $options: "i",
      },
      isAvailable: true,
    })
      .populate({
        path: "category",
        select: "name",
        match: {
          name: {
            $regex: filterCategory,
            $options: "i",
          },
        },
      })
      .populate({
        path: "lenderId",
        select: "firstName lastName profileImage",
      })
      .populate({
        path: "ratingAndReviews",
        select: "rating",
      })
      .populate({
        path: "itemLocation",
        select: "city state",
        match: {
          city: {
            $regex: filterCity,
            $options: "i",
          },
          state: {
            $regex: filterState,
            $options: "i",
          },
        },
      })
      .skip((page - 1) * limit)
      .limit(limit)) as unknown as ILendItem[];

    if (!items || items.length === 0) {
      res.status(404).json({
        success: false,
        message: "No items found",
      });
      return;
    }

    items.forEach((item) => {
      let totalRating = 0; // Reset for each item
      if (item.ratingAndReviews && item.ratingAndReviews.length > 0) {
        item.ratingAndReviews.forEach((rating) => {
          totalRating += rating.rating;
        });
        // Calculate and assign avgRating
        item.avgRating = totalRating / item.ratingAndReviews.length;
      } else {
        item.avgRating = 0; // Default if no ratings
      }
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = updateItemSchema.safeParse(req.body);
    const id = req.user?.id;
    const itemId = req.params.itemId;

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const item = await Item.findById(itemId);

    const uuid = new mongoose.Schema.Types.ObjectId(id as string);

    if (!item || item.lenderId !== uuid) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    const {
      name = item.name,
      description = item.description,
      price = item.price,
      depositAmount = item.depositAmount,
      category = item.category,
      tags = item.tags,
      isAvailable = item.isAvailable,
      condition = item.condition,
      availableFrom = item.availableFrom,
      deliveryCharges = item.deliveryCharges,
      deliveryType = item.deliveryType,
      deliveryRadius = item.deliveryRadius,
    } = parsedData.data;

    item.name = name;
    item.description = description;
    item.price = price;
    item.depositAmount = depositAmount;
    item.category = new mongoose.Schema.Types.ObjectId(category as string);
    item.tags = tags;
    item.isAvailable = isAvailable;
    item.condition = condition;
    item.availableFrom = availableFrom;
    item.deliveryCharges = deliveryCharges;
    item.deliveryType = deliveryType;
    item.deliveryRadius = deliveryRadius;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteItemImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.itemId;
    const id = req.user?.id;

    if (!id || !itemId) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const parsedData = deleteItemImagesSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const item = await Item.findById(itemId);

    const uuid = new mongoose.Schema.Types.ObjectId(id as string);

    if (!item || item.lenderId !== uuid) {
      res.status(404).json({
        success: false,
        message: "Item not found",
      });
      return;
    }

    const { images } = parsedData.data;

    if (images.length === 0) {
      res.status(400).json({
        success: false,
        message: "No images found",
      });
      return;
    }

    const filteredImages = item.images.filter(
      (image) => !images.includes(image)
    );

    item.images = filteredImages;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Images deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addNewImages = async (
  req: FileUploadRequest,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.itemId;
    const id = req.user?.id;

    if (!id || !itemId) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
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

    await Item.findByIdAndUpdate(itemId, {
      $push: {
        images: {
          $each: fileUrls,
        },
      },
    }),
      { new: true };

    res.status(200).json({
      success: true,
      message: "Images added successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
