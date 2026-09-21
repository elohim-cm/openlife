import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LineChart = ({ title, seriesData, categories, height = 350, width = "100%" }) => {
  const options = {
    chart: {
      height: height,
      type: "line",
      dropShadow: {
        enabled: true,
        color: "#000",
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#4CAF50", "#2196F3", "#FF9800"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    title: {
      text: title,
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    markers: {
      size: 1,
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Date",
      },
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
    tooltip: {
      shared: true,
    },
  };

  return (
    <Box sx={{ backgroundColor: "white", p: 2 }}>
      <ReactApexChart
        options={options}
        series={seriesData}
        type="line"
        height={height}
        width={width}
      />
    </Box>
  );
};

export default LineChart;