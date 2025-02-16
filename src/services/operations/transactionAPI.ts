import { ITransaction } from "@kenil_vora/neighborly";
import { apiConnector } from "../apiConnector";
import { transactionEndpoints } from "../apis";
import toast from "react-hot-toast";
import { Dispatch } from "redux";
import { setIsLoading } from "../../slices/userSlice";
import rzpLogo from "../../assets/rzpLogo.png";
import { RootState } from "../../reducer/store";

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

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export function addMoney(amount: number, user: RootState["user"]["user"]) {
  const toastId = toast.loading("Please wait while we process your request");
  return async (dispatch: Dispatch): Promise<void> => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    try {
      dispatch(
        setIsLoading({
          key: "addMoney",
          value: true,
        })
      );

      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      const order = await apiConnector("POST", transactionEndpoints.ADD_MONEY, {
        amount,
      });

      if (!order.data.success) {
        throw new Error("Failed to create order");
      }

      const options = {
        key: razorpayKey,
        currency: order.data.data.currency,
        amount: `${order.data.data.amount}`,
        order_id: order.data.data.id,
        name: "Neighborly",
        description: "Add Money",
        image: rzpLogo,
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          contact: user?.contactNumber,
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      paymentObject.on("payment.failed", function (_response: any) {
        toast.error("Oops, Payment failed");
      });
    } catch (error) {
      toast.error("Failed to add money");
    } finally {
      dispatch(
        setIsLoading({
          key: "addMoney",
          value: false,
        })
      );
      toast.dismiss(toastId);
    }
  };
}
