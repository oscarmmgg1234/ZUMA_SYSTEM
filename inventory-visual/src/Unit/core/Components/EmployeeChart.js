import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { color } from "chart.js/helpers";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const rgbToRgba = (rgb, alpha) => {
  return rgb.replace("rgb", "rgba").replace(")", `, ${alpha})`);
};
const ChartComponent = ({ data, options }) => {
  const chartData = {
    datasets: data.map((dataset) => ({
      ...dataset,
      fill: true,
      backgroundColor: rgbToRgba(dataset.borderColor, 0.1), // Optional: Set the line tension for smooth curves
      tension: 0.3, // Optional: Set the line tension for smooth curves
    })),
  };

  const defaultOptions = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MMM d", // Display format for dates
          },
        },
         grid: {
          color: "grey",
        },
        title: {
          color: "white",
          display: true,
          text: "This Week",
        },
        ticks: {
          color: "grey",
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        title: {
          color: "white",
          display: true,
          text: "Reductions / Hour",
        },
         grid: {
          color: "grey",
        },
        ticks: {
          color: "grey",
          beginAtZero: true,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white", // Set the legend font color to white
        },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Line data={chartData} options={mergedOptions} />
    </div>
  );
};

export default ChartComponent;
