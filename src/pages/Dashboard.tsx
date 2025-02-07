import { useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import Sidebar from "../components/core/Dashboard/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { SidebarLink } from "../data/SidebarLink";

const Dashboard = () => {
  const userLoading = useSelector((state: RootState) => state.user.isLoading);
  const itemLoading = useSelector((state: RootState) => state.item.isLoading);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();

  const currentPage = SidebarLink.find(
    (link) => link.path === location.pathname
  );

  return (
    <>
      {userLoading || itemLoading ? (
        <Loader />
      ) : (
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
              <h1 className="text-3xl font-semibold">
                {currentPage?.name}
              </h1>

              <Outlet />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
