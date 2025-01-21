import { Response } from "express";
import { AuthRequest, FileUploadRequest } from "../middlewares/Auth";
import { z } from "zod";
import User from "../models/User";
import Item from "../models/Item";
import mongoose from "mongoose";
import Dispute from "../models/Dispute";
import { uploadFileToCloudinary } from "../utils/uploadFileToCloudinary";

const createDisputeSchema = z.object({
  itemId: z.string(),
  reason: z.string(),
  type: z.enum(["Create By Other", "Create By You"]),
});

const changeDisputeStatusSchema = z.object({
  status: z.enum(["Resolved", "Closed"]),
});

export const createDispute = async (
  req: FileUploadRequest,
  res: Response
): Promise<void> => {
  try {
    const parsedData = createDisputeSchema.safeParse(req.body);
    const id = req.user?.id;

    if (!parsedData.success || !id) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { itemId, reason, type } = parsedData.data;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
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

    const uuid = new mongoose.Schema.Types.ObjectId(itemId);

    if (!user.borrowItems.includes(uuid)) {
      res.status(400).json({
        success: false,
        message: "You can't create dispute for this item",
      });
      return;
    }

    if (user.lendItems.includes(uuid)) {
      res.status(400).json({
        success: false,
        message: "You can't create dispute for your own item",
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

    const dispute = await Dispute.create({
      userId: id,
      itemId,
      reason,
      images: fileUrls,
      type,
    });

    const disputeId = new mongoose.Schema.Types.ObjectId(dispute._id as string);

    user.disputes?.push(disputeId);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Dispute created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDisputes = async (
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

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const disputes = await User.findById(id)
      .select("disputes")
      .populate({
        path: "disputes",
        select: "-images",
        populate: [
          {
            path: "itemId",
            select: "name description price condition",
            populate: {
              path: "category",
              select: "name",
            },
          },
          {
            path: "userId",
            select: "firstName lastName email contactNumber profileImage",
          },
        ],
      });

    res.status(200).json({
      success: true,
      data: disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changeDisputeStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    const disputeId = req.params.id;

    const parsedData = changeDisputeStatusSchema.safeParse(req.body);

    if (!id || !disputeId || !parsedData.success) {
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

    const dispute = await Dispute.findById(disputeId);

    const uuid = new mongoose.Schema.Types.ObjectId(dispute?._id as string);

    if (!dispute || !user.disputes?.includes(uuid)) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    if (dispute.status === "Closed") {
      res.status(400).json({
        success: false,
        message: "Dispute already closed",
      });
      return;
    }

    if (dispute.status === "Resolved") {
      res.status(400).json({
        success: false,
        message: "Dispute already resolved",
      });
      return;
    }

    if (dispute.type === "Create By You") {
      res.status(400).json({
        success: false,
        message: "You can't change status of dispute created by you",
      });
      return;
    }

    dispute.status = parsedData.data.status;

    await dispute.save();

    if (parsedData.data.status === "Resolved") {
      res.status(200).json({
        success: true,
        message: "Dispute resolved successfully",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Dispute closed successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDisputeById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    const disputeId = req.params.id;

    if (!id || !disputeId) {
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

    const uuid = new mongoose.Schema.Types.ObjectId(disputeId);

    if (!user.disputes?.includes(uuid)) {
      res.status(400).json({
        success: false,
        message: "You can't access this dispute",
      });
      return;
    }

    const dispute = await Dispute.findById(disputeId)
      .populate({
        path: "userId",
        select: "firstName lastName email contactNumber profileImage",
      })
      .populate({
        path: "itemId",
        select: "name description price condition",
        populate: {
          path: "category",
          select: "name",
        },
      });

    if (!dispute) {
      res.status(404).json({
        success: false,
        message: "Dispute not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
