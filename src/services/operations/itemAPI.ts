import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { itemEndpoints } from "../apis";
import { setIsLoading } from "../../slices/itemSlice";
import { Dispatch } from "redux";
import { IAllItem } from "@kenil_vora/neighborly";

export function getAllItems(
  page: number,
  makeLoading: boolean = true,
  filter: string = "",
  filterPrice: string = "",
  filterDeposit: string = "",
  filterCondition: string = "",
  filterCategory: string = "",
  filterDeliveryType: string = "",
  filterCity: string = "",
  filterState: string = "",
  filterCountry: string = "",
  filterTags: string = "",
  isAvailable: boolean = true,
  sorting: string = ""
) {
  return async (dispatch: Dispatch): Promise<IAllItem[]> => {
    let result: IAllItem[] = [];
    let toastId: string | number = "";
    try {
      const available = isAvailable ? "true" : "false";
      let sortField = "";
      let sortOrder = "";

      if (sorting === "price-asc") {
        sortField = "price";
        sortOrder = "1";
      } else if (sorting === "price-desc") {
        sortField = "price";
        sortOrder = "-1";
      } else if (sorting === "rating-asc") {
        sortField = "roundedAvgRating";
        sortOrder = "1";
      } else if (sorting === "rating-desc") {
        sortField = "roundedAvgRating";
        sortOrder = "-1";
      } else if (sorting === "newest-first") {
        sortField = "createdAt";
        sortOrder = "-1";
      }

      dispatch(setIsLoading(true));
      if (makeLoading) {
        toastId = toast.loading("Fetching items...");
      }
      const response = await apiConnector(
        "GET",
        itemEndpoints.GET_ALL_ITEMS,
        null,
        null,
        {
          page: page,
          ...(filter && { filter: filter }),
          ...(filterPrice && { filterPrice: filterPrice }),
          ...(filterDeposit && { filterDeposit: filterDeposit }),
          ...(filterCondition && { filterCondition: filterCondition }),
          ...(filterCategory && { filterCategory: filterCategory }),
          ...(filterDeliveryType && { filterDeliveryType: filterDeliveryType }),
          ...(filterCity && { filterCity: filterCity }),
          ...(filterState && { filterState: filterState }),
          ...(filterCountry && { filterCountry: filterCountry }),
          ...(filterTags.length > 0 && { filterTags: filterTags }),
          ...(available && { isAvailable: available }),
          ...(sortField && { sortField: sortField }),
          ...(sortOrder && { sortOrder: sortOrder }),
        }
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
