import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../reducer/store";
import CustomInput from "../../common/CustomInput";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { SubmitHandler, useForm } from "react-hook-form";
import { addMoney } from "../../../services/operations/transactionAPI";
import { setUser } from "../../../slices/userSlice";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import MoneyFormatter from "../../../utils/MoneyFormatter";
import { IoInformationCircleOutline } from "react-icons/io5";

interface WalletForm {
  amount: number;
}

const Wallet = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WalletForm>();

  const dispatch = useDispatch();

  const submitHandler: SubmitHandler<WalletForm> = async (data) => {
    try {
      const skt = new WebSocket("wss://neighborly-backend.kenilvora.tech");

      const startingMessage = {
        type: "payment_notification",
        userId: user?._id,
      };

      skt.onopen = () => {
        skt.send(JSON.stringify(startingMessage));
      };

      skt.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        if (receivedData.success === true) {
          toast.success("Payment Verified Successfully");

          const user = receivedData.user;

          dispatch(setUser(user));

          Cookies.set("user", JSON.stringify(user), {
            secure: true,
            sameSite: "lax",
            expires: 365,
          });

          skt.close();
        } else if (receivedData.success === false) {
          toast.error(receivedData.message);
          skt.close();
        }
      };

      await dispatch(addMoney(data.amount, user) as any);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-10 justify-center mt-5">
      <div className="flex flex-col gap-5 border-2 border-neutral-300 bg-neutral-100 p-5 rounded-lg shadow-lg">
        <div className="text-2xl font-semibold">Account Balance :</div>
        <div className="text-4xl font-bold relative w-fit">
          ₹ {MoneyFormatter(user?.accountBalance || 0)}
          <div className="absolute -top-1 -right-5 text-lg cursor-pointer group">
            <IoInformationCircleOutline />
            <div className="hidden group-hover:block absolute top-0 min-w-[300px] text-center -right-68 bg-neutral-300 px-5 py-1 rounded-lg shadow-lg">
              <p className="text-sm">
                Precise Account Balance : ₹ {user?.accountBalance}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        action=""
        className="flex flex-col gap-5 border-2 border-neutral-300 bg-neutral-100 p-5 rounded-lg shadow-lg"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="text-2xl font-semibold">
          Enter the amount you want to add to your wallet
        </h1>
        <CustomInput
          type="number"
          icon={HiOutlineCurrencyRupee}
          id="amount"
          name="amount"
          placeholder="Enter Amount"
          register={register}
          errors={errors.amount}
          fullWidth={true}
          required={true}
        />

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 w-fit transition-all duration-200 cursor-pointer">
          Add Money
        </button>
      </form>
    </div>
  );
};

export default Wallet;
