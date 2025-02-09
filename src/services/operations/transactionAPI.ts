import { ITransaction } from "@kenil_vora/neighborly";
import { apiConnector } from "../apiConnector";
import { transactionEndpoints } from "../apis";
import toast from "react-hot-toast";

export async function getAllTransactions(): Promise<ITransaction[]> {
  let result: ITransaction[] = [];
  try {
    const res = await apiConnector(
      "GET",
      transactionEndpoints.GET_ALL_TRANSACTIONS
    );

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    result = res.data.data;
  } catch (error) {
    toast.error((error as any).respnosse.data.message);
  } finally {
    return result;
  }
}
