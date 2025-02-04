import { useSelector } from "react-redux";
import { RootState } from "../reducer/store";
import Loader from "../components/common/Loader";
import Sidebar from "../components/core/Dashboard/Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const { isLoading } = useSelector((state: RootState) => state.user);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="h-[calc(100vh-75px)] overflow-hidden relative flex bg-neutral-100">
          <Sidebar />

          <div className="max-w-[1000px] w-11/12 mx-auto py-10 min-h-[calc(100vh-75px)] overflow-auto grow">
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
