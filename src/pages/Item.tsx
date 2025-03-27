import { IItemWithAvgRating } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getItemById } from "../services/operations/itemAPI";
import Loader from "../components/common/Loader";
import { GrLocation } from "react-icons/gr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import RatingReviewCard from "../components/common/RatingReviewCard";
import { LuTruck, LuUser } from "react-icons/lu";
import toast from "react-hot-toast";
import { RootState } from "../reducer/store";
import { useSelector } from "react-redux";
import { DateFormatter } from "../utils/DateFormatter";

const Item = () => {
  const [item, setItem] = useState<IItemWithAvgRating>(
    {} as IItemWithAvgRating
  );

  const { user } = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const getItem = async () => {
      const id = location.pathname.split("/").at(-1);

      if (!id) {
        return;
      }

      try {
        const response = await getItemById(id);

        setItem(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getItem();
  }, [location.pathname]);

  const [currImage, setCurrImage] = useState(0);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-[89%] max-w-[1480px] mx-auto mt-10 h-auto">
          <div className="flex gap-16 max-[1130px]:flex-col max-[1300px]:gap-10">
            <div className="flex flex-col justify-center w-[35%] min-w-[540px] max-[1130px]:w-full max-[600px]:min-w-[90%]">
              <div className="w-full aspect-square max-h-[500px] min-h-[300px] rounded-xl overflow-hidden bg-gray-200 p-3 shadow-lg">
                <img
                  src={item.item.images[currImage]}
                  alt={item.item.name}
                  loading="lazy"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div
                className={`mt-5 flex gap-5 items-center overflow-x-auto pb-5`}
              >
                {item.item.images.map((image, index) => (
                  <div
                    key={index}
                    className={`overflow-hidden flex items-center justify-center aspect-square min-w-[120px] max-[600px]:min-w-[100px] max-w-[120px] rounded-md p-2 bg-gray-200 cursor-pointer
                            ${
                              currImage === index
                                ? "border-2 border-blue-600"
                                : "border border-gray-300"
                            }
                            hover:shadow-md
                `}
                  >
                    <img
                      src={image}
                      alt={item.item.name}
                      loading="lazy"
                      className="w-full h-full object-contain"
                      onClick={() => setCurrImage(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col w-[64%] max-[1130px]:w-full">
              <h1 className="text-4xl font-semibold">{item.item.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {item.item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-neutral-800 text-white rounded-full font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-lg text-gray-500 mt-4">
                {item.item.description}
              </p>
              <div
                className={`px-4 py-0.5 rounded-full font-semibold w-fit mt-5
                    ${
                      item.item.condition === "New" ||
                      item.item.condition === "Like New" ||
                      item.item.condition === "Good"
                        ? "bg-[#dcfce7] text-[#15a349]"
                        : "bg-red-500 text-white"
                    }
                
                `}
              >
                {item.item.condition}
              </div>
              <div className="flex items-center mt-4 justify-between max-[1300px]:flex-col max-[1300px]:items-start max-[1300px]:gap-2">
                <div className="text-xl font-semibold">
                  ₹{item.item.price} / Day
                </div>

                <div className="text-xl font-semibold">
                  Deposit Amount ( Fully Refundable ) : ₹
                  {item.item.depositAmount}
                </div>
              </div>
              <div className="flex flex-col gap-2 justify-center mt-4">
                <div className="text-lg font-semibold">
                  Supported Delivery Type :
                </div>
                {item.item.deliveryType === "Both (Pickup & Delivery)" ? (
                  <div className="flex items-center w-full gap-4">
                    <div
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                              hover:bg-neutral-300 hover:text-neutral-600 font-medium text-blue-600 bg-sky-200
                    `}
                    >
                      <LuUser />
                      <span>Pickup</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                              hover:bg-neutral-300 hover:text-neutral-600 font-medium text-blue-600 bg-sky-200
                    `}
                    >
                      <LuTruck />
                      <div className="flex items-center gap-2 max-[370px]:flex-col max-[370px]:gap-0 max-[370px]:items-start">
                        <span>Delivery</span>
                        <span>(+ ₹{item.item.deliveryCharges})</span>
                      </div>
                    </div>
                  </div>
                ) : item.item.deliveryType === "Pickup" ? (
                  <div
                    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-300 hover:text-neutral-600 font-medium text-blue-600 bg-sky-200
                      `}
                  >
                    <LuUser />
                    <span>Pickup</span>
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-300 hover:text-neutral-600 font-medium text-blue-600 bg-sky-200
                      `}
                  >
                    <LuTruck />
                    <span>Delivery (+ ₹{item.item.deliveryCharges})</span>
                  </div>
                )}
              </div>
              <div
                className={`
                        ${
                          item.item.isAvailable
                            ? "text-[#15a349] border-[#15a349]"
                            : "text-red-500 border-red-500"
                        }
                        px-3 py-1 rounded-full font-semibold w-fit mt-5 border
                    `}
              >
                {item.item.isAvailable
                  ? `Available From ${DateFormatter(
                      new Date(item.item.availableFrom)
                    )}`
                  : `Not Available ( Available From ${DateFormatter(
                      new Date(item.item.availableFrom)
                    )} )`}
              </div>
              <div className="mt-5 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                  <GrLocation />
                  {item.item.itemLocation?.addressLine1}
                  {item.item.itemLocation?.addressLine2
                    ? ", " + item.item.itemLocation?.addressLine2
                    : ""}
                </div>
                <div className="flex items-center gap-1 ml-6">
                  <span>{item.item.itemLocation?.city},</span>
                  <span>{item.item.itemLocation?.state},</span>
                  <span>{item.item.itemLocation?.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-5">
                <img
                  src={item.item.lenderId?.profileImage}
                  alt="profileImage"
                  className="w-12 h-12 object-cover rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {item.item.lenderId?.firstName}{" "}
                    {item.item.lenderId?.lastName}
                  </span>
                  <span className="text-gray-500">
                    ⭐ {item.lenderAvgRating} ({item.lenderTotalRating} Ratings)
                  </span>
                </div>
              </div>
              <button
                className={`
                        mt-5 px-5 py-2 rounded-md flex items-center justify-center font-semibold text-white
                        ${
                          item.item.isAvailable
                            ? "bg-[#15a349] hover:bg-[#0e7a2b]"
                            : "bg-gray-400 cursor-not-allowed"
                        }
                    `}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (user && item.item.lenderId?._id === user._id) {
                    toast.error("You can't rent your own item");
                    return;
                  }

                  navigate(`/rentItem/${item.item._id}`);
                }}
                disabled={!item.item.isAvailable}
              >
                Rent Now
              </button>
            </div>
          </div>

          {item.item.ratingAndReviews &&
            item.item.ratingAndReviews.length > 0 && (
              <div className="my-10 flex flex-col gap-5">
                <h1 className="text-3xl font-semibold">Ratings & Reviews</h1>

                <Swiper
                  spaceBetween={15}
                  loop={true}
                  modules={[Navigation, Pagination]}
                  pagination={{ clickable: true }}
                  className="mySwiper w-full"
                  breakpoints={{
                    // when window width is >= 320px
                    320: {
                      slidesPerView: 1,
                    },
                    // when window width is >= 640px
                    750: {
                      slidesPerView: 2,
                    },
                    1110: {
                      slidesPerView: 3,
                    },
                    // you can add more breakpoints here
                  }}
                >
                  {item.item.ratingAndReviews.map((review, index) => (
                    <SwiperSlide key={index}>
                      <RatingReviewCard
                        email={review.reviewer.email}
                        firstName={review.reviewer.firstName}
                        image={review.reviewer.profileImage}
                        lastName={review.reviewer.lastName}
                        rating={review.rating}
                        review={review.review}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
        </div>
      )}
    </>
  );
};

export default Item;
