import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import { z } from "zod";
import { uploadFileToCloudinary } from "../utils/uploadFileToCloudinary";
import Item from "../models/Item";
import Category from "../models/Category";
import User from "../models/User";
import mongoose from "mongoose";
import Notification from "../models/Notification";
import getAvgRating from "../utils/getAverageRating";
import { objectIdSchema } from "./RatingAndReview";

const addItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  depositAmount: z.number(),
  category: objectIdSchema,
  tags: z.array(z.string()),
  isAvailable: z.boolean(),
  condition: z.enum(["New", "Like New", "Good", "Average", "Poor"]),
  availableFrom: z.string().date(),
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
  category: objectIdSchema.optional(),
  tags: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
  condition: z.enum(["New", "Like New", "Good", "Average", "Poor"]).optional(),
  availableFrom: z.string().date().optional(),
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
  _id: mongoose.Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  upiId?: string;
  profileImage: string;
}

interface ILendItem {
  _id: mongoose.Schema.Types.ObjectId;
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
  deliveryCharges?: number;
  deliveryType?: "Pickup" | "Delivery" | "Both (Pickup & Delivery)";
  deliveryRadius?: number;
  itemLocation?: IAddress;
}

interface IItemWithAvgRating {
  item: ILendItem;
  avgRating: number;
}

interface IAllItem {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  images: string[];
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  deliveryCharges: number;
  avgRating: number;
  totalRating?: number;
}

interface IAllItems {
  lendItems: ILendItem[];
}

