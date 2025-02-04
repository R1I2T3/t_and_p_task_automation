import jsonData from "./data";
import { Typography, Grid, Paper } from "@mui/material";

import { Bar, Pie, Line } from "react-chartjs-2";
const Year2023 = () => {
  // Placement Consent Summary (Pie Chart)
  const consentData = {
    labels: ["Not Given", "Placement", "Higher Studies", "Entrepreneur"],
    datasets: [
      {
        label: "Placement Consent Summary",
        data: [
          jsonData.placement_consent_summary["Not Given"],
          jsonData.placement_consent_summary["Placement"],
          jsonData.placement_consent_summary["Higher Studies"],
          jsonData.placement_consent_summary["Entrepreneur"],
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // CGPI Distribution (Bar Chart)
  const cgpiBins = [0, 0, 0, 0, 0]; // Bins: 5-5.9, 6-6.9, 7-7.9, 8-8.9, 9-10
  jsonData.final_year_cgpi.forEach((value) => {
    if (value >= 5 && value < 6) cgpiBins[0]++;
    else if (value >= 6 && value < 7) cgpiBins[1]++;
    else if (value >= 7 && value < 8) cgpiBins[2]++;
    else if (value >= 8 && value < 9) cgpiBins[3]++;
    else if (value >= 9) cgpiBins[4]++;
  });

  const cgpiData = {
    labels: ["5-5.9", "6-6.9", "7-7.9", "8-8.9", "9-10"],
    datasets: [
      {
        label: "Final Year CGPI",
        data: cgpiBins,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderWidth: 1,
      },
    ],
  };

  // Percentage Distribution (Line Chart)
  const percentageBins = [0, 0, 0, 0, 0]; // Bins: <80, 80-85, 85-90, 90-95, >95
  jsonData.final_year_percentage.forEach((value) => {
    if (value < 80) percentageBins[0]++;
    else if (value >= 80 && value < 85) percentageBins[1]++;
    else if (value >= 85 && value < 90) percentageBins[2]++;
    else if (value >= 90 && value < 95) percentageBins[3]++;
    else if (value >= 95) percentageBins[4]++;
  });

  const percentageData = {
    labels: ["<80%", "80-85%", "85-90%", "90-95%", ">95%"],
    datasets: [
      {
        label: "Final Year Percentage",
        data: percentageBins,
        fill: false,
        borderColor: "rgba(54, 162, 235, 0.6)",
        tension: 0.1,
      },
    ],
  };

  // Chart Options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <Grid container spacing={4}>
      {/* Placement Consent Summary - Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">Placement Consent Summary</Typography>
          <Pie data={consentData} options={options} />
        </Paper>
      </Grid>

      {/* CGPI Distribution - Bar Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">CGPI Distribution</Typography>
          <Bar data={cgpiData} options={options} />
        </Paper>
      </Grid>

      {/* Percentage Distribution - Line Chart */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">
            Final Year Percentage Distribution
          </Typography>
          <Line data={percentageData} options={options} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Year2023;
