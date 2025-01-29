import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { itemEndpoints } from "../apis";
import { setIsLoading } from "../../slices/itemSlice";
import { Dispatch } from "redux";

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  images: string[];
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  deliveryCharges: number;
  avgRating: number;
  totalRating: number;
}

export function getAllItems(page: number, makeLoading: boolean = true) {
  return async (dispatch: Dispatch): Promise<Item[]> => {
    let result: Item[] = [];
    let toastId: string | number = "";
    try {
      dispatch(setIsLoading(true));
      if (makeLoading) {
        toastId = toast.loading("Fetching items...");
      }
      const response = await apiConnector(
        "GET",
        itemEndpoints.GET_ALL_ITEMS,
        null,
        null,
        { page: page }
      );

      if (!response.data.success) {
        throw new Error("An error occurred while fetching items");
      }

      result = response.data.data;
    } catch (error) {
      toast.error("An error occurred while fetching items");
    } finally {
      dispatch(setIsLoading(false));
      if (makeLoading) {
        toast.dismiss(toastId);
      }
    }
    return result;
  };
}
