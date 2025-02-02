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
