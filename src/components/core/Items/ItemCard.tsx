import { useState } from "react";
import { IoMdStarOutline } from "react-icons/io";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { NavLink } from "react-router-dom";

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  depositAmount: number;
  images: string[];
  condition: "New" | "Like New" | "Good" | "Average" | "Poor";
  deliveryCharges: number;
  avgRating: number;
  totalRating: number;
}

const ItemCard = (item: Item) => {
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
  const [index, setIndex] = useState(0);

  const handleNextImage = () => {
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col w-full max-w-[350px] h-auto min-h-[541.6px] flex-wrap items-start rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 border border-neutral-200 overflow-hidden bg-white">
      <div className="w-full h-60 relative">
        <img
          src={images[index]}
          alt={name}
          className="w-full h-60 object-cover object-center"
          loading="eager"
        />
        <div
          className="absolute top-2 right-2 bg-sky-200 text-blue-700 
                        bg-opacity-80 py-0.5 px-3 rounded-full hover:bg-sky-300 transition-all duration-200 font-semibold flex items-center"
        >
          {condition}
        </div>
        <div
          className="absolute top-1/2 left-2 -translate-y-1/2 text-neutral-400 bg-white rounded-full hover:cursor-pointer border border-neutral-300"
          onClick={handlePrevImage}
        >
          <MdOutlineKeyboardArrowLeft className="text-3xl font-bold" />
        </div>
        <div
          className="absolute top-1/2 right-2 -translate-y-1/2 text-neutral-400 bg-white rounded-full hover:cursor-pointer border border-neutral-300"
          onClick={handleNextImage}
        >
          <MdOutlineKeyboardArrowRight className="text-3xl font-bold" />
        </div>
        <div className="absolute bottom-2 flex gap-3 left-1/2 -translate-x-1/2">
          {images.map((_image, i) => (
            <span
              className={`rounded-full p-[5px]
                    ${i === index ? "bg-white" : "bg-neutral-300"}
                        `}
              key={i}
            ></span>
          ))}
        </div>
      </div>
      <div className="p-6 flex flex-col gap-2 h-[300px]">
        <div className="text-2xl font-bold text-neutral-800 leading-7 line-clamp-2">
          {name}
        </div>
        <div className="text-neutral-600 leading-5 text-[1rem] line-clamp-2">
          {description}
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-blue-600">
            Price: <span className="text-neutral-800">₹{price}</span>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Deposit Amount:{" "}
            <span className="text-neutral-800">₹{depositAmount}</span>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Delivery Charges:{" "}
            <span className="text-neutral-800">₹{deliveryCharges}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto w-full">
          <div className="flex items-center gap-2">
            <IoMdStarOutline className="text-2xl text-yellow-500" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-800">
                {avgRating}
              </span>
              <span className="text-neutral-500">({totalRating} reviews)</span>
            </div>
          </div>
          <NavLink
            to={`/item/${_id}`}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 hover:cursor-pointer"
          >
            View Details
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
