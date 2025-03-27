import { useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import Sidebar from "../components/core/Dashboard/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { SidebarLink } from "../data/SidebarLink";
import { Helmet } from "react-helmet-async";
import { IoIosMenu } from "react-icons/io";

const Dashboard = () => {
  const userLoading = useSelector((state: RootState) => state.user.isLoading);
  const itemLoading = useSelector((state: RootState) => state.item.isLoading);

  const { otpType } = useSelector((state: RootState) => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();

  let currentPage;

  if (
    location.pathname.split("/")[3] &&
    location.pathname.split("/")[3] === "update"
  ) {
    currentPage = {
      id: "update",
      name: "Update Item",
    };
  } else {
    currentPage = SidebarLink.find((link) => link.path === location.pathname);
  }

  return (
    <>
      {userLoading.logout ||
      userLoading.passwordChange ||
      userLoading.twoFactorAuth ||
      userLoading.updateProfile ||
      userLoading.addMoney ||
      (userLoading.sendOtp && otpType === "twoFactorAuth") ||
      itemLoading.addItem ? (
        <Loader />
      ) : (
        <>
          <Helmet>
            <title>
              Dashboard{" "}
              {currentPage?.name === "Dashboard"
                ? ""
                : `- ${currentPage?.name}`}
            </title>
            <meta name="description" content="Neighborly | Dashboard" />
            <meta
              name="keywords"
              content="Neighborly, Dashboard, Neighborly Dashboard"
            />
          </Helmet>
          <div className="h-[calc(100vh-73px)] overflow-hidden relative flex">
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />

            <div
              className={`w-full mx-auto px-5 py-6 min-h-[calc(100vh-73px)] grow overflow-y-auto overflow-x-hidden`}
            >
              <div
                className={`
                ${
                  isSidebarOpen ? "max-w-[1100px]" : "max-w-[1300px]"
                } transition-all duration-300 ease-in-out mx-auto
              `}
              >
                <div className="flex items-center gap-5">
                  <IoIosMenu
                    className={`text-neutral-700 w-10 h-10 hover:cursor-pointer hover:bg-neutral-200 rounded-lg p-1 
                     border-2 ${
                       isSidebarOpen ? "hidden" : "hidden max-[800px]:block"
                     }`}
                    onClick={() => setIsSidebarOpen(true)}
                  />
                  <h1 className="text-3xl font-semibold max-[500px]:text-2xl">
                    {currentPage?.name}
                  </h1>
                </div>

                <Outlet />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
