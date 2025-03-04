import { NavLink } from "react-router-dom";
import { IAllItem } from "@kenil_vora/neighborly";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { TiStarFullOutline } from "react-icons/ti";

const ItemCard = (item: IAllItem) => {
  const {
    _id,
    name,
    description,
    price,
    depositAmount,
    images,
    condition,
    deliveryCharges,
    avgRating,
    totalRating,
  } = item;

  return (
    <div className="flex flex-col w-full h-[550px] max-h-[570px] flex-wrap items-start justify-between rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 ease-linear border border-neutral-200 overflow-hidden bg-white whitespace-normal">
      <div className="w-full h-60 relative">
        <Swiper
          loop={true}
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
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="overflow-hidden h-64 p-3 w-full bg-gray-200">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div
          className="absolute top-2 right-2 bg-sky-200 text-blue-700  z-10
                        bg-opacity-80 py-0.5 px-3 rounded-full hover:bg-sky-300 transition-all duration-200 font-semibold flex items-center"
        >
          {condition}
        </div>
      </div>
      <div className="p-6 flex flex-col gap-2 h-[300px] w-full">
        <div className="text-2xl font-bold text-neutral-800 leading-7 line-clamp-2 max-[370px]:text-xl">
          {name}
        </div>
        <div className="text-neutral-600 leading-5 text-[1rem] line-clamp-2 max-[370px]:text-sm">
          {description}
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-blue-600 max-[370px]:text-[1rem]">
            Price: <span className="text-neutral-800">₹{price} / Day</span>
          </div>
          <div className="text-lg font-semibold text-blue-600 max-[370px]:text-[1rem]">
            Deposit Amount:{" "}
            <span className="text-neutral-800">₹{depositAmount}</span>
          </div>
          <div className="text-lg font-semibold text-blue-600 max-[370px]:text-[1rem]">
            Delivery Charges:{" "}
            <span className="text-neutral-800">₹{deliveryCharges}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto w-full">
          <div className="flex items-center gap-2 max-[370px]:gap-0">
            <div className="flex items-center max-[370px]:gap-1">
              <span className="font-semibold text-neutral-800">
                {avgRating}
              </span>
              <TiStarFullOutline size={24} className="text-yellow-500" />
            </div>
            <span className="text-neutral-500">({totalRating} reviews)</span>
          </div>
          <NavLink
            to={`/item/${_id}`}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 hover:cursor-pointer max-[370px]:px-2"
          >
            View Details
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
