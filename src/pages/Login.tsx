import { SubmitHandler, useForm } from "react-hook-form";
import CustomInput from "../components/common/CustomInput";
import { MdEmail } from "react-icons/md";
import { LoginInput } from "@kenil_vora/neighborly";
import { IoMdLock } from "react-icons/io";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../services/operations/userAPI";
import { useNavigate } from "react-router-dom";
import { setLoginData } from "../slices/userSlice";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<LoginInput>();

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state: RootState) => state.user);

  const SubmitHandler: SubmitHandler<LoginInput> = (data) => {
    dispatch(setLoginData(data));
    dispatch(login(data, navigate) as any);

    if (isSubmitSuccessful) {
      reset();
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-[calc(100vh-74.8px)] overflow-hidden flex justify-center items-center">
          <div className="w-[90%] max-w-[1000px] flex flex-col justify-center gap-4 p-5 py-10 max-[800px]:py-5 max-[800px]:pb-1 max-[800px]:px-3 rounded-xl border-3 border-neutral-100 shadow-xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-4xl font-bold max-[600px]:text-2xl max-[400px]:text-xl">
                Welcome Back!
              </h1>
              <p className="text-neutral-500 text-lg max-[600px]:text-sm max-[400px]:text-xs">
                Login to your account to continue!
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

              <div className="flex flex-col gap-1 relative w-[50%] max-[800px]:w-full">
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
                />
                <span
                  className="absolute hover:cursor-pointer top-[10px] text-2xl right-2 text-neutral-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
                {errors.password && (
                  <span className="text-neutral-800 font-semibold opacity-70">
                    Please enter your password
                  </span>
                )}
              </div>

              <button className="bg-blue-500 cursor-pointer text-white font-semibold py-2 rounded-lg text-lg w-[50%] max-[800px]:w-full">
                Login Securely
              </button>

              <div className="text-blue-400 font-medium">Forgot Password?</div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
