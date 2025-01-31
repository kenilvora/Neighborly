import { Response } from "express";
import { AuthRequest } from "../middlewares/Auth";
import User from "../models/User";
import Item from "../models/Item";
import mongoose from "mongoose";
import Dispute from "../models/Dispute";
import { uploadFileToCloudinary } from "../utils/uploadFileToCloudinary";
import {
  createDisputeSchema,
  changeDisputeStatusSchema,
} from "@kenil_vora/neighborly";

export const createDispute = async (
  req: AuthRequest,
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

    const { againstWhom, againstWhomId, reason } = parsedData.data;

    if (!mongoose.Types.ObjectId.isValid(againstWhomId.toString())) {
      res.status(400).json({
        success: false,
        message: "Invalid againstWhomId",
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

    let againstWhomUserId;

    if (againstWhom === "Item") {
      const item = await Item.findById(againstWhomId);

      if (!item) {
        res.status(404).json({
          success: false,
          message: "Item not found",
        });
        return;
      }

      if (!user.borrowItems.includes(item._id)) {
        res.status(400).json({
          success: false,
          message: "You can't create dispute for this item",
        });
        return;
      }

      if (user.lendItems.includes(item._id)) {
        res.status(400).json({
          success: false,
          message: "You can't create dispute for your own item",
        });
        return;
      }

      againstWhomUserId = item.lenderId;
    } else {
      const againstWhomUser = await User.findById(againstWhomId);

      if (!againstWhomUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      if (againstWhomUser._id === id) {
        res.status(400).json({
          success: false,
          message: "You can't create dispute for yourself",
        });
        return;
      }

      againstWhomUserId = againstWhomUser._id;
    }

    const images = req.files?.images;
    let fileUrls: string[] = [];

    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];

      const uploadPromise = imageArray.map((image) =>
        uploadFileToCloudinary(image, process.env.CLOUD_FOLDER_NAME as string)
      );

      const results = await Promise.all(uploadPromise);

      fileUrls = results.map((result) => result.secure_url);
    }

    const dispute = await Dispute.create({
      userId: id,
      againstWhomId,
      againstWhom,
      reason,
      images: fileUrls,
    });

    user.disputesCreatedByMe?.push(dispute._id);

    await user.save();

    const againstWhomUser = await User.findById(againstWhomUserId);

    if (againstWhomUser) {
      againstWhomUser.disputesCreatedAgainstMe?.push(dispute._id);

      await againstWhomUser.save();
    }

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

export const getDisputesCreatedByMe = async (
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
      .select("disputesCreatedByMe")
      .populate({
        path: "disputesCreatedByMe",
        select: "-images -userId",
        populate: [
          {
            path: "againstWhomId",
            select: {
              $cond: {
                if: { $eq: ["$againstWhom", "Item"] },
                then: "name description price",
                else: "firstName lastName email contactNumber profileImage",
              },
            },
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

export const getDisputesCreatedAgainstMe = async (
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
      .select("disputesCreatedAgainstMe")
      .populate({
        path: "disputesCreatedAgainstMe",
        select: "-images",
        populate: [
          {
            path: "userId",
            select: "firstName lastName email contactNumber profileImage",
          },
          {
            path: "againstWhomId",
            select: {
              $cond: {
                if: { $eq: ["$againstWhom", "Item"] },
                then: "name description price",
                else: "",
              },
            },
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

    if (
      !id ||
      !disputeId ||
      !parsedData.success ||
      !mongoose.Types.ObjectId.isValid(disputeId)
    ) {
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

    if (!dispute) {
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

    if (!id || !disputeId || !mongoose.Types.ObjectId.isValid(disputeId)) {
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

    if (
      !user.disputesCreatedByMe?.includes(uuid) &&
      !user.disputesCreatedAgainstMe?.includes(uuid)
    ) {
      res.status(400).json({
        success: false,
        message: "You are not authorized to view this dispute",
      });
    }

    const dispute = await Dispute.findById(disputeId)
      .populate({
        path: "userId",
        select: "firstName lastName email contactNumber profileImage",
      })
      .populate({
        path: "againstWhomId",
        select: {
          $cond: {
            if: { $eq: ["$againstWhom", "Item"] },
            then: "name description price",
            else: "firstName lastName email contactNumber profileImage",
          },
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
