import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/common/Navbar";
import ErrorPage from "./components/common/ErrorPage";
import ViewAllItems from "./pages/ViewAllItems";
import { FaArrowUpLong } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import SignUp from "./pages/SignUp";
import OpenRoute from "./components/common/OpenRoute";
import OTPVerify from "./pages/OTPVerify";
import Login from "./pages/Login";
import PrivateRoute from "./components/common/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import DashboardComponent from "./components/core/Dashboard/Dashboard";
import Profile from "./components/core/Dashboard/Profile/Profile";
import RatingsReviews from "./components/core/Dashboard/RatingsReviews";
import BorrowedItems from "./components/core/Dashboard/BorrowItems/BorrowedItems";
import LendingItemsStats from "./components/core/Dashboard/LendingItemStats/LendingItemsStats";
import Transactions from "./components/core/Dashboard/Transactions";
import AddItem from "./components/core/Dashboard/AddItem";
import Wallet from "./components/core/Dashboard/Wallet";
import ViewLendItems from "./components/core/Dashboard/LendItems/ViewLendItems";
import ForgotPasswordToken from "./pages/ForgotPasswordToken";
import ForgotPassword from "./pages/ForgotPassword";
import PublicRoute from "./components/common/PublicRoute";
import Item from "./pages/Item";
import RentItem from "./pages/RentItem";
import UpdateItem from "./components/core/Dashboard/LendItems/UpdateItem";
import useOnClickOutside from "./hooks/useOnClickOutside";
import { apiConnector } from "./services/apiConnector";
import { userEndpoints } from "./services/apis";
import Loader from "./components/common/Loader";
import { DateFormatter } from "./utils/DateFormatter";

function App() {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll to top
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true); // Show button after scrolling 300px
      } else {
        setIsVisible(false); // Hide button when at the top
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState(
    [] as {
      _id: string;
      message: string;
      isRead: boolean;
      type: "System" | "User" | "Transaction";
      createdAt: Date;
      updatedAt: Date;
    }[]
  );

  const [notificationLoader, setNotificationLoader] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(notificationRef, () => setIsNotificationOpen(false));

  useEffect(() => {
    if (isNotificationOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("disable-pointer-events");
      notificationRef.current?.removeAttribute("inert");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("disable-pointer-events");
      notificationRef.current?.setAttribute("inert", "");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("disable-pointer-events");
      notificationRef.current?.removeAttribute("inert");
    };
  }, [isNotificationOpen]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!isNotificationOpen) {
          return;
        }

        setNotificationLoader(true);
        const res = await apiConnector(
          "GET",
          userEndpoints.GET_ALL_NOTIFICATIONS
        );

        setNotifications(res.data.notifications);
      } catch (error) {
        console.error(error);
      } finally {
        setNotificationLoader(false);
      }
    };

    fetchNotifications();
  }, [isNotificationOpen]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar setIsNotificationOpen={setIsNotificationOpen} />
      <div className={`mt-[4.55rem]`}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <ViewAllItems />
              </PublicRoute>
            }
          />

          <Route
            path="/item/:id"
            element={
              <PublicRoute>
                <Item />
              </PublicRoute>
            }
          />

          <Route
            path="/rentItem/:id"
            element={
              <PrivateRoute>
                <RentItem />
              </PrivateRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <OpenRoute>
                <SignUp />
              </OpenRoute>
            }
          />

          <Route path="/otp-verify" element={<OTPVerify />} />

          <Route
            path="/login"
            element={
              <OpenRoute>
                <Login />
              </OpenRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <OpenRoute>
                <ForgotPasswordToken />
              </OpenRoute>
            }
          />

          <Route
            path="/forgot-password/:token"
            element={
              <OpenRoute>
                <ForgotPassword />
              </OpenRoute>
            }
          />

          <Route
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardComponent />} />

            <Route path="/dashboard/profile" element={<Profile />} />

            <Route path="/dashboard/ratings" element={<RatingsReviews />} />

            <Route
              path="/dashboard/borrowedItems"
              element={<BorrowedItems />}
            />

            <Route
              path="/dashboard/lendedItemsStats"
              element={<LendingItemsStats />}
            />

            <Route path="/dashboard/transactions" element={<Transactions />} />

            <Route path="/dashboard/addItem" element={<AddItem />} />

            <Route path="/dashboard/myItems" element={<ViewLendItems />} />

            <Route
              path="/dashboard/myItems/update/:id"
              element={<UpdateItem />}
            />

            <Route path="/dashboard/wallet" element={<Wallet />} />
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>

      <div
        className={`fixed bottom-3 right-5 w-[450px] h-[600px] z-50 bg-neutral-50 border-2 border-neutral-300 rounded-xl shadow-xl p-5
                    transition-all duration-300 ease-in-out flex flex-col gap-3
                      ${
                        isNotificationOpen
                          ? "scale-100 opacity-100"
                          : "scale-0 opacity-0"
                      } enable-pointer-events overflow-y-auto
                    `}
        ref={notificationRef}
      >
        {notificationLoader ? (
          <Loader height="h-[100%]" />
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl font-semibold">No Notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-3 border-2 rounded-lg border-neutral-300
                          ${notification.isRead ? "bg-neutral-100" : ""}
                        `}
            >
              <p className="text-lg font-semibold leading-6">
                {notification.message}
              </p>
              <p className="text-sm text-neutral-500">
                {DateFormatter(new Date(notification.createdAt), true)}
              </p>
            </div>
          ))
        )}
      </div>

      <button
        className={`fixed bottom-5 right-5 bg-gray-300 text-neutral-700 p-2 text-2xl rounded-full shadow-lg cursor-pointer
          transition-opacity ${isVisible ? "opacity-100" : "opacity-0"} z-50`}
        style={{ transition: "opacity 0.4s ease" }}
        title="Go to Top"
        onClick={scrollToTop}
      >
        <FaArrowUpLong />
      </button>
    </div>
  );
}

export default App;
