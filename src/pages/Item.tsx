import { IItemWithAvgRating } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getItemById } from "../services/operations/itemAPI";
import Loader from "../components/common/Loader";
import { GrLocation } from "react-icons/gr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import RatingReviewCard from "../components/common/RatingReviewCard";

const Item = () => {
  const [item, setItem] = useState<IItemWithAvgRating>(
    {} as IItemWithAvgRating
  );

  const [loading, setLoading] = useState(true);

  const location = useLocation();

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
        <div className="w-[94%] max-w-[1480px] mx-auto mt-16 h-auto">
          <div className="flex gap-16">
            <div className="flex flex-col items-center justify-center w-[35%]">
              <div className="w-full h-[500px] rounded-xl overflow-hidden bg-gray-200">
                <img
                  src={item.item.images[currImage]}
                  alt={item.item.name}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
              </div>

              <div
                className={`mt-5 grid grid-cols-${item.item.images.length} gap-4`}
              >
                {item.item.images.map((image, index) => (
                  <div
                    key={index}
                    className={`overflow-hidden h-[120px] rounded-md p-2 bg-gray-200 cursor-pointer 
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

            <div className="flex flex-col w-[64%]">
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
              <div className="flex items-center mt-4 justify-between">
                <div className="text-xl font-semibold">
                  ₹{item.item.price} / Day
                </div>

                <div className="text-xl font-semibold">
                  Deposit Amount ( Fully Refundable ) : ₹
                  {item.item.depositAmount}
                </div>
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
                {item.item.isAvailable ? "Available" : "Not Available"}
              </div>
              <div className="mt-5 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                  <GrLocation />
                  {item.item.itemLocation?.addressLine1}
                  {item.item.itemLocation?.addressLine2
                    ? ", " + item.item.itemLocation?.addressLine2
                    : ""}
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <span>{item.item.itemLocation?.country},</span>
                  <span>{item.item.itemLocation?.state},</span>
                  <span>{item.item.itemLocation?.city}</span>
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
                        mt-5 px-5 py-2 rounded-md font-semibold text-white
                        ${
                          item.item.isAvailable
                            ? "bg-[#15a349] hover:bg-[#0e7a2b]"
                            : "bg-gray-400 cursor-not-allowed"
                        }
                    `}
              >
                Rent Now
              </button>
            </div>
          </div>

          <div className="my-10">
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
        </div>
      )}
    </>
  );
};

export default Item;
