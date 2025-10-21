import { ILendItem } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import {
  getItemById,
  updateItem,
} from "../../../../services/operations/itemAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../../reducer/store";
import toast from "react-hot-toast";
import Loader from "../../../common/Loader";
import { useForm } from "react-hook-form";
import CustomInput from "../../../common/CustomInput";
import { FaBoxOpen, FaHashtag } from "react-icons/fa6";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import { LuRadius } from "react-icons/lu";
import dayjs, { Dayjs } from "dayjs";
import { getAllCategories } from "../../../../services/operations/categoryAPI";
import CustomDropdown from "../../../common/CustomDropdown";
import DatePickerComponent from "../../../common/DatePickerComponent";
import DropZone from "../../../common/DropZone";

const UpdateItem = () => {
  const [itemData, setItemData] = useState<ILendItem | null>(null);

  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.user);

  const { register, watch, reset, getValues } = useForm<ILendItem>({
    defaultValues: {},
  });

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

  const [tags, setTags] = useState<string[]>([]);

  const [images, setImages] = useState<string[]>([]);

  const [deleteImages, setDeleteImages] = useState<string[]>([]);

  const [addImages, setAddImages] = useState<File[]>([]);

  const navigate = useNavigate();

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

  useEffect(() => {
    const id = location.pathname.split("/").at(-1);

    if (!id || !user) {
      return;
    }

    const fetchData = async () => {
      try {
        const response = await getItemById(id);

        if (response.item.lenderId?._id !== user._id) {
          toast.error("You are not authorized to update this item");
          return;
        }

        setItemData(response.item);
        reset(response.item);

        setTags(response.item.tags);
        setImages(response.item.images);
        setOtherOptions({
          category: response.item.category._id.toString(),
          condition: response.item.condition,
          deliveryType: response.item.deliveryType || "",
        });
        setDate(dayjs(response.item.availableFrom));

        const res = await getAllCategories();

        const updatedCategories = res.map((category) => ({
          value: category._id,
          label: `${category.name}`,
        }));

        setCategories(updatedCategories);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitHandler = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", getValues("name"));
      formData.append("description", getValues("description"));
      formData.append("price", getValues("price").toString());
      formData.append("depositAmount", getValues("depositAmount").toString());
      formData.append("category", otherOptions.category);
      formData.append("tags", JSON.stringify(tags));
      formData.append(
        "isAvailable",
        getValues("isAvailable") ? "true" : "false"
      );
      formData.append("condition", otherOptions.condition);
      formData.append("availableFrom", date.toISOString());
      formData.append("deliveryType", otherOptions.deliveryType);
      formData.append(
        "deliveryCharges",
        (getValues("deliveryCharges") ?? 0).toString()
      );
      formData.append(
        "deliveryRadius",
        (getValues("deliveryRadius") ?? 0).toString()
      );

      if (deleteImages && deleteImages.length > 0) {
        formData.append("deleteImages", JSON.stringify(deleteImages));
      }

      if (addImages && Array.isArray(addImages)) {
        addImages.forEach((image) => {
          formData.append("images", image);
        });
      } else if (addImages) {
        formData.append("images", addImages);
      }

      const response = await updateItem(formData, itemData?._id.toString()!);

      if (response) {
        navigate(`/item/${itemData?._id}`);
      }
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      setDeleteImages([]);
      setAddImages([]);
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {!itemData ? (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)] w-full text-3xl font-semibold">
              <h1>Item not found</h1>
            </div>
          ) : (
            <div className="flex flex-col gap-10 min-h-[calc(100vh-8rem)] w-full mt-10">
              <div className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-6 shadow-lg">
                <h2 className="text-2xl font-semibold">Basic Information</h2>
                <p className="text-neutral-500">
                  Update the core details of your rental Item
                </p>

                <form action="" className="flex flex-col gap-3">
                  <CustomInput
                    label={true}
                    labelName="Item Name"
                    icon={FaBoxOpen}
                    name="name"
                    register={register}
                    fullWidth={true}
                    type="text"
                    id="name"
                    value={watch("name")}
                  />

                  <div>
                    <label
                      htmlFor={"description"}
                      className="text-sm font-medium capitalize"
                    >
                      Item Description
                    </label>
                    <div className={`flex relative flex-col gap-1`}>
                      <div className="absolute text-lg top-[13px] left-3 text-neutral-500">
                        <FaBoxOpen />
                      </div>
                      <textarea
                        {...register("description", { required: true })}
                        className="border border-neutral-300 min-h-[67.6px] h-auto overflow-y-hidden rounded-md px-3 py-[9px] text-[1rem] outline-blue-500 pl-9"
                        placeholder="Enter Item Description"
                        id="description"
                      ></textarea>
                    </div>
                  </div>

                  <div className="w-full flex gap-5 justify-between items-center max-[700px]:flex-col">
                    <CustomInput
                      type="number"
                      label={true}
                      labelName="Item Price"
                      icon={HiOutlineCurrencyRupee}
                      name="price"
                      register={register}
                      id="price"
                      value={watch("price")}
                    />

                    <CustomInput
                      type="number"
                      label={true}
                      labelName="Deposit Amount"
                      icon={HiOutlineCurrencyRupee}
                      name="depositAmount"
                      register={register}
                      id="depositAmount"
                      value={watch("depositAmount")}
                    />
                  </div>
                </form>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-6 shadow-lg">
                <h2 className="text-2xl font-semibold">Categorization</h2>
                <p className="text-neutral-500">Help renters find your item</p>

                <form action="" className="flex flex-col gap-3">
                  <CustomDropdown
                    data={categories}
                    fn={setOtherOptions}
                    label="Select Category"
                    name="category"
                    value={otherOptions.category}
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
                </form>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-6 shadow-lg">
                <h2 className="text-2xl font-semibold">
                  Availability & Condition
                </h2>
                <p className="text-neutral-500">
                  Set the current status of your item
                </p>

                <form action="" className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 w-[50%] max-[800px]:w-full">
                    <div className="container">
                      <input
                        type="checkbox"
                        className="checkbox"
                        id="isAvailable"
                        {...register("isAvailable")}
                        checked={watch("isAvailable")}
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

                  <CustomDropdown
                    data={conditions}
                    fn={setOtherOptions}
                    label="Select Condition"
                    name="condition"
                    value={otherOptions.condition}
                  />

                  <DatePickerComponent
                    date={date}
                    setDate={setDate}
                    label="Select Available From Date"
                  />
                </form>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-6 shadow-lg">
                <h2 className="text-2xl font-semibold">Delivery Options</h2>
                <p className="text-neutral-500">
                  Specify how renters can receive the item
                </p>

                <form action="" className="flex flex-col gap-3">
                  <CustomDropdown
                    data={deliveryTypes}
                    fn={setOtherOptions}
                    label="Select Delivery Type"
                    name="deliveryType"
                    value={otherOptions.deliveryType}
                  />

                  <CustomInput
                    icon={HiOutlineCurrencyRupee}
                    id="deliveryCharges"
                    name="deliveryCharges"
                    placeholder="Enter Delivery Charge"
                    register={register}
                    type="number"
                    required={false}
                    fullWidth={true}
                    label={true}
                    labelName="Delivery Charges"
                    value={watch("deliveryCharges")}
                  />

                  <CustomInput
                    icon={LuRadius}
                    id="deliveryRadius"
                    name="deliveryRadius"
                    placeholder="Enter Delivery Radius"
                    register={register}
                    type="number"
                    required={false}
                    fullWidth={true}
                    tooltip="In Kilometers"
                    label={true}
                    labelName="Delivery Radius"
                    value={watch("deliveryRadius")}
                  />
                </form>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-6 shadow-lg">
                <h2 className="text-2xl font-semibold">Item Images</h2>
                <p className="text-neutral-500">
                  Manage the photos of your rental item
                </p>

                <DropZone
                  setImages={setAddImages}
                  defaultPreviewImages={images}
                  setDeleteImages={setDeleteImages}
                />
              </div>

              <div className="flex items-center justify-end gap-5 mt-10">
                <button className="bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg cursor-pointer font-semibold">
                  Delete Item
                </button>
                <button
                  className={`text-white px-5 py-3 rounded-lg shadow-lg font-semibold  bg-blue-500 cursor-pointer`}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    submitHandler();
                  }}
                >
                  Update Item
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default UpdateItem;
