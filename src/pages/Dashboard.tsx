import { useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import Sidebar from "../components/core/Dashboard/Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  const { isLoading } = useSelector((state: RootState) => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="h-[calc(100vh-75px)] overflow-hidden relative flex bg-neutral-100">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />

          <div
            className={`w-9/12 mx-auto px-5 py-7 min-h-[calc(100vh-75px)] overflow-auto grow
                    ${
                      isSidebarOpen ? "max-w-[1100px]" : "max-w-[1300px]"
                    } transition-all duration-300 ease-in-out
            `}
          >
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
