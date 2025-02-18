import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { IoMdLock } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/operations/userAPI";
import Loader from "../components/common/Loader";
import { RootState } from "../reducer/store";

interface ForgotPasswordInput {
  password: string;
  confirmPassword: string;
}

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    watch,
    reset,
  } = useForm<ForgotPasswordInput>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    passwordMatch: false,
  });

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!password) {
      setPasswordCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        passwordMatch: false,
      });
      return;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g.test(password);
    const hasLength = password.length >= 8;
    const passwordMatch = password === confirmPassword;

    setPasswordCriteria({
      length: hasLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecial,
      passwordMatch: passwordMatch,
    });
  }, [password, confirmPassword]);

  const submitForm: SubmitHandler<ForgotPasswordInput> = async (data) => {
    if (!passwordCriteria.length) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (!passwordCriteria.uppercase) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }
    if (!passwordCriteria.lowercase) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }
    if (!passwordCriteria.number) {
      toast.error("Password must contain at least one number");
      return;
    }
    if (!passwordCriteria.special) {
      toast.error("Password must contain at least one special character");
      return;
    }
    if (!passwordCriteria.passwordMatch) {
      toast.error("Password & Confirm Password must match");
      return;
    }

    const token = location.pathname.split("/").at(-1);

    if (!token) {
      toast.error("Invalid Token");
    }

    await dispatch(
      resetPassword(
        data.password,
        data.confirmPassword,
        token!,
        navigate
      ) as any
    );

    if (isSubmitSuccessful) {
      reset();
    }
  };

  return (
    <>
      {isLoading.resetPasswordToken ? (
        <Loader />
      ) : (
        <>
          <div className="w-full h-[calc(100vh-74.8px)] overflow-auto flex justify-center items-center">
            <div className="w-[90%] max-w-[1000px] flex flex-col justify-center gap-4 p-5 py-10 max-[800px]:py-5 max-[800px]:pb-1 max-[800px]:px-3 rounded-xl border-3 border-neutral-100 shadow-xl">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-4xl font-bold max-[600px]:text-2xl max-[400px]:text-xl">
                  Reset Your Password
                </h1>
                <p className="text-neutral-500 text-lg max-[600px]:text-sm max-[400px]:text-xs">
                  Reset your password to continue!
                </p>
              </div>
              <form
                action=""
                className="flex flex-col gap-5 w-[85%] max-[800px]:w-full self-center my-4"
                onSubmit={handleSubmit(submitForm)}
              >
                <div className="flex flex-col gap-1 relative">
                  <div className="absolute text-xl top-[11px] left-3 text-neutral-500">
                    <IoMdLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your Password"
                    className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9 pr-[39px]"
                    autoComplete="off"
                    {...register("password", { required: true })}
                    required
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    minLength={8}
                  />
                  <span
                    className="absolute hover:cursor-pointer top-[10px] text-2xl right-2 text-neutral-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </span>
                  {errors.password && (
                    <span className="text-neutral-800 font-semibold opacity-70">
                      Please enter your password
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 relative">
                  <div className="absolute text-xl top-[11px] left-3 text-neutral-500">
                    <IoMdLock />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your Password"
                    className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9 pr-[39px]"
                    autoComplete="off"
                    {...register("confirmPassword", { required: true })}
                    required
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    minLength={8}
                  />
                  <span
                    className="absolute hover:cursor-pointer top-[10px] text-2xl right-2 text-neutral-600"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </span>
                </div>
                <div className="flex flex-col justify-center gap-2 max-[560px]:text-sm max-[490px]:text-xs">
                  <p
                    className={`flex items-center gap-2 font-medium
                      ${
                        passwordCriteria.length
                          ? "text-green-500"
                          : "text-red-500"
                      }
                  `}
                  >
                    {passwordCriteria.length ? (
                      <FaCircleCheck className="text-green-500" />
                    ) : (
                      <FaCircleXmark className="text-red-500" />
                    )}
                    Password must be at least 8 characters long
                  </p>
                  <p
                    className={`flex items-center gap-2 font-medium
                      ${
                        passwordCriteria.uppercase
                          ? "text-green-500"
                          : "text-red-500"
                      }
                  `}
                  >
                    {passwordCriteria.uppercase ? (
                      <FaCircleCheck className="text-green-500" />
                    ) : (
                      <FaCircleXmark className="text-red-500" />
                    )}
                    Password must contain at least one uppercase letter
                  </p>
                  <p
                    className={`flex items-center gap-2 font-medium
                      ${
                        passwordCriteria.lowercase
                          ? "text-green-500"
                          : "text-red-500"
                      }
                  `}
                  >
                    {passwordCriteria.lowercase ? (
                      <FaCircleCheck className="text-green-500" />
                    ) : (
                      <FaCircleXmark className="text-red-500" />
                    )}
                    Password must contain at least one lowercase letter
                  </p>
                  <p
                    className={`flex items-center gap-2 font-medium
                      ${
                        passwordCriteria.number
                          ? "text-green-500"
                          : "text-red-500"
                      }
                  `}
                  >
                    {passwordCriteria.number ? (
                      <FaCircleCheck className="text-green-500" />
                    ) : (
                      <FaCircleXmark className="text-red-500" />
                    )}
                    Password must contain at least one number
                  </p>
                  <p
                    className={`flex items-center gap-2 font-medium
                      ${
                        passwordCriteria.special
                          ? "text-green-500"
                          : "text-red-500"
                      }
                  `}
                  >
                    {passwordCriteria.special ? (
                      <FaCircleCheck className="text-green-500" />
                    ) : (
                      <FaCircleXmark className="text-red-500" />
                    )}
                    Password must contain at least one special character
                  </p>
                  <p
                    className={`flex items-center gap-2 font-medium
                      ${
                        passwordCriteria.passwordMatch
                          ? "text-green-500"
                          : "text-red-500"
                      }
                  `}
                  >
                    {passwordCriteria.passwordMatch ? (
                      <FaCircleCheck className="text-green-500" />
                    ) : (
                      <FaCircleXmark className="text-red-500" />
                    )}
                    Password & Confirm Password must match
                  </p>
                </div>
                <button className="bg-blue-500 cursor-pointer text-white font-semibold py-2 rounded-lg text-lg">
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ForgotPassword;
