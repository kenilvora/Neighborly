import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/common/Navbar";
import ErrorPage from "./components/common/ErrorPage";
import ViewAllItems from "./pages/ViewAllItems";
import { FaArrowUpLong } from "react-icons/fa6";
import { useEffect, useState } from "react";
import SignUp from "./pages/SignUp";
import OpenRoute from "./components/common/OpenRoute";
import OTPVerify from "./pages/OTPVerify";
import Login from "./pages/Login";
import PrivateRoute from "./components/common/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import DashboardComponent from "./components/core/Dashboard/Dashboard";
import Profile from "./components/core/Dashboard/Profile";
import RatingsReviews from "./components/core/Dashboard/RatingsReviews";
import BorrowedItems from "./components/core/Dashboard/BorrowedItems";
import LendingItemsStats from "./components/core/Dashboard/LendingItemsStats";
import Transactions from "./components/core/Dashboard/Transactions";
import AddItem from "./components/core/Dashboard/AddItem";
import Disputes from "./components/core/Dashboard/Disputes";

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

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      <div className="mt-[4.7rem]">
        <Routes>
          <Route path="/" element={<ViewAllItems />} />

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

            <Route path="/dashboard/disputes" element={<Disputes />} />

            <Route path="/dashboard/addItem" element={<AddItem />} />
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
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
