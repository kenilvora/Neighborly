import { SubmitHandler, useForm } from "react-hook-form";
import CustomInput from "../../../common/CustomInput";
import { RiUserFill } from "react-icons/ri";
import { UpdateUserDetailsInput } from "@kenil_vora/neighborly";
import PhoneInput, { CountryData } from "react-phone-input-2";
import { IoMdHome } from "react-icons/io";
import CustomDropdown from "../../../common/CustomDropdown";
import data from "../../../../data/Country-State-City.json";
import { useEffect, useState } from "react";
import { TbMapPinCode } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../reducer/store";
import { updateProfile } from "../../../../services/operations/userAPI";
import { MdEmail } from "react-icons/md";

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

const UserInfo = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    getValues,
  } = useForm<UpdateUserDetailsInput>({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      contactNumber: user?.contactNumber,
      addressLine1: user?.address?.addressLine1,
      addressLine2: user?.address?.addressLine2,
      pincode: user?.address?.pincode,
      isPrimary: user?.address?.isPrimary,
    },
  });

  const [addressData, setAddressData] = useState({
    country: user?.address?.country || "",
    state: user?.address?.state || "",
    city: user?.address?.city || "",
  });

  const [stateData, setStateData] = useState([] as State[]);
  const [cityData, setCityData] = useState([] as City[]);

  const { country, state, city } = addressData;

  const dispatch = useDispatch();

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
  }, [state, stateData]);

  const formatPhoneNumber = (value: string, countryCode: string) => {
    if (!value) return "";

    const cleanValue = value.replace(/\D/g, "");

    return `+${countryCode} ${cleanValue.slice(countryCode.length)}`;
  };

  const onSubmit: SubmitHandler<UpdateUserDetailsInput> = (data) => {
    const updatedData = {
      ...data,
      country: addressData.country,
      state: addressData.state,
      city: addressData.city,
    } as UpdateUserDetailsInput;

    dispatch(updateProfile(updatedData) as any);
  };

  return (
    <div className="flex flex-col gap-3 px-7 py-5 rounded-lg shadow-md border border-neutral-300">
      <div className="text-2xl font-semibold">User Information</div>

      <form
        action=""
        className="flex flex-col gap-5 w-full self-center my-4"
        onSubmit={handleSubmit(onSubmit)}
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
          <div className="w-[50%] max-[800px]:w-full flex relative flex-col gap-1">
            <div className="absolute text-lg top-[13px] left-3 text-neutral-500">
              <MdEmail />
            </div>
            <input
              value={user?.email}
              disabled
              className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9 hover:cursor-not-allowed font-semibold text-neutral-500"
            />
          </div>
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
              dropdownStyle={{}}
            />
            {errors.contactNumber && (
              <span className="text-neutral-800 font-semibold opacity-70">
                Please enter your contact number
              </span>
            )}
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
          <div className="flex items-center gap-3 w-[50%] max-[800px]:w-full">
            <div className="container">
              <input
                type="checkbox"
                className="checkbox"
                id="isPrimary"
                {...register("isPrimary")}
              />
              <label className="switch" htmlFor="isPrimary">
                <span className="isAvailable"></span>
              </label>
            </div>
            <label htmlFor="isPrimary">
              <span className="text-xl max-[450px]:text-base font-semibold">
                Primary Address
              </span>
            </label>
          </div>
        </div>
        <button
          className={`font-semibold py-2 rounded-lg text-lg w-fit px-4 text-white
                      ${
                        !isDirty
                          ? "cursor-not-allowed bg-blue-300"
                          : "bg-blue-500 cursor-pointer"
                      }
          `}
          disabled={!isDirty}
          type="submit"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UserInfo;
