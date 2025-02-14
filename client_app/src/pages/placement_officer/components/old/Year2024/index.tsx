import { Typography, Grid, Paper } from "@mui/material";

import { Bar, Pie } from "react-chartjs-2";
import { data2024 } from "./data";
function Year2024() {
  // Histogram Data for Salary Offered (Bins: 5 to 40 with step 5)
  const salaryBins = [
    "5-10",
    "10-15",
    "15-20",
    "20-25",
    "25-30",
    "30-35",
    "35-40",
  ];
  const salaryCounts = Array(salaryBins.length).fill(0); // Initialize bins with 0

  // Classify salaries into bins
  data2024.salary_offered.forEach((salary) => {
    if (salary > 5 && salary <= 10) salaryCounts[0]++;
    else if (salary > 10 && salary <= 15) salaryCounts[1]++;
    else if (salary > 15 && salary <= 20) salaryCounts[2]++;
    else if (salary > 20 && salary <= 25) salaryCounts[3]++;
    else if (salary > 25 && salary <= 30) salaryCounts[4]++;
    else if (salary > 30 && salary <= 35) salaryCounts[5]++;
    else if (salary > 35 && salary <= 40) salaryCounts[6]++;
  });

  const histogramData = {
    labels: salaryBins,
    datasets: [
      {
        label: "Salary Distribution",
        data: salaryCounts,
        backgroundColor: [
          "#42A5F5",
          "#66BB6A",
          "#FFA726",
          "#EF5350",
          "#AB47BC",
          "#8E24AA",
          "#FF7043",
        ],
      },
    ],
  };

  // Consent Status Pie Chart
  const consentData = {
    labels: ["Placement", "Higher Studies", "Entrepreneur"],
    datasets: [
      {
        label: "Consent Status",
        data: [
          data2024.consent_status.filter((status) => status === "Placement")
            .length,
          data2024.consent_status.filter(
            (status) => status === "Higher Studies"
          ).length,
          data2024.consent_status.filter((status) => status === "Entrepreneur")
            .length,
        ],
        backgroundColor: ["#42A5F5", "#66BB6A", "#EF5350"],
      },
    ],
  };

  // Categorization Pie Chart
  const categorizationData = {
    labels: ["CAT-1", "CAT-2", "CAT-3"],
    datasets: [
      {
        label: "Categorization",
        data: [
          data2024.categorization.filter((cat) => cat === "CAT-1").length,
          data2024.categorization.filter((cat) => cat === "CAT-2").length,
          data2024.categorization.filter((cat) => cat === "CAT-3").length,
        ],
        backgroundColor: ["#42A5F5", "#FFA726", "#AB47BC"],
      },
    ],
  };

  // Placement Type Pie Chart
  const placementTypeData = {
    labels: ["Normal", "PLI", "Dream", "Super Dream"],
    datasets: [
      {
        label: "Placement Type",
        data: [
          data2024.placement_type.filter((type) => type === "Normal").length,
          data2024.placement_type.filter((type) => type === "PLI").length,
          data2024.placement_type.filter((type) => type === "Dream").length,
          data2024.placement_type.filter((type) => type === "Super Dream")
            .length,
        ],
        backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726", "#EF5350"],
      },
    ],
  };

  return (
    <Grid container spacing={4}>
      {/* Consent Status Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">Consent Status</Typography>
          <Pie data={consentData} />
        </Paper>
      </Grid>

      {/* Categorization Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">Categorization</Typography>
          <Pie data={categorizationData} />
        </Paper>
      </Grid>

      {/* Placement Type Pie Chart */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">Placement Type Distribution</Typography>
          <Pie data={placementTypeData} />
        </Paper>
      </Grid>

      {/* Histogram for Salary Offered */}
      <Grid item xs={12} md={12}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6">Salary Distribution</Typography>
          <Bar data={histogramData} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Year2024;
