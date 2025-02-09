import { Chart, registerables } from "chart.js";
import { Pie } from "react-chartjs-2";

Chart.register(...registerables);

interface PieChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
}

const getRandomColors = (numColors: number) => {
  const colors = [];
  for (let i = 0; i < numColors; i++) {
    const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
      Math.random() * 256
    )},${Math.floor(Math.random() * 256)})`;
    colors.push(color);
  }
  return colors;
};

export default function PIEChart({ data }: PieChartProps) {
  const options = {
    maintainAspectRatio: true,
  };

  const dataset = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: getRandomColors(data.length),
      },
    ],
  };

  return (
    <Pie
      data={dataset}
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "400px",
        maxHeight: "400px",
        alignSelf: "center",
      }}
      options={options}
    />
  );
}
