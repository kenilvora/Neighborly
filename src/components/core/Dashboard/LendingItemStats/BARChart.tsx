import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  label: string;
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

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Lending Item Stats",
    },
  },
};

const BARChart = ({ data, label }: BarChartProps) => {
  const labels = data.map((item) => item.label);

  const dataset = {
    labels,
    datasets: [
      {
        label: label,
        data: data.map((item) => item.value),
        backgroundColor: getRandomColors(data.length),
      },
    ],
  };

  return <Bar options={options} data={dataset} />;
};

export default BARChart;
