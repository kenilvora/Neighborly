import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../reducer/store";
import CustomInput from "../../common/CustomInput";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { SubmitHandler, useForm } from "react-hook-form";
import { addMoney } from "../../../services/operations/transactionAPI";

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
      await dispatch(addMoney(data.amount, user) as any);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-10 justify-center mt-5">
      <div className="flex flex-col gap-5 border-2 border-neutral-300 bg-neutral-100 p-5 rounded-lg shadow-lg">
        <div className="text-2xl font-semibold">Account Balance :</div>
        <div className="text-4xl font-bold">₹ {user?.accountBalance}</div>
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
