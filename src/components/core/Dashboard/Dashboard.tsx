import { useEffect, useState } from "react";
import { getDashboardData } from "../../../services/operations/userAPI";
import { FaBoxOpen } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import { LuTriangleAlert } from "react-icons/lu";
import Loader from "../../common/Loader";
import { RootState } from "../../../reducer/store";
import { useSelector } from "react-redux";

interface DashboardData {
  borrowedItemsCount: number;
  lentItemsCount: number;
  totalProfit: number;
  pendingReturns: number;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(
    {} as DashboardData
  );

  const { token } = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }

    const getDashboard = async () => {
      try {
        const res = await getDashboardData();

        setDashboardData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col mt-5">
          <div
            className={`grid grid-cols-4 gap-5 max-[1180px]:grid-cols-2 max-[740px]:grid-cols-1`}
          >
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">
                  Total Items Borrowed
                </span>
                <FaBoxOpen />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.borrowedItemsCount || 0}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">Total Items Lent</span>
                <FaBoxOpen />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.lentItemsCount || 0}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">Pending Returns</span>
                <LuTriangleAlert />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.pendingReturns || 0}
              </div>
            </div>
            <div className="flex flex-col justify-between p-5 rounded-lg border border-neutral-300 gap-2 shadow-md">
              <div className="flex justify-between w-full items-center">
                <span className="text-sm font-medium">Total Profit</span>
                <FaRupeeSign />
              </div>
              <div className="font-bold text-3xl">
                {dashboardData.totalProfit || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
