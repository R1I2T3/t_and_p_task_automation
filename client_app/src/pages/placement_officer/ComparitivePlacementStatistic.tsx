import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
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
import { Typography } from "@mui/material";
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const colors = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

const borderColors = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

export const ComparativePlacementStatistics = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  }

  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Fetch departments for the dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "/api/placement_officer/unique-departments/"
        );
        const formattedDepartments = response.data.unique_departments.map(
          (dept: string) => ({ label: dept, value: dept })
        );
        setDepartments(formattedDepartments);
      } catch (error) {
        console.error("Error fetching unique departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch and process data for all selected departments
  const fetchChartData = async (departments: string[]) => {
    try {
      const allDataPromises = departments.map((department) =>
        axios.get(`/api/placement_officer/filter/${department}/`)
      );

      const allResponses = await Promise.all(allDataPromises);
      const allData = allResponses.map((response, index) => ({
        department: departments[index],
        data: JSON.parse(response.data.filtered_data),
      }));

      interface DataItem {
        consent: string;
        count: number;
      }

      // Transform data for Chart.js
      const labels = Array.from(
        new Set(
          allData.flatMap((deptData) =>
            deptData.data.map((item: DataItem) => item.consent)
          )
        )
      ); // Unique consent categories

      const datasets = allData.map((deptData, index) => ({
        label: deptData.department,
        data: labels.map((label) => {
          const found = deptData.data.find(
            (item: DataItem) => item.consent === label
          );
          return found ? found.count : 0; // Match consent category, or set count to 0
        }),
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 1,
      }));

      setChartData({
        labels: labels,
        datasets: datasets,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // Handle department selection
  const handleDepartmentChange = (
    selectedOptions: { label: string; value: string }[]
  ) => {
    // @ts-expect-error: selectedOptions is not an array of strings
    setSelectedDepartments(selectedOptions);
    if (selectedOptions.length > 0) {
      const selectedDeptValues = selectedOptions.map((option) => option.value);
      fetchChartData(selectedDeptValues);
    } else {
      setChartData(null); // Clear chart if no departments are selected
    }
  };

  return (
    <div className="main-content">
      <Typography variant="h4" className="text-orange-600">
        Comparative Consent Statistics
      </Typography>
      <Select
        isMulti
        options={departments}
        value={selectedDepartments}
        // @ts-expect-error: value is not a string
        onChange={handleDepartmentChange}
        closeMenuOnSelect={false}
        placeholder="Select departments..."
        styles={{
          control: (base) => ({ ...base, borderColor: "gray" }),
          option: (base, state) => ({
            ...base,
            color: state.isSelected ? "white" : "black",
            backgroundColor: state.isSelected ? "blue" : "white",
          }),
        }}
      />
      <div style={{ marginTop: "20px", height: "500px" }}>
        {" "}
        {/* Chart container */}
        {chartData ? (
          <Bar
            data={chartData}
            height={400} // Adjust the chart height
            options={{
              responsive: true,
              maintainAspectRatio: false, // Allows height customization
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "white", // Set legend text color to white
                  },
                },
                title: {
                  display: true,
                  text: "Comparative Placement Statistics",
                  color: "white", // Set title text color to white
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Consent Categories",
                    color: "white", // Set x-axis title color to white
                  },
                  ticks: {
                    color: "white", // Set x-axis tick labels color to white
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "Count",
                    color: "white", // Set y-axis title color to white
                  },
                  ticks: {
                    color: "white", // Set y-axis tick labels color to white
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <p>Please select departments to view data.</p>
        )}
      </div>
    </div>
  );
};
