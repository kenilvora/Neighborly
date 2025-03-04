import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { itemEndpoints } from "../apis";
import { setIsLoading } from "../../slices/itemSlice";
import { Dispatch } from "redux";
import {
  BorrowItemInput,
  IAllItem,
  IBorrowedItemData,
  IItemWithAvgRating,
} from "@kenil_vora/neighborly";
import { AxiosHeaders } from "axios";

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

      dispatch(
        setIsLoading({
          key: "getAllItems",
          value: true,
        })
      );
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
      dispatch(
        setIsLoading({
          key: "getAllItems",
          value: false,
        })
      );
      if (makeLoading) {
        toast.dismiss(toastId);
      }
    }
    return result;
  };
}

export async function getAllBorrowedItems(
  type?: string,
  paymentStatus?: string
): Promise<IBorrowedItemData[]> {
  let result: IBorrowedItemData[] = [];
  try {
    const res = await apiConnector(
      "GET",
      itemEndpoints.GET_ALL_BORROWED_ITEMS,
      null,
      null,
      {
        ...(type && { type: type }),
        ...(paymentStatus && { paymentStatus: paymentStatus }),
      }
    );

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    result = res.data.data;
  } catch (error) {
    toast.error((error as any).response.data.message);
  } finally {
    return result;
  }
}

export function addItem(data: FormData) {
  return async (dispatch: Dispatch): Promise<void> => {
    const toastId = toast.loading("Adding item...");
    try {
      dispatch(
        setIsLoading({
          key: "addItem",
          value: true,
        })
      );

      const header = new AxiosHeaders();

      header.set("Content-Type", "multipart/form-data");

      const res = await apiConnector(
        "POST",
        itemEndpoints.CREATE_ITEM,
        data,
        header
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Item Added Successfully");
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      dispatch(
        setIsLoading({
          key: "addItem",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}

export async function getItemsOfALender(
  userId?: string
): Promise<IItemWithAvgRating[]> {
  let result: IItemWithAvgRating[] = [];
  try {
    const res = await apiConnector(
      "GET",
      itemEndpoints.GET_ITEMS_OF_A_LENDER,
      null,
      null,
      {
        ...(userId && { userId: userId }),
      }
    );

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    result = res.data.data;
  } catch (error) {
    toast.error((error as any).response.data.message);
  } finally {
    return result;
  }
}

export async function getItemById(itemId: string): Promise<IItemWithAvgRating> {
  let result: IItemWithAvgRating = {} as IItemWithAvgRating;
  const toastId = toast.loading("Fetching item...");
  try {
    const res = await apiConnector(
      "GET",
      `${itemEndpoints.GET_ITEM}/${itemId}`
    );

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    result = res.data.data;
  } catch (error) {
    toast.error((error as any).response.data.message);
  } finally {
    toast.dismiss(toastId);
    return result;
  }
}

export async function borrowItem(itemData: BorrowItemInput): Promise<boolean> {
  try {
    const res = await apiConnector("POST", itemEndpoints.BORROW_ITEM, itemData);

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    toast.success("Item Borrowed Successfully");
    return true;
  } catch (error) {
    toast.error((error as any).response.data.message);
    return false;
  }
}

export async function updateItem(
  itemData: FormData,
  itemId: string
): Promise<boolean> {
  const toastId = toast.loading("Updating item...");
  try {
    const header = new AxiosHeaders();

    header.set("Content-Type", "multipart/form-data");

    const res = await apiConnector(
      "PUT",
      `${itemEndpoints.UPDATE_ITEM}/${itemId}`,
      itemData,
      header
    );

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    toast.success("Item Updated Successfully");
    return true;
  } catch (error) {
    toast.error((error as any).response.data.message);
    return false;
  } finally {
    toast.dismiss(toastId);
  }
}
