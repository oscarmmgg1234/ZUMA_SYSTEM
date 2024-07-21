// TopProductsChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { color } from "chart.js/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsChart = ({ data }) => {
  const options = {
    indexAxis: "y",
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        color: "white",
        display: true,
        text: "Top 5 Products Today",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "white",
          maxTicksLimit: 5, // limit the number of ticks on the x-axis for readability
        },
        title: {
          color: "grey",
          display: true,
          text: "Reductions/Hour",
        },
        grid: {
          color: "grey",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
        title: {
          color: "grey",
          display: true,
          text: "Products",
        },
        grid: {
          color: "grey",
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopProductsChart;
