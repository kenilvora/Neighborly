import { useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import Sidebar from "../components/core/Dashboard/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { SidebarLink } from "../data/SidebarLink";

const Dashboard = () => {
  const { isLoading } = useSelector((state: RootState) => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();

  const currentPage = SidebarLink.find(
    (link) => link.path === location.pathname
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="h-[calc(100vh-76px)] overflow-hidden relative flex bg-neutral-100">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <div
            className={`w-11/12 mx-auto px-5 py-7 min-h-[calc(100vh-76px)] overflow-auto grow overflow-x-hidden overflow-y-auto
                    ${
                      isSidebarOpen ? "" : ""
                    } transition-all duration-300 ease-in-out
            `}
          >
            {
              <h1 className="text-3xl font-semibold text-neutral-700">
                {currentPage?.name}
              </h1>
            }
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
