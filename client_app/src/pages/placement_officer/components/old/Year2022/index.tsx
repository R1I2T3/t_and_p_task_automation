/* eslint-disable @typescript-eslint/no-explicit-any */
import data from "./data";
import { Typography, Grid, Paper } from "@mui/material";

import { Bar, Pie } from "react-chartjs-2";
function Year2022() {
  const averageChartData = {
    labels: ["Super Dream", "Dream Offers", "Normal Offers"],
    datasets: [
      {
        label: "Average Offers",
        data: [
          calculateAverage(data.super_dream_offers),
          calculateAverage(data.dream_offers),
          calculateAverage(data.all_salaries),
        ],
        backgroundColor: ["#3f51b5", "#f50057", "#4caf50", "#ff9800"],
        borderWidth: 1,
      },
    ],
  };

  const consentDistributionChartData = {
    labels: ["YES", "No", "Yes"],
    datasets: [
      {
        label: "Consent Distribution",
        data: [
          data.placement_consent_summary.YES,
          data.placement_consent_summary.No,
          data.placement_consent_summary.Yes,
        ],
        backgroundColor: ["#3f51b5", "#f44336", "#ffeb3b"],
        borderWidth: 1,
      },
    ],
  };

  function calculateAverage(values: (number | string)[]): number {
    const numericValues = values.map((v) =>
      typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) : v
    );
    const total = numericValues.reduce((sum, value) => sum + value, 0);
    return parseFloat((total / numericValues.length).toFixed(2));
  }

  // Helper function to generate histogram data
  const generateHistogramData = (salaries: number[], binSize: number) => {
    const bins: any[] = [];
    const maxSalary = Math.max(...salaries);
    const minSalary = Math.min(...salaries);

    for (let i = minSalary; i <= maxSalary; i += binSize) {
      bins.push(i);
    }

    const histogramData = new Array(bins.length - 1).fill(0);

    salaries.forEach((salary) => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (salary >= bins[i] && salary < bins[i + 1]) {
          histogramData[i]++;
        }
      }
    });

    return { bins: bins.slice(0, bins.length - 1), histogramData };
  };

  // Calculate histogram data for Salary Distribution
  const { bins, histogramData } = generateHistogramData(data.all_salaries, 2); // Bin size of 2

  // Chart data for Salary Distribution Histogram
  const salaryHistogramChartData = {
    labels: bins.map((bin) => `${bin} - ${bin + 2}`), // Label bins as ranges (e.g., "0 - 2")
    datasets: [
      {
        label: "Salary Distribution Histogram",
        data: histogramData,
        backgroundColor: "#ff9800",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Year 2022 Placement Data",
      },
    },
  };

  return (
    <Grid container spacing={4}>
      {/* Average Offers Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Average Offers Comparison
          </Typography>
          <Bar data={averageChartData} options={chartOptions} />
        </Paper>
      </Grid>

      {/* Normal Offers Distribution Chart */}

      {/* Consent Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Consent Distribution
          </Typography>
          <Pie data={consentDistributionChartData} options={chartOptions} />
        </Paper>
      </Grid>

      {/* Salary Distribution Histogram */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6" align="center" gutterBottom>
            Salary Distribution Histogram
          </Typography>
          <Bar data={salaryHistogramChartData} options={chartOptions} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Year2022;
