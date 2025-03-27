import { useEffect, useState } from "react";
import BARChart from "./BARChart";
import PIEChart from "./PIEChart";
import { IStatisticalData } from "@kenil_vora/neighborly";
import Loader from "../../../common/Loader";
import { getStatisticalData } from "../../../../services/operations/userAPI";
import CustomDropdown from "../../../common/CustomDropdown";

interface BarChartData {
  label: string;
  value: number;
}

interface PieChartData {
  label: string;
  value: number;
}

const LendingItemsStats = () => {
  const [statsData, setStatsData] = useState<IStatisticalData[]>(
    [] as IStatisticalData[]
  );

  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);

  const pieChartOptions = [
    {
      value: "borrowCount",
      label: "Borrow Count",
    },
    {
      value: "profit",
      label: "Profit",
    },
  ];

  const [pieChart, setPieChart] = useState({
    option: pieChartOptions[0].value,
  });

  const barChartOptions = [
    {
      value: "borrowCount",
      label: "Borrow Count",
    },
    {
      value: "profit",
      label: "Profit",
    },
  ];

  const [barChart, setBarChart] = useState({
    option: barChartOptions[0].value,
  });

  const [loading, setLoading] = useState(false);

  // Fetch Stats Data
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

  // Update Pie Chart Data
  useEffect(() => {
    if (statsData && statsData.length > 0) {
      // Pie Chart Data
      const pieData: PieChartData[] = statsData.map((data) => ({
        label: data.categoryName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("-"),
        value:
          pieChart.option === "borrowCount"
            ? data.items.length
            : data.items
                .map((item) => item.totalProfit)
                .reduce((a, b) => a + b, 0),
      }));

      setPieChartData(pieData);
    }
  }, [pieChart.option, statsData]);

  // Update Bar Chart Data
  useEffect(() => {
    if (statsData && statsData.length > 0) {
      // Bar Chart Data
      const barData: BarChartData[] = statsData.flatMap((data) =>
        data.items.map((item) => ({
          label: item.itemName,
          value:
            barChart.option === "borrowCount"
              ? item.borrowCount
              : item.totalProfit,
        }))
      );

      setBarChartData(barData);
    }
  }, [barChart.option, statsData]);

  // Update Total Profit
  useEffect(() => {
    if (statsData && statsData.length > 0) {
      // Total Profit
      const profit = statsData.reduce((acc, data) => {
        return (
          acc + data.items.reduce((acc, item) => acc + item.totalProfit, 0)
        );
      }, 0);

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
            <div className="flex justify-between items-center gap-4">
              <h1 className="text-2xl font-bold max-[700px]:text-lg max-[500px]:text-sm">Category Wise Stats</h1>

              <div className="min-w-[200px]">
                <CustomDropdown
                  data={pieChartOptions}
                  fn={setPieChart}
                  label="Select Option"
                  name="option"
                  value={pieChart.option}
                />
              </div>
            </div>
            <PIEChart data={pieChartData} />
          </div>

          <div className="flex flex-col gap-3 py-4 px-6 rounded-xl border-2 border-neutral-300 shadow-xl">
            <div className="flex justify-between items-center gap-4">
              <h1 className="text-2xl font-bold max-[700px]:text-lg max-[500px]:text-sm">Item Wise Stats</h1>
              <div className="min-w-[200px]">
                <CustomDropdown
                  data={barChartOptions}
                  fn={setBarChart}
                  label="Select Option"
                  name="option"
                  value={barChart.option}
                />
              </div>
            </div>
            <BARChart
              data={barChartData}
              label={
                barChart.option === "borrowCount" ? "Borrow Count" : "Profit"
              }
            />
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
