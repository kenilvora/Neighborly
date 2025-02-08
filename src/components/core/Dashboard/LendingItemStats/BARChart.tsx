import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

const chartSetting = {
  yAxis: [],
  series: [
    { dataKey: "borrowCount", label: "Times Borrowed" },
    { dataKey: "profit", label: "Profit" },
  ],
  height: 300,
  sx: {
    [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
      transform: "translateX(-10px)",
    },
  },
};

interface BarChartData {
  itemName: string;
  borrowCount: number;
  profit: number;
  [key: string]: string | number;
}

interface BarChartProps {
  dataset: BarChartData[];
}

export default function BARChart({ dataset }: BarChartProps) {
  const [tickPlacement] = React.useState<
    "start" | "end" | "middle" | "extremities"
  >("middle");
  const [tickLabelPlacement] = React.useState<"middle" | "tick">("middle");

  return (
    <div style={{ width: "100%" }}>
      <BarChart
        dataset={dataset}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "itemName",
            tickPlacement,
            tickLabelPlacement,
          },
        ]}
        {...chartSetting}
      />
    </div>
  );
}
