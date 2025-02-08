import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { ratingAndReviewEndpoints } from "../apis";
import {
  IRatingsAndReviewsOfItemInDetail,
  IRatingsAndReviewsOfUserInDetail,
} from "@kenil_vora/neighborly";

export async function getRatingAndReviewsOfItemsOfAUser(): Promise<
  IRatingsAndReviewsOfItemInDetail[]
> {
  let result: IRatingsAndReviewsOfItemInDetail[] = [];

  try {
    const res = await apiConnector(
      "GET",
      ratingAndReviewEndpoints.GET_RATING_AND_REVIEW_ITEM_OF_USER
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

export async function getRatingAndReviewsOfUser(): Promise<IRatingsAndReviewsOfUserInDetail> {
  let result: IRatingsAndReviewsOfUserInDetail =
    {} as IRatingsAndReviewsOfUserInDetail;

  try {
    const res = await apiConnector(
      "GET",
      ratingAndReviewEndpoints.GET_RATING_AND_REVIEW_USER
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
