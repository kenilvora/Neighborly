import { useForm } from "react-hook-form";
import CustomInput from "../components/common/CustomInput";
import { MdEmail } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordToken } from "../services/operations/userAPI";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ForgotPasswordInput {
  email: string;
}

const ForgotPasswordToken = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>();

  const { isLoading } = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch();

  const [isTimerOn, setIsTimerOn] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;

    if (isTimerOn) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setIsTimerOn(false);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerOn]);

  const SubmitHandler = async (data: ForgotPasswordInput) => {
    try {
      if (isTimerOn) {
        toast.error("Please wait for the timer to finish.");
        return;
      }

      await dispatch(resetPasswordToken(data.email) as any);

      setIsTimerOn(true);
      setTimer(60);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isLoading.resetPasswordToken ? (
        <Loader />
      ) : (
        <>
          <Helmet>
            <title>Neighborly | Forgot Password</title>
            <meta
              name="description"
              content="Forgot your password? No worries! Enter your email to reset your password."
            />
            <meta
              name="keywords"
              content="Neighborly, forgot password, reset password, email, password, login, sign in"
            />
          </Helmet>

          <div className="w-full min-h-[calc(100vh-74.8px)] overflow-hidden flex justify-center items-center">
            <div className="w-[90%] max-w-[1000px] flex flex-col justify-center gap-4 p-5 py-10 max-[800px]:py-5 max-[800px]:pb-1 max-[800px]:px-3 rounded-xl border-3 border-neutral-100 shadow-xl">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-4xl font-bold max-[600px]:text-2xl max-[400px]:text-xl">
                  Reset Your Password
                </h1>
                <p className="text-neutral-500 max-w-[50%] text-lg max-[600px]:text-sm max-[400px]:text-xs">
                  Forgot your password? No worries! Enter your email to reset
                  your password.
                </p>
              </div>

              <form
                action=""
                className="w-full flex flex-col gap-5 items-center"
                onSubmit={handleSubmit(SubmitHandler)}
              >
                <CustomInput
                  icon={MdEmail}
                  id="email"
                  name="email"
                  placeholder="Enter your Email"
                  register={register}
                  type="email"
                  errors={errors.email}
                />

                <button
                  className={`text-white font-semibold py-2 rounded-lg text-lg w-[50%] max-[800px]:w-full
                  ${
                    isTimerOn
                      ? `cursor-not-allowed bg-neutral-400`
                      : "cursor-pointer bg-blue-500 "
                  }
                `}
                  disabled={isTimerOn}
                >
                  Reset Password {isTimerOn && `in (${timer})s`}
                </button>

                <NavLink
                  to={"/login"}
                  className="text-blue-400 font-medium flex items-center gap-2"
                >
                  <FaArrowLeftLong className="" />
                  Back To Login
                </NavLink>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ForgotPasswordToken;
