import { IBorrowedItemData } from "@kenil_vora/neighborly";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { LuCreditCard, LuTruck } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { useState } from "react";
import { DateFormatter } from "../../../../utils/DateFormatter";
import { FaRegCalendarAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  itemEndpoints,
  ratingAndReviewEndpoints,
} from "../../../../services/apis";
import { apiConnector } from "../../../../services/apiConnector";
import { useForm } from "react-hook-form";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import { RootState } from "../../../../reducer/store";
import { useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import CustomDropdown from "../../../common/CustomDropdown";

const BorrowItemCard = ({
  data,
  setLoading,
  fetchBorrowedItems,
}: {
  data: IBorrowedItemData;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBorrowedItems: () => Promise<void>;
}) => {
  const [showMore, setShowMore] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rating, setRating] = useState(0);

  const { user } = useSelector((state: RootState) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const types = [
    {
      label: "Item",
      value: "Item",
    },
    {
      label: "User",
      value: "User",
    },
  ];

  const [reviewType, setReviewType] = useState<{
    type: "Item" | "User";
  }>({ type: "" as any });

  const totalDays =
    Math.ceil(
      Math.abs(
        new Date(data.endDate).getTime() - new Date(data.startDate).getTime()
      ) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const handleItemDelivered = async () => {
    try {
      setLoading(true);

      const res = await apiConnector(
        "PUT",
        `${itemEndpoints.ITEM_DELIVERED}/${data.item._id}`
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Item Marked as Delivered");
      fetchBorrowedItems();
    } catch (error) {
      toast.error("Error in marking item as delivered");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (d: any) => {
    try {
      setLoading(true);

      if (!rating) {
        toast.error("Please select a rating");
        return;
      }

      if (rating < 0 || rating > 5) {
        toast.error("Please select a valid rating");
        return;
      }

      if (!reviewType.type) {
        toast.error("Please select a review type");
        return;
      }

      const res = await apiConnector(
        "POST",
        ratingAndReviewEndpoints.CREATE_RATING_AND_REVIEW,
        {
          rating: rating,
          review: d.review,
          toWhom: reviewType.type === "Item" ? data.item._id : data.lender._id,
          type: reviewType.type,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Review Added Successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error in adding review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-neutral-100 shadow-md rounded-xl px-6 py-4 border-2 border-neutral-300 flex flex-col gap-2 h-fit">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-xl font-semibold line-clamp-1">
            {data.item.name}
          </h1>
          {data.isReturned ? (
            <div className="text-xs text-center text-white bg-neutral-900 px-3 py-1 rounded-full font-medium">
              Returned
            </div>
          ) : data.paymentStatus === "Pending" ? (
            <div className="text-xs text-center text-white bg-red-500 font-medium px-3 py-1 rounded-full animate-pulse min-w-fit">
              Payment Pending
            </div>
          ) : (
            <div className="text-xs text-center text-white bg-neutral-900 px-3 py-1 rounded-full font-medium min-w-fit">
              Currently Borrowed
            </div>
          )}
        </div>
        <div className="my-2">
          <Swiper
            loop={true}
            spaceBetween={5}
            modules={[Navigation, Pagination]}
            pagination={{ clickable: true }}
            className="mySwiper w-full"
            breakpoints={{
              // when window width is >= 320px
              320: {
                slidesPerView: 1,
              },
            }}
          >
            {data.item.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="overflow-hidden h-64 p-3 w-full bg-gray-200 rounded-lg">
                  <img
                    src={image}
                    alt="item"
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="text-neutral-600 line-clamp-2">
          {data.item.description}
        </div>
        <div className="flex justify-between items-center gap-4 max-[450px]:flex-col max-[450px]:items-start max-[450px]:gap-2">
          <div className="font-semibold text-lg">
            ₹{data.item.price}.00 / Day
          </div>
          <div className="text-neutral-600">
            Deposit : ₹{data.item.depositAmount}.00
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaRegCalendarAlt className="text-lg" />
          {DateFormatter(new Date(data.startDate))} -{" "}
          {DateFormatter(new Date(data.endDate))} = {totalDays} Days
        </div>
        <div className="flex items-center gap-2">
          <LuTruck className="text-lg" />
          {data.deliveryType}
        </div>
        <div className="flex items-center gap-2">
          <LuCreditCard className="text-lg" />
          {data.paymentMode}
        </div>
        <div className="flex items-center gap-2">
          <GrLocation className="text-lg" />
          {data.item.itemLocation.city}, {data.item.itemLocation.state},{" "}
          {data.item.itemLocation.country}
        </div>
        <div className="text-xl font-bold">Lender</div>
        <div className="flex items-center gap-3">
          <img
            src={data.lender.profileImage}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col justify-center">
            <div className="font-semibold">
              {data.lender.firstName} {data.lender.lastName}
            </div>
            <div className="text-neutral-600">{data.lender.email}</div>
          </div>
        </div>
        {data.deliveryType === "Delivery" &&
          data.deliveryStatus === "Pending" && (
            <button
              className="bg-blue-600 text-white rounded-lg py-3 font-semibold cursor-pointer my-2 text-lg"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleItemDelivered();
              }}
            >
              Item Delivered from {data.lender.firstName} {data.lender.lastName}
            </button>
          )}

        <button
          className="bg-neutral-700 text-white rounded-lg py-2 font-semibold cursor-pointer my-2 text-lg"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
        >
          Add Review
        </button>

        <button
          onClick={() => setShowMore(!showMore)}
          className="border-2 border-neutral-300 rounded-lg cursor-pointer py-2 text-neutral-600 font-semibold"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
        <div
          className={`overflow-hidden ${
            showMore
              ? "max-h-[500px] transition-[max-height] duration-600 ease-in"
              : "max-h-0"
          }`}
        >
          <div>
            <span className="font-bold text-sm">Lender Contact : </span>
            <span className="text-sm text-neutral-700 font-medium">
              {data.lender.contactNumber}
            </span>
          </div>
          <div className="">
            <span className="font-bold text-sm">Return Status : </span>
            <span className="text-sm text-neutral-700 font-medium">
              {data.isReturned ? "Returned On Time" : "Not Returned"}
            </span>
          </div>
          <div>
            <span className="font-bold text-sm">Payment Status : </span>
            <span className="text-sm text-neutral-700 font-medium">
              {data.paymentStatus === "Pending" ? "Pending" : "Paid"}
            </span>
          </div>
          <div>
            <span className="font-bold text-sm">Delivery Charges : </span>
            <span className="text-sm text-neutral-700 font-medium">
              ₹{data.deliveryCharges || 0}
            </span>
          </div>
          <div>
            <span className="font-bold text-sm">Delivery Status : </span>
            <span className="text-sm text-neutral-700 font-medium">
              {data.deliveryStatus || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 p-5
        flex items-center justify-center z-[1000000]"
        >
          <div
            className="bg-neutral-100 border border-neutral-200 rounded-lg flex 
          flex-col flex-wrap justify-center w-[500px]"
          >
            <div
              className="flex text-richblue-5 font-bold text-xl items-center w-full justify-between 
                  px-5 py-4"
            >
              <div>Add Review</div>
              <RxCross2
                onClick={() => setIsModalOpen(false)}
                className="hover:cursor-pointer text-2xl"
              ></RxCross2>
            </div>

            <div className="bg-richblack-800 rounded-b-lg flex flex-col w-full py-6 px-5 justify-center gap-5">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={user?.profileImage}
                  alt="userImage"
                  className="w-14 aspect-square rounded-full object-cover"
                />
                <div className="flex flex-col justify-center text-richblack-5">
                  <div className="font-bold text-lg">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm">Posting Publicaly</div>
                </div>
              </div>

              <form
                action="submit"
                className="flex flex-col gap-1 justify-center"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex items-center justify-center">
                  <Stack spacing={1}>
                    <Rating
                      name="half-rating"
                      value={rating}
                      onChange={(_event, newValue) => {
                        setRating(newValue || 0);
                      }}
                      precision={0.5}
                      size="large"
                    />
                  </Stack>
                </div>

                <div className="my-4">
                  <CustomDropdown
                    data={types}
                    fn={setReviewType}
                    label="Select Review Type"
                    name="type"
                    value={reviewType.type}
                  />
                </div>

                <label>
                  <p className=" text-richblack-5 text-sm flex gap-[0.1rem]">
                    Add Your Review
                    <sup className="text-pink-200 text-base top-[-0.1rem]">
                      *
                    </sup>
                  </p>
                  <textarea
                    placeholder="Add Your Review"
                    autoComplete="on"
                    {...register("review", { required: true })}
                    className="bg-neutral-200 text-base p-[0.6rem] resize-none rounded-lg min-h-28 w-full text-black"
                  />
                  {errors.review && (
                    <span className="text-red-700 opacity-80 text-sm font-bold">
                      Please Add Your Review
                    </span>
                  )}
                </label>

                <div className="flex justify-end gap-3 items-center mt-3">
                  <button
                    type="button"
                    className="bg-blue-300 py-1.5 px-4 rounded-md bg-opacity-65 text-black font-bold"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-yellow-500 py-1.5 px-4 shadow-yellow1 rounded-md text-black font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BorrowItemCard;
