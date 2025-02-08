import { useEffect, useState } from "react";
import BARChart from "./BARChart";
import PIEChart from "./PIEChart";
import { IStatisticalData } from "@kenil_vora/neighborly";
import Loader from "../../../common/Loader";
import { getStatisticalData } from "../../../../services/operations/userAPI";

interface BarChartData {
  itemName: string;
  borrowCount: number;
  profit: number;
  [key: string]: string | number;
}

interface PieChartData {
  id: number;
  label: string;
  value: number;
}

const LendingItemsStats = () => {
  const [statsData, setStatsData] = useState<IStatisticalData[]>(
    [] as IStatisticalData[]
  );

  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [pieChartData2, setPieChartData2] = useState<PieChartData[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getStatisticalData();
        setStatsData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (statsData && statsData.length > 0) {
      // Bar Chart Data
      const barData: BarChartData[] = statsData.flatMap((data) =>
        data.items.map((item) => ({
          itemName: item.itemName,
          borrowCount: item.borrowCount,
          profit: item.totalProfit,
        }))
      );

      // Pie Chart Data
      const pieData: PieChartData[] = statsData.map((data, index) => ({
        id: index,
        label: data.categoryName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("-"),
        value: data.items.length,
      }));

      const pieData2: PieChartData[] = statsData.map((data, index) => ({
        id: index,
        label: data.categoryName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("-"),
        value: data.items
          .map((item) => item.totalProfit)
          .reduce((a, b) => a + b, 0),
      }));

      // Total Profit
      const profit = statsData.reduce((acc, data) => {
        return (
          acc + data.items.reduce((acc, item) => acc + item.totalProfit, 0)
        );
      }, 0);

      setBarChartData(barData);
      setPieChartData(pieData);
      setPieChartData2(pieData2);
      setTotalProfit(profit);
    }
  }, [statsData]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-5 mt-5">
          <div className="flex flex-col gap-3 py-4 px-6 rounded-xl border-2 border-neutral-300 shadow-xl">
            <h1 className="text-2xl font-bold">
              Category Wise Items Borrowed Count
            </h1>
            <PIEChart data={pieChartData} />
          </div>
          <div className="flex flex-col gap-3 py-4 px-6 rounded-xl border-2 border-neutral-300 shadow-xl">
            <h1 className="text-2xl font-bold">Category Wise Profit Earned</h1>
            <PIEChart data={pieChartData2} />
          </div>
          <div className="flex flex-col gap-3 py-4 px-6 rounded-xl border-2 border-neutral-300 shadow-xl">
            <h1 className="text-2xl font-bold">Most Borrowed Items</h1>
            <BARChart dataset={barChartData} />
          </div>

          <div className="flex flex-col rounded-xl border-2 border-neutral-300 shadow-xl p-4 gap-2 px-6">
            <h1 className="text-2xl font-bold">Total Profit Earned</h1>
            <h2 className="text-3xl font-bold text-green-600">
              ₹{totalProfit}
            </h2>
          </div>
        </div>
      )}
    </>
  );
};

export default LendingItemsStats;
