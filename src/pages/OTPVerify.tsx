import { useEffect, useState } from "react";
import OTPInput from "react-otp-input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import { sendOtp, signUp } from "../services/operations/userAPI";
import { useNavigate } from "react-router-dom";

const OTPVerify = () => {
  const [otp, setOtp] = useState("");

  const { isLoading, signUpData, otpType, loginData, twoFactorAuthData } =
    useSelector((state: RootState) => state.user);

  const [countDown, setCountDown] = useState(60);
  const [isTimerOn, setIsTimerOn] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (otpType === "signup" && !signUpData) {
      navigate("/signup");
    }
    if (otpType === "login" && !loginData) {
      navigate("/login");
    }
    if (otpType === "twoFactorAuth" && !twoFactorAuthData) {
      navigate("/dashboard/profile");
    }
  }, [otpType, signUpData, loginData, twoFactorAuthData, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerOn) {
      timer = setInterval(() => {
        setCountDown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setIsTimerOn(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countDown, isTimerOn]);

  const resendOTP = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!signUpData) {
      navigate("/signup");
      return;
    }
    event.preventDefault();
    if (isTimerOn) return;
    dispatch(sendOtp(signUpData?.email, null, otpType) as any);
    setCountDown(60);
    setIsTimerOn(true);
  };

  const SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otpType === "signup" && signUpData) {
      console.log(signUpData);
      const updatedData = { ...signUpData };
      updatedData.otp = parseInt(otp);
      console.log(updatedData);
      dispatch(signUp(updatedData, navigate) as any);
    }
  };

  return (
    <>
      {isLoading ||
      (otpType === "signup" && !signUpData) ||
      (otpType === "login" && !loginData) ||
      (otpType === "twoFactorAuth" && !twoFactorAuthData) ? (
        <Loader />
      ) : (
        <div className="w-full h-[calc(100vh-75px)] flex justify-center items-center px-5">
          <div className="flex flex-col justify-center rounded-lg gap-3 text-center">
            <h1 className="font-bold text-2xl">Verify Your OTP</h1>
            <p className="text-neutral-600 text-lg max-[500px]:text-base max-[390px]:text-sm">
              One Step Away from Borrowing & Lending!
            </p>

            <form
              action=""
              className="flex flex-col gap-5 w-full"
              onSubmit={SubmitHandler}
            >
              <OTPInput
                value={otp}
                numInputs={6}
                onChange={setOtp}
                renderInput={(props, index) => (
                  <input
                    {...props}
                    placeholder="-"
                    className={`font-bold text-xl py-2 border-2 text-center outline-neutral-500 focus:outline-2 border-neutral-300 caret-neutral-800 text-neutral-600 flex flex-wrap
                    outline-offset-2 rounded-lg min-w-12 max-[360px]:min-w-11 max-[335px]:min-w-10
                      ${
                        index === 0
                          ? "mr-2 max-[500px]:mr-1"
                          : "mx-2 max-[500px]:mx-1"
                      }
                      ${
                        index === 5
                          ? "ml-2 max-[500px]:ml-1"
                          : "mx-2 max-[500px]:mx-1"
                      }
                  `}
                    autoComplete="off"
                    id={`otp-input${index}`}
                  />
                )}
                containerStyle={{
                  justifyContent: "center",
                }}
              ></OTPInput>

              <p className="text-neutral-600 text-sm">
                For security reasons, please do not share your OTP.
              </p>

              {isTimerOn ? (
                <p className="text-neutral-600 text-sm">
                  Didn't receive the OTP?{" "}
                  <span className="text-primary-500 font-bold">
                    {countDown} seconds
                  </span>{" "}
                  left to resend.
                </p>
              ) : (
                <button
                  type="button"
                  className="bg-neutral-200 rounded-lg p-2 cursor-pointer text-neutral-700 font-bold"
                  onClick={resendOTP}
                >
                  Resend OTP
                </button>
              )}

              <button className="px-5 py-2 bg-neutral-400 rounded-lg text-neutral-100 font-bold cursor-pointer">
                Verify OTP
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OTPVerify;