export const addItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedBody = {
      ...req.body,
      price: parseInt(req.body.price),
      depositAmount: parseInt(req.body.depositAmount),
      tags: JSON.parse(req.body.tags),
      isAvailable: req.body.isAvailable === "true",
      deliveryCharges: req.body.deliveryCharges
        ? parseInt(req.body.deliveryCharges)
        : 0,
      deliveryRadius: req.body.deliveryRadius
        ? parseInt(req.body.deliveryRadius)
        : 0,
    };
    const parsedData = addItemSchema.safeParse(parsedBody);
    const id = req.user?.id;

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
        error: parsedData.error,
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

    if (!mongoose.Types.ObjectId.isValid(category.toString())) {
      res.status(400).json({
        success: false,
        message: "Invalid category",
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

    if (!itemId || !id || !mongoose.Types.ObjectId.isValid(itemId)) {
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
      if (item.lenderId !== id) {
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
    let includeBorrowers = false;
    let id;
    if (req.query.userId) {
      id = req.query.userId;
    } else {
      id = req.user?.id;
      includeBorrowers = true;
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
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

    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string) || 15;

    const items = (await User.findById(id)
      .select("lendItems")
      .populate<ILendItem>({
        path: "lendItems",
        select: includeBorrowers
          ? "-lenderId -itemLocation"
          : "-lenderId -borrowers -itemLocation",
        populate: [
          {
            path: "category",
            select: "name",
          },
          {
            path: "ratingAndReviews",
            select: "rating",
          },
          {
            path: "lenderId",
            select: "firstName lastName email contactNumber profileImage",
          },
          {
            path: "currentBorrowerId",
            select: "firstName lastName email contactNumber profileImage",
          },
        ],
        options: {
          sort: { createdAt: -1 },
          limit,
          skip: (page - 1) * limit,
        },
      })) as unknown as IAllItems;

    if (includeBorrowers) {
      items.lendItems.forEach((item) => {
        item.lenderId = undefined;
      });
    }

    let updatedItems: IItemWithAvgRating[] = [];

    if (items?.lendItems && items.lendItems.length > 0) {
      updatedItems = items.lendItems.map((item) => {
        return {
          item: item,
          avgRating: getAvgRating(item.ratingAndReviews),
        };
      }) as IItemWithAvgRating[];
    }

    if (updatedItems && updatedItems.length === 0) {
      res.status(404).json({
        success: false,
        message: "No items found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedItems,
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

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
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

    let updatedItem: IItemWithAvgRating, avgRating: number;

    if (item.ratingAndReviews && item.ratingAndReviews.length > 0) {
      avgRating = getAvgRating(item.ratingAndReviews);
    } else {
      avgRating = 0;
    }

    updatedItem = {
      item: item,
      avgRating: avgRating,
    };

    res.status(200).json({
      success: true,
      data: updatedItem,
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
    const filter = (req.query.filter as string) || ""; // done
    const filterPrice = parseInt(req.query.filterPrice as string) || 0; // done
    const filterDeposit = parseInt(req.query.filterDeposit as string) || 0;
    const filterCondition = (req.query.filterCondition as string) || ""; // done
    const filterCategory = (req.query.filterCategory as string) || ""; // done
    const filterDeliveryType = (req.query.filterDeliveryType as string) || "";
    const filterCity = (req.query.filterCity as string) || ""; // done
    const filterState = (req.query.filterState as string) || ""; // done
    const filterCountry = (req.query.filterCountry as string) || ""; // done
    const filterTags =
      ((req.query.filterTags &&
        JSON.parse(req.query.filterTags as string)) as string[]) || [];

    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string) || 15;

    let items = (await Item.find({
      $and: [
        {
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
        },
        {
          price: {
            $gte: filterPrice,
          },
        },
        {
          depositAmount: {
            $gte: filterDeposit,
          },
        },
        {
          condition: {
            $regex: filterCondition,
            $options: "i",
          },
        },
        {
          deliveryType: {
            $regex: filterDeliveryType,
            $options: "i",
          },
        },
        { isAvailable: true },
      ],
    })
      .select("-borrowers -currentBorrowerId")
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
        select: "city state country",
        match: {
          $and: [
            {
              city: {
                $regex: filterCity,
                $options: "i",
              },
            },
            {
              state: {
                $regex: filterState,
                $options: "i",
              },
            },
            {
              country: {
                $regex: filterCountry,
                $options: "i",
              },
            },
          ],
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

    items = items.filter((item) => {
      if (filterTags && filterTags.length > 0) {
        return (
          item.category !== null &&
          item.itemLocation !== null &&
          filterTags.some((tag) =>
            item.tags.some(
              (itemTag) => itemTag.toLowerCase() === tag.toLowerCase()
            )
          )
        );
      }
      return item.category !== null && item.itemLocation !== null;
    });

    let updatedItems: IAllItem[] = [];

    updatedItems = items.map((item) => {
      return {
        _id: item._id,
        name: item.name,
        description: item.description,
        condition: item.condition,
        deliveryCharges: item.deliveryCharges || 0,
        price: item.price,
        depositAmount: item.depositAmount,
        images: item.images,
        avgRating: getAvgRating(item.ratingAndReviews),
        totalRating: item.ratingAndReviews.length,
      };
    });

    res.status(200).json({
      success: true,
      data: updatedItems,
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

    if (!id || !itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(400).json({
        success: false,
        message: "Invalid id of either user or item",
      });
      return;
    }

    const item = await Item.findById(itemId);

    if (!item || item.lenderId !== id) {
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

    if (!mongoose.Types.ObjectId.isValid(category.toString())) {
      res.status(400).json({
        success: false,
        message: "Invalid category",
      });
      return;
    }

    if (price <= 0 || depositAmount <= 0 || depositAmount <= price) {
      res.status(400).json({
        success: false,
        message: "Invalid price or deposit amount",
      });
      return;
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      res.status(400).json({
        success: false,
        message: "Category does not exist",
      });
      return;
    }

    if (parsedData.data.category !== item.category) {
      await Category.findByIdAndUpdate(item.category, {
        $inc: { itemCount: -1 },
        $pull: { items: item._id },
      });

      await Category.findByIdAndUpdate(parsedData.data.category, {
        $inc: { itemCount: 1 },
        $push: { items: item._id },
      });
    }

    if (
      parsedData.data.availableFrom &&
      new Date(availableFrom).toISOString().slice(0, 10) <
        new Date().toISOString().slice(0, 10)
    ) {
      res.status(400).json({
        success: false,
        message: "Available from date should be in the future",
      });
      return;
    }

    item.name = name;
    item.description = description;
    item.price = price;
    item.depositAmount = depositAmount;
    item.category = existingCategory._id;
    item.tags = tags;
    item.isAvailable = isAvailable;
    item.condition = condition;
    item.availableFrom = new Date(availableFrom);
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
      error: err,
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

    if (!id || !itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
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

    if (!item || item.lenderId !== id) {
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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.itemId;
    const id = req.user?.id;

    if (!id || !itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
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
