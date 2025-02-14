/* eslint-disable @typescript-eslint/no-explicit-any */
import { Typography, Grid, Paper } from "@mui/material";

import { Bar, Pie } from "react-chartjs-2";
import { placementData } from "./data";
export default function Year2025() {
  // Placement Status Data - Top 10 Companies
  const placementStatusCounts = placementData.placement_status.reduce(
    (acc: any, status: any) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const sortedPlacementStatus = Object.entries(placementStatusCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10);

  const placementStatusData = {
    labels: sortedPlacementStatus.map((item) => item[0]),
    datasets: [
      {
        label: "Top 10 Companies Giving Offers",
        data: sortedPlacementStatus.map((item) => item[1]),
        backgroundColor: "skyblue",
      },
    ],
  };

  // Placement Type Data
  const placementTypeCounts = placementData.placement_type.reduce(
    (acc: any, type: any) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {}
  );
  const placementTypeData = {
    labels: Object.keys(placementTypeCounts),
    datasets: [
      {
        label: "Placement Types",
        data: Object.values(placementTypeCounts),
        backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726", "#EF5350"],
      },
    ],
  };

  // Categorization Data
  const categorizationCounts = placementData.categorization.reduce(
    (acc: any, category: any) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {}
  );

  const categorizationData = {
    labels: Object.keys(categorizationCounts),
    datasets: [
      {
        label: "Category Distribution",
        data: Object.values(categorizationCounts),
        backgroundColor: "purple",
      },
    ],
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={12}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6">Top 10 Companies Giving Offers</Typography>
          <Bar data={placementStatusData} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6">Placement Types</Typography>
          <Pie data={placementTypeData} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6">Category Distribution</Typography>
          <Bar data={categorizationData} />
        </Paper>
      </Grid>
    </Grid>
  );
}
