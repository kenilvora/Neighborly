import { Request, Response } from "express";
import { z } from "zod";
import Category from "../models/Category";
import mongoose from "mongoose";

const addCategorySchema = z.object({
  name: z.string(),
});

export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsedData = addCategorySchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const { name } = parsedData.data;

    const category = await Category.findOne({
      name: name.toLowerCase().replace(/ /g, "-"),
    });

    if (category) {
      res.status(400).json({
        success: false,
        message: "Category already exists",
      });
      return;
    }

    await Category.create({
      name: name.toLowerCase().replace(/ /g, "-"),
      itemCount: 0,
      items: [],
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid data",
      });
      return;
    }

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    if (category.itemCount > 0) {
      res.status(400).json({
        success: false,
        message: "Category has items",
      });
      return;
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = (req.query.filter as string) || "";

    const categories = await Category.find({
      name: {
        $regex: filter.toLowerCase().replace(" ", "-"),
        $options: "i",
      },
    }).select("-items");

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
