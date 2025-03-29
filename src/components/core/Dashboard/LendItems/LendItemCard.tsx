import { ILendItem } from "@kenil_vora/neighborly";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { TiStarFullOutline } from "react-icons/ti";
import { LuTruck } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { NavLink, useNavigate } from "react-router-dom";
import { apiConnector } from "../../../../services/apiConnector";
import { itemEndpoints } from "../../../../services/apis";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../../../reducer/store";

const LendItemCard = ({
  item,
  avgRating,
  paymentMode,
  paymentStatus,
  setLoading,
  getItems,
  deliveryType,
  deliveryStatus,
}: {
  item: ILendItem;
  avgRating: number;
  paymentMode: "Cash" | "Online" | "Wallet";
  paymentStatus: "Pending" | "Paid";
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  getItems: () => Promise<void>;
  deliveryType: "Pickup" | "Delivery";
  deliveryStatus: "Pending" | "Delivered" | "Rejected";
}) => {
  const { user } = useSelector((state: RootState) => state.user);

  const navigate = useNavigate();

  const handlePaymentReceived = async () => {
    try {
      setLoading(true);

      const res = await apiConnector(
        "PUT",
        `${itemEndpoints.PAYMENT_RECEIVED}/${item._id}`
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Payment Marked as Received");
      getItems();
    } catch (error) {
      toast.error("Error in marking payment as received");
    } finally {
      setLoading(false);
    }
  };

  const handleItemReceivedBack = async () => {
    try {
      setLoading(true);

      if ((user?.accountBalance ?? 0) < item.depositAmount) {
        toast.error("Insufficient balance to refund deposit amount");
        toast.error("Please add money to your wallet first");
        navigate("/dashboard/wallet");
        setLoading(false);
        return;
      }

      const res = await apiConnector(
        "PUT",
        `${itemEndpoints.RETURN_ITEM}/${item._id}`
      );

      if (!res.data.success) {
        throw new Error(res.data.message);
      }

      toast.success("Item Marked as Received Back");
      toast.success(
        `Deposit Amount of ₹${item.depositAmount} Refunded from Wallet to ${item.currentBorrowerId?.firstName} ${item.currentBorrowerId?.lastName}`
      );
      getItems();
    } catch (error) {
      toast.error("Error in marking item as received back");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg flex flex-col rounded-xl overflow-hidden h-fit">
      <div className="relative">
        <Swiper
          loop={true}
          spaceBetween={5}
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          className="mySwiper w-full"
          breakpoints={{
            320: {
              slidesPerView: 1,
            },
          }}
        >
          {item.images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="overflow-hidden h-64 p-3 w-full bg-gray-200">
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

        <div className="absolute top-2 right-2 z-10 bg-neutral-300 px-4 animate-pulse py-0.5 rounded-full">
          <span className="text-sm font-semibold">{item.condition}</span>
        </div>
      </div>
      <div className="py-5 flex flex-col gap-2 divide-y divide-neutral-500">
        <div className="flex flex-col gap-2 px-5">
          <div className="text-xl font-semibold text-neutral-800 line-clamp-1">
            {item.name}
          </div>
          <div className="text-neutral-600 line-clamp-2 leading-6">
            {item.description}.
          </div>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-neutral-200 px-3 py-0.5 rounded-full text-sm font-medium capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center text-lg font-semibold text-blue-600">
              ₹{item.price} / Day
            </div>

            <div className="flex items-center text-lg font-semibold text-neutral-600">
              Deposit : ₹{item.depositAmount}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <TiStarFullOutline size={24} className="text-yellow-500" />
              <span className="text-neutral-800 font-semibold">
                {avgRating}
              </span>
            </div>
            <div>({item.ratingAndReviews.length} Reviews)</div>
          </div>
          <div
            className={`font-semibold ${
              item.isAvailable ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.isAvailable ? "Available" : "Not Available"}
          </div>
          <div className="flex items-center gap-2">
            <LuTruck className="text-lg" />
            {item.deliveryType}
          </div>
          <div className="flex items-center gap-2">
            <GrLocation className="text-lg" />
            {item.itemLocation?.city}, {item.itemLocation?.state},{" "}
            {item.itemLocation?.country}
          </div>
          <div>
            Delivery Charges: ₹{item.deliveryCharges} ({item.deliveryRadius} km)
          </div>
        </div>

        {item.borrowers && item.borrowers.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 px-5 border-t-2 border-b-2 border-neutral-500">
            <div className="text-lg font-medium">Borrowers</div>
            <div
              className={`flex gap-3 items-center overflow-x-auto
                  ${item.borrowers.length > 6 ? "pb-4" : "pb-2"}
              `}
            >
              {item.borrowers.map((borrower, i) => {
                return (
                  <img
                    src={borrower.profileImage}
                    key={i}
                    alt="profileImage"
                    className="w-9 h-9 rounded-full cursor-pointer"
                    title={`${borrower.firstName} ${borrower.lastName}\n${borrower.email}\n${borrower.contactNumber}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {item.currentBorrowerId && (
          <div className="flex flex-col gap-2 px-5 pt-2">
            <div className="flex items-center gap-3 justify-between">
              <div className="text-lg font-semibold">Current Borrower</div>

              {deliveryType === "Delivery" && (
                <div
                  className={`text-white text-sm px-3 font-semibold py-1 rounded-full animate-pulse
                  ${
                    deliveryStatus === "Pending"
                      ? "bg-red-500"
                      : deliveryStatus === "Delivered"
                      ? "bg-green-600"
                      : "bg-yellow-600"
                  }
                `}
                >
                  {
                    {
                      Pending: "Delivery Pending",
                      Delivered: "Item Delivered",
                      Rejected: "Delivery Rejected",
                    }[deliveryStatus]
                  }
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <img
                src={item.currentBorrowerId.profileImage}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col justify-center">
                <div className="font-semibold">
                  {item.currentBorrowerId.firstName}{" "}
                  {item.currentBorrowerId.lastName}
                </div>
                <div className="text-neutral-600">
                  {item.currentBorrowerId.email}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 pb-6">
        <div className="px-5 flex">
          <NavLink
            to={`/dashboard/myItems/update/${item._id}`}
            className="bg-blue-600 text-white w-full text-center py-2 font-semibold rounded-lg"
          >
            Update Item
          </NavLink>
        </div>
        {item.currentBorrowerId && (
          <>
            {paymentMode === "Cash" && paymentStatus === "Pending" && (
              <div className="px-5 flex">
                <button
                  className="bg-blue-600 text-white w-full text-center py-2 font-semibold rounded-lg"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handlePaymentReceived();
                  }}
                >
                  Payment Received
                </button>
              </div>
            )}
            <div className="px-5 flex">
              <button
                className="bg-blue-600 text-white w-full text-center py-2 font-semibold rounded-lg"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleItemReceivedBack();
                }}
              >
                Item Received Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LendItemCard;
