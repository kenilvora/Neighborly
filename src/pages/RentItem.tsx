import { BorrowItemInput, IItemWithAvgRating } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { borrowItem, getItemById } from "../services/operations/itemAPI";
import Loader from "../components/common/Loader";
import DatePickerComponent from "../components/common/DatePickerComponent";
import dayjs, { Dayjs } from "dayjs";
import { DateFormatter } from "../utils/DateFormatter";
import { useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import { LuCheck, LuTruck, LuUser } from "react-icons/lu";
import toast from "react-hot-toast";
import { BiErrorCircle } from "react-icons/bi";

const RentItem = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const [item, setItem] = useState<IItemWithAvgRating>(
    {} as IItemWithAvgRating
  );

  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [deliveryType, setDeliveryType] = useState("");

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!item || !item.item) {
      return;
    }

    const total =
      item.item.price * (endDate.diff(startDate, "days") + 1) +
      item.item.depositAmount +
      (deliveryType === "Delivery" ? item.item?.deliveryCharges || 0 : 0);

    setTotalAmount(total);
  }, [startDate, endDate, deliveryType, item]);

  const navigate = useNavigate();

  useEffect(() => {
    const getItem = async () => {
      const id = location.pathname.split("/").at(-1);

      if (!id) {
        return;
      }

      try {
        const response = await getItemById(id);

        if (!response.item.isAvailable) {
          toast.error("Item is not available for rent");
          navigate("/");
        }

        if (user && response.item.lenderId?._id === user._id) {
          toast.error("You can't rent your own item");
          navigate("/");
        }

        setItem(response);
        setDeliveryType(
          response.item.deliveryType === "Delivery" ? "Delivery" : "Pickup"
        );
        setStartDate(dayjs(response.item.availableFrom));
        setEndDate(dayjs(response.item.availableFrom));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getItem();
  }, [location.pathname]);

  const handleRentNow = async () => {
    setLoading(true);
    try {
      const data = {
        itemId: item.item._id,
        startDate: new Date(startDate.toString()),
        endDate: new Date(endDate.toString()),
        paymentMode: paymentMethod,
        deliveryType,
        paymentStatus: "Pending",
      } as BorrowItemInput;

      const res = await borrowItem(data);

      if (res) {
        navigate("/dashboard/borrowedItems");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-neutral-100 w-full min-h-[calc(100vh-74.8px)] py-10">
          <div
            className="flex justify-between gap-10 w-[89%] max-w-[1480px] mx-auto h-auto max-[1100px]:flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[50%] p-7 max-[700px]:p-4 rounded-lg shadow-lg bg-neutral-50 flex flex-col gap-5 max-[1100px]:w-full">
              <h1 className="text-3xl font-semibold">Rent {item.item.name}</h1>

              <p className="text-lg text-neutral-700">
                {item.item.description}
              </p>

              <div className="flex gap-4 bg-sky-100 rounded-lg p-5 max-[700px]:flex-col">
                <div className="w-[150px] aspect-square max-[700px]:w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 p-3">
                  <img
                    src={item.item.images[0]}
                    alt={item.item.name}
                    loading="lazy"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <div className="flex flex-col max-[700px]:gap-1">
                  <div className="text-xl font-semibold max-[700px]:text-3xl max-[550px]:text-2xl">{item.item.name}</div>

                  <div className="text-lg text-neutral-700 capitalize max-[700px]:text-xl max-[550px]:text-lg">
                    {item.item.category.name}
                  </div>

                  <div className="text-lg max-[700px]:text-xl max-[550px]:text-lg">
                    <span className="font-semibold">₹{item.item.price}</span>{" "}
                    <span className="text-neutral-700">/ Day</span>
                  </div>

                  <div className="text-lg max-[700px]:text-xl max-[550px]:text-lg">
                    Deposit Amount :{" "}
                    <span className="font-semibold">
                      ₹{item.item.depositAmount}
                    </span>{" "}
                    <span className="text-neutral-700">
                      ( Fully Refundable )
                    </span>
                  </div>

                  <div
                    className={`
                        ${
                          item.item.isAvailable
                            ? "text-[#15a349] border-[#15a349]"
                            : "text-red-500 border-red-500"
                        }
                        px-3 py-1 rounded-full font-semibold w-fit mt-1 border max-[450px]:text-sm
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
                </div>
              </div>

              <div className="flex justify-between items-center gap-5 max-[550px]:flex-col max-[550px]:items-start">
                <div className="flex flex-col gap-2 justify-center">
                  <label className="text-lg font-semibold" htmlFor="startDate">
                    Start Date
                  </label>
                  <DatePickerComponent
                    date={startDate}
                    setDate={setStartDate}
                    label="Start Date"
                    minDate={dayjs(item.item.availableFrom)}
                  />
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  <label className="text-lg font-semibold" htmlFor="endDate">
                    End Date
                  </label>
                  <DatePickerComponent
                    date={endDate}
                    setDate={setEndDate}
                    label="End Date"
                    minDate={dayjs(item.item.availableFrom)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="paymentMethod"
                  className="text-lg font-semibold"
                >
                  Payment Method :{" "}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    className={`flex items-center gap-2 w-fit px-3 py-2 rounded-lg 
                              hover:bg-gray-100 cursor-pointer hover:border hover:border-gray-300
                              ${
                                paymentMethod === "Cash"
                                  ? "bg-sky-200 text-blue-600"
                                  : "text-neutral-500 border border-gray-300"
                              }
                              `}
                    onClick={() => setPaymentMethod("Cash")}
                  >
                    Cash
                  </button>
                  <button
                    className={`flex items-center gap-2 w-fit px-3 py-2 rounded-lg 
                              hover:bg-gray-100 cursor-pointer hover:border hover:border-gray-300
                              ${
                                paymentMethod === "Wallet"
                                  ? "bg-sky-200 text-blue-600"
                                  : "text-neutral-500 border border-gray-300"
                              }
                              `}
                    onClick={() => setPaymentMethod("Wallet")}
                  >
                    Wallet
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <label className="text-lg font-semibold">Delivery Type :</label>

                <div className="flex items-center gap-5 max-[450px]:flex-col max-[450px]:items-start max-[450px]:gap-3">
                  {(item.item.deliveryType === "Pickup" ||
                    item.item.deliveryType === "Both (Pickup & Delivery)") && (
                    <button
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-100 font-medium hover:border hover:border-gray-300
                      ${
                        deliveryType === "Pickup"
                          ? "text-blue-600 bg-sky-200"
                          : "text-neutral-500 border border-gray-300"
                      }
                    `}
                      onClick={() => setDeliveryType("Pickup")}
                    >
                      <LuUser />
                      <span>Pickup</span>
                    </button>
                  )}

                  {(item.item.deliveryType === "Delivery" ||
                    item.item.deliveryType === "Both (Pickup & Delivery)") && (
                    <button
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-100 font-medium hover:border hover:border-gray-300
                                ${
                                  deliveryType === "Delivery"
                                    ? "text-blue-600 bg-sky-200"
                                    : "text-neutral-500 border border-gray-300"
                                }
                    `}
                      onClick={() => setDeliveryType("Delivery")}
                    >
                      <LuTruck />
                      <span>Delivery (+ ₹{item.item.deliveryCharges})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-[50%] flex flex-col gap-5 justify-between max-[1100px]:w-full">
              <div className="w-full p-7 rounded-lg shadow-lg bg-neutral-50 flex flex-col gap-5 h-fit">
                <div>
                  <h2 className="text-2xl font-semibold">Rental Summary</h2>

                  <p className="text-neutral-700">
                    Review the details of your rental.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3 divide-y divide-neutral-300">
                  <div className="flex flex-col justify-center gap-1 text-lg">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">Rental Time :</span>
                      <span>
                        {DateFormatter(new Date(startDate.toString()))} -{" "}
                        {DateFormatter(new Date(endDate.toString()))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">Duration :</span>
                      <span>{endDate.diff(startDate, "days") + 1} Days</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">Daily Rate :</span>
                      <span>₹{item.item.price} / Day</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">
                        Delivery Method :
                      </span>
                      <span>{deliveryType}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">Payment Method :</span>
                      <span>
                        {paymentMethod === ""
                          ? "Select Payment Method"
                          : paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-1 text-lg pt-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">Sub Total :</span>
                      <span>
                        ₹
                        {item.item.price *
                          (endDate.diff(startDate, "days") + 1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">
                        Security Deposit :
                      </span>
                      <span>₹{item.item.depositAmount}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-neutral-500">Delivery Fee :</span>
                      <span>
                        {deliveryType === "Delivery"
                          ? `₹${item.item.deliveryCharges}`
                          : "Free"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-1 text-xl pt-3">
                    <div className="flex justify-between items-center gap-2 font-semibold">
                      <span>Total :</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="bg-sky-600 text-white flex items-center gap-2 justify-center font-semibold rounded-lg py-3 text-xl"
                  onClick={() => {
                    if (!paymentMethod) {
                      toast.error("Please select payment method");
                      return;
                    }

                    if (
                      (user?.accountBalance || 0) < totalAmount &&
                      paymentMethod === "Wallet"
                    ) {
                      toast.error(
                        "You don't have sufficient balance in your wallet to rent this item."
                      );
                      return;
                    }

                    handleRentNow();
                  }}
                >
                  <LuCheck className="text-xl" />
                  Rent Now
                </button>
              </div>

              {paymentMethod === "Wallet" && (
                <>
                  <div
                    className={`w-full rounded-xl border-2 shadow-lg flex gap-3 min-h-[50px] items-center 
                          ${
                            (user?.accountBalance || 0) >= totalAmount
                              ? "text-[#15a349] border-[#15a349]"
                              : "text-red-500 border-red-500"
                          }
                        `}
                  >
                    <div
                      className={`h-full w-2 rounded-l-3xl
                        ${
                          (user?.accountBalance || 0) >= totalAmount
                            ? "bg-[#15a349]"
                            : "bg-red-500"
                        }
                      `}
                    ></div>

                    <p className="text-lg font-semibold">
                      Wallet Balance : ₹{user?.accountBalance || 0}
                    </p>
                  </div>
                  <div
                    className={`w-full rounded-xl border-2 shadow-lg flex gap-3 min-h-[50px] items-center 
                          ${
                            (user?.accountBalance || 0) >= totalAmount
                              ? "text-[#15a349] border-[#15a349]"
                              : "text-red-500 border-red-500"
                          }
                        `}
                  >
                    <div
                      className={`h-full w-2 rounded-l-3xl
                        ${
                          (user?.accountBalance || 0) >= totalAmount
                            ? "bg-[#15a349]"
                            : "bg-red-500"
                        }
                      `}
                    ></div>
                    {(user?.accountBalance || 0) < totalAmount ? (
                      <div className="flex items-center gap-2">
                        <BiErrorCircle className="text-xl text-red-500" />
                        <p>
                          You don't have sufficient balance in your wallet to
                          rent this item.{" "}
                          <NavLink
                            to="/dashboard/wallet"
                            className="text-blue-600 text-lg font-bold underline"
                          >
                            Add Money
                          </NavLink>
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2 py-2">
                        <LuCheck className="text-xl text-[#15a349]" />
                        <div className="flex flex-col gap-1">
                          <p>
                            You have sufficient balance in your wallet to rent
                            this item.
                          </p>
                          <p className="font-bold">
                            ( Remaining Balance : ₹
                            {(user?.accountBalance || 0) - totalAmount})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RentItem;
