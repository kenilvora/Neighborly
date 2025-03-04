import { BorrowItemInput, IItemWithAvgRating } from "@kenil_vora/neighborly";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
            className="flex justify-between gap-10 w-[94%] max-w-[1480px] mx-auto h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[50%] p-7 rounded-lg shadow-lg bg-neutral-50 flex flex-col gap-5">
              <h1 className="text-3xl font-semibold">Rent {item.item.name}</h1>

              <p className="text-lg text-neutral-700">
                {item.item.description}
              </p>

              <div className="flex gap-4 bg-sky-100 rounded-lg p-5">
                <div className="w-[150px] h-[150px] rounded-lg overflow-hidden shadow-lg bg-white">
                  <img
                    src={item.item.images[0]}
                    alt={item.item.name}
                    loading="lazy"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="text-xl font-semibold">{item.item.name}</div>

                  <div className="text-lg text-neutral-700 capitalize">
                    {item.item.category.name}
                  </div>

                  <div className="text-lg">
                    <span className="font-semibold">₹{item.item.price}</span>{" "}
                    <span className="text-neutral-700">/ Day</span>
                  </div>

                  <div className="text-lg">
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
                        px-3 py-1 rounded-full font-semibold w-fit mt-1 border
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

              <div className="flex justify-between items-center gap-5">
                <div className="flex flex-col gap-2 justify-center">
                  <label className="text-lg font-semibold" htmlFor="startDate">
                    Start Date
                  </label>
                  <DatePickerComponent
                    date={startDate}
                    setDate={setStartDate}
                    label="Start Date"
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
                  <div
                    className="flex items-center gap-2 w-fit px-3 py-2 border border-gray-300 rounded-lg 
                              hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="cash"
                      value={"Cash"}
                      className="cursor-pointer"
                      onChange={() => setPaymentMethod("Cash")}
                    />
                    <label htmlFor="cash" className="cursor-pointer">
                      Cash
                    </label>
                  </div>
                  <div
                    className="flex items-center gap-2 w-fit px-3 py-2 border border-gray-300 rounded-lg 
                              hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="wallet"
                      value={"Wallet"}
                      className="cursor-pointer"
                      onChange={() => setPaymentMethod("Wallet")}
                    />
                    <label htmlFor="wallet" className="cursor-pointer">
                      Wallet
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <label className="text-lg font-semibold">Delivery Type :</label>
                {item.item.deliveryType === "Both (Pickup & Delivery)" ? (
                  <div className="flex items-center w-full gap-4">
                    <div
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-300 hover:text-neutral-600 font-medium
                      ${
                        deliveryType === "Pickup"
                          ? "text-blue-600 bg-sky-200"
                          : ""
                      }
                    `}
                      onClick={() => setDeliveryType("Pickup")}
                    >
                      <LuUser />
                      <span>Pickup</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-300 hover:text-neutral-600 font-medium
                      ${
                        deliveryType === "Delivery"
                          ? "text-blue-600 bg-sky-200"
                          : ""
                      }
                    `}
                      onClick={() => setDeliveryType("Delivery")}
                    >
                      <LuTruck />
                      <span>Delivery (+ ₹{item.item.deliveryCharges})</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {item.item.deliveryType === "Pickup" ? (
                      <div
                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-300 hover:text-neutral-600 font-medium
                      ${
                        deliveryType === "Pickup"
                          ? "text-blue-600 bg-sky-200"
                          : ""
                      }
                    `}
                      >
                        <LuUser />
                        <span>Pickup</span>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg w-fit 
                                hover:bg-neutral-300 hover:text-neutral-600 font-medium
                      ${
                        deliveryType === "Delivery"
                          ? "text-blue-600 bg-sky-200"
                          : ""
                      }
                    `}
                      >
                        <LuTruck />
                        <span>Delivery (+ ₹{item.item.deliveryCharges})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="w-[50%] flex flex-col gap-5 justify-between">
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
                <div
                  className={`w-full rounded-lg border-2 shadow-lg flex gap-3 h-[50px] items-center overflow-hidden
                          ${
                            (user?.accountBalance || 0) >= totalAmount
                              ? "text-[#15a349] border-[#15a349]"
                              : "text-red-500 border-red-500"
                          }
                        `}
                >
                  <div
                    className={`h-full w-2
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
                        You don't have sufficient balance in your wallet to rent
                        this item.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LuCheck className="text-xl text-[#15a349]" />
                      <p>
                        You have sufficient balance in your wallet to rent this
                        item.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RentItem;
