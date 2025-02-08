import { useEffect, useState } from "react";
import CustomDropdown from "../../common/CustomDropdown";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import {
  IRatingsAndReviewsOfItemInDetail,
  IRatingsAndReviewsOfUserInDetail,
} from "@kenil_vora/neighborly";
import {
  getRatingAndReviewsOfItemsOfAUser,
  getRatingAndReviewsOfUser,
} from "../../../services/operations/ratingsAndReviewsAPI";
import Loader from "../../common/Loader";
import RatingReviewCard from "../../common/RatingReviewCard";

const RatingsReviews = () => {
  const options = [
    {
      value: "User",
      label: "Feedback On Me",
    },
    {
      value: "Item",
      label: "Feedback On My Items",
    },
  ];

  const [filter, setFilter] = useState({
    option: options[0].value,
  });

  const [userReviews, setUserReviews] =
    useState<IRatingsAndReviewsOfUserInDetail>(
      {} as IRatingsAndReviewsOfUserInDetail
    );

  const [itemReviews, setItemReviews] = useState<
    IRatingsAndReviewsOfItemInDetail[]
  >([] as IRatingsAndReviewsOfItemInDetail[]);

  const [itemsData, setItemsData] = useState<
    { value: string; label: string }[]
  >([]);

  const [itemFilter, setItemFilter] = useState({
    item: "",
  });

  const [currItem, setCurrItem] = useState<IRatingsAndReviewsOfItemInDetail>(
    {} as IRatingsAndReviewsOfItemInDetail
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        if (filter.option === "User") {
          if (!userReviews) {
            const res = await getRatingAndReviewsOfUser();
            setUserReviews(res);
          }
        } else {
          if (!itemReviews || itemReviews.length === 0) {
            const res = await getRatingAndReviewsOfItemsOfAUser();
            setItemReviews(res);

            if (res.length > 0) {
              const items = res.map((item) => {
                return {
                  value: item.itemId.toString(),
                  label: item.itemName,
                };
              });

              setItemsData(items);
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [filter.option]);

  useEffect(() => {
    if (itemsData.length > 0) {
      setItemFilter({
        item: itemsData[0].value,
      });
    }
  }, [itemsData]);

  useEffect(() => {
    const item = itemReviews.find(
      (item) => item.itemId.toString() === itemFilter.item
    );

    if (item) {
      setCurrItem(item);
    }
  }, [itemFilter.item]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-5 mt-5">
          <div className="flex justify-end items-center w-full">
            <div className="min-w-[220px] z-[15]">
              <CustomDropdown
                data={options}
                label="Filter"
                fn={setFilter}
                value={filter.option}
                name="option"
              />
            </div>
          </div>
          {filter.option === "User" ? (
            <div className="flex flex-col gap-5">
              {!userReviews.userReviews ||
              userReviews.userReviews.length === 0 ? (
                <div className="flex items-center justify-center">
                  <h1 className="text-lg font-semibold">No Reviews Found</h1>
                </div>
              ) : (
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
                  {userReviews.userReviews.map((review, index) => (
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
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {itemReviews.length === 0 ? (
                <div className="flex items-center justify-center">
                  <h1 className="text-lg font-semibold">No Items Found</h1>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="z-10 flex min-[670px]:items-center min-[670px]:gap-5 max-[670px]:flex-col">
                    <h1 className="text-xl font-semibold min-w-[130px]">
                      Select Item :
                    </h1>
                    <div className="min-w-[220px] w-full">
                      <CustomDropdown
                        data={itemsData}
                        fn={setItemFilter}
                        label="Select Item"
                        name="item"
                        value={itemFilter.item}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-5">
                    <h1 className="text-xxl font-semibold">
                      Item Name :{" "}
                      <span className="text-blue-600">{currItem.itemName}</span>
                    </h1>

                    {!currItem.itemReviews ||
                    currItem.itemReviews.length === 0 ? (
                      <div className="flex items-center justify-center">
                        <h1 className="text-lg font-semibold">
                          No Reviews Found
                        </h1>
                      </div>
                    ) : (
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
                        {currItem.itemReviews.map((review, index) => (
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
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RatingsReviews;
