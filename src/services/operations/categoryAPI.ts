import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { categoryEndpoints } from "../apis";

export interface Category {
  _id: string;
  name: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const getAllCategories = async (): Promise<Category[]> => {
  let result: Category[] = [];
  try {
    const response = await apiConnector(
      "GET",
      categoryEndpoints.GET_ALL_CATEGORIES
    );

    if (!response.data.success) {
      throw new Error("An error occurred while fetching categories");
    }

    result = response.data.data;

    result = result.map((category) => ({
      ...category,
      name: category.name
        .split("-") // Split the name by hyphen
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join("-"), // Join the words back with hyphen
    }));
  } catch (error) {
    toast.error("An error occurred while fetching categories");
  }
  return result;
};
