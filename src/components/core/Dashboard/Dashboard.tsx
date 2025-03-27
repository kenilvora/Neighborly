import { useEffect, useState } from "react";
import { getDashboardData } from "../../../services/operations/userAPI";
import { FaBoxOpen } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import { LuTriangleAlert } from "react-icons/lu";
import Loader from "../../common/Loader";
import { RootState } from "../../../reducer/store";
import { useSelector } from "react-redux";
import { DashboardData } from "../../../services/operations/userAPI";
import { DateFormatter } from "../../../utils/DateFormatter";

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
        <div className="flex flex-col mt-5 gap-5">
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

          <div className="flex flex-col gap-5 p-5 rounded-lg border border-neutral-300 shadow-md">
            <h2 className="text-2xl font-bold">Recent Activities</h2>

            <div className="w-full overflow-x-auto">
              <div className="flex flex-col min-w-max w-full divide-y divide-neutral-300">
                <div className="flex w-full px-5 py-3 font-bold">
                  <span className="w-[20%] min-w-[140px]">Activity</span>
                  <span className="w-[35%] min-w-[200px]">Item</span>
                  <span className="w-[20%] min-w-[140px]">Status</span>
                  <span className="w-[25%] min-w-[100px]">Date</span>
                </div>
                <div className="flex flex-col w-full divide-y divide-neutral-300">
                  {!dashboardData.recentActivities ||
                  dashboardData.recentActivities.length === 0 ? (
                    <div className="flex w-full px-5 py-3">
                      <span className="w-full text-center">
                        No recent activities
                      </span>
                    </div>
                  ) : (
                    dashboardData.recentActivities.map((activity) => (
                      <div key={activity._id} className="flex w-full px-5 py-3">
                        <span className="w-[20%] min-w-[140px]">
                          {activity.type}
                        </span>
                        <span className="w-[35%] min-w-[200px]">
                          {activity.itemID.name}
                        </span>
                        <span className="w-[20%] min-w-[140px]">
                          {activity.status}
                        </span>
                        <span className="w-[25%] min-w-[100px]">
                          {DateFormatter(new Date(activity.createdAt), true)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
