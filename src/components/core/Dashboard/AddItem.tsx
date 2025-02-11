import { AddItemInput } from "@kenil_vora/neighborly";
import { SubmitHandler, useForm } from "react-hook-form";
import CustomInput from "../../common/CustomInput";
import { FaBoxOpen, FaHashtag } from "react-icons/fa6";
import DatePickerComponent from "../../common/DatePickerComponent";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { getAllCategories } from "../../../services/operations/categoryAPI";
import toast from "react-hot-toast";
import Loader from "../../common/Loader";
import CustomDropdown from "../../common/CustomDropdown";
import { RxCross2 } from "react-icons/rx";
import { LuRadius } from "react-icons/lu";
import DropZone from "../../common/DropZone";
import { setIsLoading } from "../../../slices/itemSlice";

const AddItem = () => {
  const {
    register,
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
  } = useForm<AddItemInput>();

  const [date, setDate] = useState<Dayjs>(dayjs());

  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);

  const [otherOptions, setOtherOptions] = useState({
    category: "",
    condition: "",
    deliveryType: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await getAllCategories();

        const updatedCategories = res.map((category) => ({
          value: category.name,
          label: `${category.name}`,
        }));

        setCategories(updatedCategories);
      } catch (error) {
        toast.error("An error occurred while fetching categories");
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  const [tags, setTags] = useState<string[]>([]);

  const [images, setImages] = useState<File[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();

      const tag = (e?.target as HTMLInputElement).value.trim();
      if (tag && !tags.includes(tag.toLowerCase())) {
        setTags((prev) => [...prev, tag.toLowerCase()]);
      } else if (tag && tags.includes(tag.toLowerCase())) {
        toast.error("Tag already exists");
      }
      (e.target as HTMLInputElement).value = "";
    }
  };

  const removeTag = (
    e: React.MouseEvent<SVGElement, MouseEvent>,
    index: number
  ) => {
    e.preventDefault();
    const tagsCopy = [...tags];
    tagsCopy.splice(index, 1);
    setTags(tagsCopy);
  };

  const conditions = [
    {
      value: "New",
      label: "New",
    },
    {
      value: "Like New",
      label: "Like New",
    },
    {
      value: "Good",
      label: "Good",
    },
    {
      value: "Average",
      label: "Average",
    },
    {
      value: "Poor",
      label: "Poor",
    },
  ];

  const deliveryTypes = [
    {
      value: "Pickup",
      label: "Pickup",
    },
    {
      value: "Delivery",
      label: "Delivery",
    },
    {
      value: "Both (Pickup & Delivery)",
      label: "Both (Pickup & Delivery)",
    },
  ];

  const submitHandler: SubmitHandler<AddItemInput> = async (data) => {
    try {
      const formData = {
        ...data,
        tags,
        images,
        availableFrom: date.toISOString(),
        ...otherOptions,
      };

      console.log("Form Data : ", formData);
    } catch (error) {
      toast.error("An error occurred while adding item");
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="mt-5 mb-10 flex flex-col px-6 py-5 gap-5 rounded-lg border-2 border-neutral-300">
          <div className="text-2xl font-semibold">Item Details</div>

          <form
            action=""
            className="flex flex-col gap-4 w-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <CustomInput
              icon={FaBoxOpen}
              id="name"
              name="name"
              placeholder="Enter Item Name"
              register={register}
              type="text"
              errors={errors.name}
              fullWidth={true}
            />

            <div className={`flex relative flex-col gap-1`}>
              <div className="absolute text-lg top-[13px] left-3 text-neutral-500">
                <FaBoxOpen />
              </div>
              <textarea
                {...register("description", { required: true })}
                className="border border-neutral-300 min-h-[67.6px] h-auto overflow-y-hidden rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9"
                placeholder="Enter Item Description"
              ></textarea>
              {errors.description && (
                <span className="text-neutral-800 text-sm font-medium opacity-70">
                  Please enter item description
                </span>
              )}
            </div>

            <div className="flex gap-4 justify-between items-center w-full">
              <CustomInput
                icon={HiOutlineCurrencyRupee}
                id="price"
                name="price"
                placeholder="Enter Item Price Per Day"
                register={register}
                type="number"
                errors={errors.price}
                tooltip="Price per Day in INR"
              />

              <CustomInput
                icon={HiOutlineCurrencyRupee}
                id="depositAmount"
                name="depositAmount"
                placeholder="Enter Deposit Amount"
                register={register}
                type="number"
                errors={errors.depositAmount}
                tooltip="Fully Refundable On Return"
              />
            </div>

            <CustomDropdown
              data={categories}
              fn={setOtherOptions}
              label="Select Category"
              name="category"
              value={otherOptions.category}
            />

            <CustomDropdown
              data={conditions}
              fn={setOtherOptions}
              label="Select Condition"
              name="condition"
              value={otherOptions.condition}
            />

            <CustomDropdown
              data={deliveryTypes}
              fn={setOtherOptions}
              label="Select Delivery Type"
              name="deliveryType"
              value={otherOptions.deliveryType}
            />

            <div className={`flex relative flex-col gap-1`}>
              <div className="absolute text-lg top-[13px] left-3 text-neutral-500">
                <FaHashtag />
              </div>
              <input
                type="text"
                id="tags"
                className="border border-neutral-300 rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9"
                placeholder="Enter Item Tags"
                onKeyDown={handleKeyDown}
              />
              {tags && tags.length > 0 && (
                <div className="flex items-center mt-2 gap-2 flex-wrap">
                  {tags.map((tag, i: number) => (
                    <div
                      className="flex items-center justify-center gap-1 rounded-full bg-sky-200 w-fit px-3 text-sm text-blue-700 py-0.5"
                      key={i}
                    >
                      {tag}
                      <RxCross2
                        className="hover:cursor-pointer"
                        onClick={(e) => removeTag(e, i)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-[50%] max-[800px]:w-full">
              <div className="container">
                <input
                  type="checkbox"
                  className="checkbox"
                  id="isAvailable"
                  {...register("isAvailable")}
                />
                <label className="switch" htmlFor="isAvailable">
                  <span className="isAvailable"></span>
                </label>
              </div>
              <label htmlFor="isAvailable">
                <span className="text-lg max-[450px]:text-base font-semibold">
                  Available for Rent
                </span>
              </label>
            </div>

            <DatePickerComponent
              date={date}
              setDate={setDate}
              label="Select Available From Date"
            />

            <CustomInput
              icon={HiOutlineCurrencyRupee}
              id="deliveryCharges"
              name="deliveryCharges"
              placeholder="Enter Delivery Charge"
              register={register}
              type="number"
              errors={errors.deliveryCharges}
              required={false}
              fullWidth={true}
              tooltip="Deliverycharge per Kilometer in INR"
            />

            <CustomInput
              icon={LuRadius}
              id="deliveryRadius"
              name="deliveryRadius"
              placeholder="Enter Delivery Radius"
              register={register}
              type="number"
              errors={errors.deliveryRadius}
              required={false}
              fullWidth={true}
              tooltip="In Kilometers"
            />

            <DropZone setImages={setImages} />

            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 hover:cursor-pointer max-[370px]:px-2 w-fit">
              Add Item
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddItem;
