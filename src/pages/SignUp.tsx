import { SignUpInput } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import CustomInput from "../components/common/CustomInput";
import { MdEmail } from "react-icons/md";
import { IoMdHome, IoMdLock } from "react-icons/io";
import { RiUserFill } from "react-icons/ri";
import data from "../data/Country-State-City.json";
import CustomDropdown from "../components/common/CustomDropdown";
import { TbMapPinCode } from "react-icons/tb";
import { setOtpType, setSignUpData } from "../slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../services/operations/userAPI";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";

const countryData = data as Country[];

interface Country {
  value: string;
  label: string;
  children: State[];
}

interface State {
  value: string;
  label: string;
  children: City[];
}

interface City {
  value: string;
  label: string;
}

const SignUp = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
    setValue,
    getValues,
    watch,
  } = useForm<SignUpInput>();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state: RootState) => state.user);

  const [confirmPassword, setConfirmPassword] = useState("");
  const password = watch("password");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [stateData, setStateData] = useState([] as State[]);
  const [cityData, setCityData] = useState([] as City[]);

  const [addressData, setAddressData] = useState({
    country: "",
    state: "",
    city: "",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    passwordMatch: false,
  });

  const { country, state, city } = addressData;

  // Fetching states based on selected country
  useEffect(() => {
    if (country === "" || country === null || country === undefined) {
      setStateData([]);
      return;
    }
    const selectedCountry = countryData.find((c) => c.value === country);

    if (selectedCountry) {
      setStateData(selectedCountry.children);
    }
  }, [country]);

  // Fetching cities based on selected state
  useEffect(() => {
    if (state === "" || state === null || state === undefined) {
      setCityData([]);
      return;
    }
    const selectedState = stateData.find((s) => s.value === state);

    if (selectedState) {
      setCityData(selectedState.children);
    }
  }, [state]);

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

  const formatPhoneNumber = (value: string, countryCode: string) => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");

    return `+${countryCode} ${cleanValue.slice(countryCode.length)}`;
  };

  const submitForm: SubmitHandler<SignUpInput> = (data) => {
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

    data.city = addressData.city;
    data.state = addressData.state;
    data.country = addressData.country;
    data.otp = 0;
    data.role = "User";

    console.log("Data: ", data);

    dispatch(setSignUpData(data));
    dispatch(setOtpType("signup"));
    dispatch(sendOtp(data.email, navigate, "signup") as any);

    if (isSubmitSuccessful) {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "+91",
        password: "",
        addressLine1: "",
        addressLine2: "",
        pincode: "",
        isPrimary: false,
      });
      setConfirmPassword("");
      setAddressData({
        country: "",
        state: "",
        city: "",
      });
      dispatch(setSignUpData(null));
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-[calc(100vh-74.8px)] overflow-auto flex justify-center items-center my-12">
          <div className="w-[90%] max-w-[1000px] flex flex-col justify-center gap-4 p-5 py-10 max-[800px]:py-5 max-[800px]:pb-1 max-[800px]:px-3 rounded-xl border-3 border-neutral-100 shadow-xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-4xl font-bold max-[600px]:text-2xl max-[400px]:text-xl">
                Sign Up To Get Started
              </h1>
              <p className="text-neutral-500 text-lg max-[600px]:text-sm max-[400px]:text-xs">
                Borrow, Lend, Connect -{" "}
                <span className="font-semibold">Hassle-Free!</span>
              </p>
            </div>
            <form
              action=""
              className="flex flex-col gap-5 w-[85%] max-[800px]:w-full self-center my-4"
              onSubmit={handleSubmit(submitForm)}
            >
              <div className="flex max-[800px]:flex-col w-full justify-between gap-5">
                <CustomInput
                  icon={RiUserFill}
                  id="firstName"
                  name="firstName"
                  placeholder="Enter your FirstName"
                  register={register}
                  type="text"
                  errors={errors.firstName}
                />
                <CustomInput
                  icon={RiUserFill}
                  id="lastName"
                  name="lastName"
                  placeholder="Enter your LastName"
                  register={register}
                  type="text"
                  errors={errors.lastName}
                />
              </div>
              <div className="flex max-[800px]:flex-col w-full justify-between gap-5">
                <CustomInput
                  icon={MdEmail}
                  id="email"
                  name="email"
                  placeholder="Enter your Email"
                  register={register}
                  type="email"
                  errors={errors.email}
                />
                <div className="w-[50%] max-[800px]:w-full flex flex-col gap-1">
                  <PhoneInput
                    country={"in"}
                    onChange={(value, countryData: CountryData) => {
                      const formattedValue = formatPhoneNumber(
                        value,
                        countryData.dialCode
                      );
                      setValue("contactNumber", formattedValue, {
                        shouldValidate: true,
                      }); // Manually set value
                    }}
                    autoFormat={true}
                    enableAreaCodes={true}
                    enableSearch={true}
                    inputStyle={{
                      border: "1px solid #d4d4d8",
                      borderRadius: "6px",
                      padding: "21px 0px 21px 52px",
                      fontSize: "1rem",
                      outlineColor: "#3b82f6",
                      width: "100%",
                    }}
                    buttonStyle={{
                      borderRadius: "6px 0px 0px 6px",
                      paddingLeft: "4px",
                      backgroundColor: "white",
                    }}
                    inputProps={{
                      id: "contactNumber",
                      name: "contactNumber",
                      required: true,
                      autoComplete: "on",
                      ref: register("contactNumber", { required: true }).ref, // Assign ref manually
                    }}
                    value={getValues("contactNumber")}
                  />
                  {errors.contactNumber && (
                    <span className="text-neutral-800 font-semibold opacity-70">
                      Please enter your contact number
                    </span>
                  )}
                </div>
              </div>
              <div className="flex max-[800px]:flex-col w-full justify-between gap-5">
                <div className="w-[50%] max-[800px]:w-full flex flex-col gap-1 relative">
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
                <div className="w-[50%] max-[800px]:w-full flex flex-col gap-1 relative">
                  <div className="absolute text-xl top-[11px] left-3 text-neutral-500">
                    <IoMdLock />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm your Password"
                    className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9 pr-[39px]"
                    autoComplete="off"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    required
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
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
              </div>
              <div className="flex max-[800px]:flex-col w-full justify-between gap-5">
                <CustomInput
                  icon={IoMdHome}
                  id="addressLine1"
                  name="addressLine1"
                  placeholder="Enter your Address Line 1"
                  register={register}
                  type="text"
                  errors={errors.addressLine1}
                />
                <CustomInput
                  icon={IoMdHome}
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Enter your Address Line 2"
                  register={register}
                  type="text"
                  errors={errors.addressLine2}
                  required={false}
                />
              </div>
              <div className="flex max-[800px]:flex-col w-full justify-between gap-5">
                <CustomDropdown
                  data={countryData}
                  label="Country"
                  fn={setAddressData}
                  value={country}
                  name="country"
                  required={true}
                />

                <CustomDropdown
                  data={stateData}
                  label="State"
                  fn={setAddressData}
                  value={state}
                  name="state"
                  required={true}
                />

                <CustomDropdown
                  data={cityData}
                  label="City"
                  fn={setAddressData}
                  value={city}
                  name="city"
                  required={true}
                />
              </div>
              <div className="flex max-[800px]:flex-col w-full justify-between gap-5">
                <CustomInput
                  icon={TbMapPinCode}
                  id="pincode"
                  name="pincode"
                  placeholder="Enter your Pincode"
                  register={register}
                  type="number"
                  errors={errors.pincode}
                />
                <div className="flex items-center justify-end gap-3 w-[50%] max-[800px]:w-full">
                  <input
                    type="checkbox"
                    {...register("isPrimary")}
                    id="isPrimary"
                    className="h-6 w-6 max-[450px]:w-4 max-[450px]:h-4 cursor-pointer"
                    autoComplete="off"
                  />
                  <label htmlFor="isPrimary">
                    <span className="text-xl max-[450px]:text-base font-semibold text-neutral-700">
                      Set as Primary Address
                    </span>
                  </label>
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
              <button className="bg-blue-500 cursor-pointer text-white font-semibold py-2 rounded-lg text-lg">
                Sign Up
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
