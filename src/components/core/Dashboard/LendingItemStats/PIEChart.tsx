import { PieChart } from "@mui/x-charts";

interface PieChartData {
  id: number;
  label: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
}

export default function PIEChart({ data }: PieChartProps) {
  return (
    <PieChart
      series={[
        {
          data: data,
        },
      ]}
      height={300}
    />
  );
}
