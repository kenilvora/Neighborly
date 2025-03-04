import { IBorrowedItemData } from "@kenil_vora/neighborly";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { LuCreditCard, LuTruck } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { useState } from "react";
import { DateFormatter } from "../../../../utils/DateFormatter";
import { FaRegCalendarAlt } from "react-icons/fa";

const BorrowItemCard = ({ data }: { data: IBorrowedItemData }) => {
  const [showMore, setShowMore] = useState(false);

  const totalDays =
    Math.ceil(
      Math.abs(
        new Date(data.endDate).getTime() - new Date(data.startDate).getTime()
      ) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <div className="bg-neutral-100 shadow-md rounded-xl px-6 py-4 border-2 border-neutral-300 flex flex-col gap-2 h-fit">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-xl font-semibold line-clamp-1">{data.item.name}</h1>
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
      <div className="flex justify-between items-center gap-4">
        <div className="font-semibold text-lg">₹{data.item.price}.00 / Day</div>
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
  );
};

export default BorrowItemCard;
