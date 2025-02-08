import { ChangePasswordInput } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { IoMdLock } from "react-icons/io";
import { useDispatch } from "react-redux";
import { changePassword } from "../../../../services/operations/userAPI";

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    watch,
    reset,
  } = useForm<ChangePasswordInput>();

  const dispatch = useDispatch();

  const password = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    passwordMatch: false,
  });

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

  const onSubmit: SubmitHandler<ChangePasswordInput> = (data) => {
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

    dispatch(changePassword(data) as any);

    if (isSubmitSuccessful) {
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-3 px-7 py-5 rounded-lg shadow-md border border-neutral-300">
      <div className="text-2xl font-semibold">Change Password</div>
      <form
        className="flex flex-col w-full gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full flex justify-between gap-5 max-[1090px]:flex-col">
          <div className="flex flex-col w-[50%] max-[1090px]:w-full gap-5">
            <div className="w-full flex flex-col gap-1 relative">
              <div className="absolute text-xl top-[11px] left-3 text-neutral-500">
                <IoMdLock />
              </div>
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                placeholder="Enter your Old Password"
                className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] 
            outline-blue-500 pl-9 pr-[39px]"
                autoComplete="off"
                {...register("oldPassword", { required: true })}
                required
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                minLength={8}
              />
              <span
                className="absolute hover:cursor-pointer top-[10px] text-2xl right-2 text-neutral-600"
                onClick={() => setShowOldPassword((prev) => !prev)}
              >
                {showOldPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
              {errors.oldPassword && (
                <span className="text-neutral-800 font-semibold opacity-70">
                  Please enter your old password
                </span>
              )}
            </div>
            <div className="w-full flex flex-col gap-1 relative">
              <div className="absolute text-xl top-[11px] left-3 text-neutral-500">
                <IoMdLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your New Password"
                className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] 
            outline-blue-500 pl-9 pr-[39px]"
                autoComplete="off"
                {...register("newPassword", { required: true })}
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
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
              {errors.newPassword && (
                <span className="text-neutral-800 font-semibold opacity-70">
                  Please enter your password
                </span>
              )}
            </div>
            <div className="w-full flex flex-col gap-1 relative">
              <div className="absolute text-xl top-[11px] left-3 text-neutral-500">
                <IoMdLock />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your New Password"
                className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9 pr-[39px]"
                autoComplete="off"
                {...register("confirmPassword", { required: true })}
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
              {errors.confirmPassword && (
                <span className="text-neutral-800 font-semibold opacity-70">
                  Please confirm your password
                </span>
              )}
            </div>
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
        </div>

        <button className="bg-blue-500 cursor-pointer text-white font-semibold py-2 rounded-lg text-lg w-fit px-4">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
