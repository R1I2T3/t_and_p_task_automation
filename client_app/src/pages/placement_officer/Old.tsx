import { Typography, Grid, Paper, Box } from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import { Link } from "react-router";
// import {  } from "react-chartjs-2";

const data = {
  Consent_graph: {
    Placement: 701,
    "Higher Studies": 270,
    Entrepreneur: 16,
  },
  consent_counts_by_branch: {
    "('AI&DS', 'Higher Studies')": 12,
    "('AI&DS', 'Placement')": 58,
    "('AI&ML', 'Higher Studies')": 10,
    "('AI&ML', 'Placement')": 59,
    "('CIVIL-A', 'Entrepreneur')": 1,
    "('CIVIL-A', 'Higher Studies')": 30,
    "('CIVIL-A', 'Placement')": 39,
    "('CIVIL-B', 'Entrepreneur')": 8,
    "('CIVIL-B', 'Higher Studies')": 25,
    "('CIVIL-B', 'Placement')": 34,
    "('COMP-A', 'Entrepreneur')": 1,
    "('COMP-A', 'Higher Studies')": 14,
    "('COMP-A', 'Placement')": 55,
    "('COMP-B', 'Higher Studies')": 16,
    "('COMP-B', 'Placement')": 53,
    "('COMP-C', 'Entrepreneur')": 2,
    "('COMP-C', 'Higher Studies')": 13,
    "('COMP-C', 'Placement')": 54,
    "('E&TC-A', 'Entrepreneur')": 1,
    "('E&TC-A', 'Higher Studies')": 19,
    "('E&TC-A', 'Placement')": 47,
    "('E&TC-B', 'Higher Studies')": 15,
    "('E&TC-B', 'Placement')": 53,
    "('ELEX', 'Higher Studies')": 18,
    "('ELEX', 'Placement')": 46,
    "('IOT', 'Higher Studies')": 7,
    "('IOT', 'Placement')": 26,
    "('IT-A', 'Entrepreneur')": 1,
    "('IT-A', 'Higher Studies')": 17,
    "('IT-A', 'Placement')": 51,
    "('IT-B', 'Entrepreneur')": 2,
    "('IT-B', 'Higher Studies')": 19,
    "('IT-B', 'Placement')": 49,
    "('MECH-A', 'Higher Studies')": 30,
    "('MECH-A', 'Placement')": 36,
    "('MECH-B', 'Higher Studies')": 25,
    "('MECH-B', 'Placement')": 41,
  },
  top_10_employers: {
    Capgemini: 48,
    "Accenture-ASE": 22,
    "TCS-Ninja": 15,
    Oracle: 14,
    Kalpatru: 12,
    "Sport Intractive": 12,
    "Dark Horse": 11,
    "IDFC Bank": 9,
    Quantiphi: 7,
    "Perfios ": 7,
  },
  placement_distribution_by_branch: {
    "AI&DS": 39,
    "AI&ML": 40,
    "CIVIL-A": 20,
    "CIVIL-B": 17,
    "COMP-A": 44,
    "COMP-B": 44,
    "COMP-C": 42,
    "E&TC-A": 33,
    "E&TC-B": 25,
    ELEX: 21,
    IOT: 18,
    "IT-A": 32,
    "IT-B": 37,
    "MECH-A": 19,
    "MECH-B": 26,
  },
  average_salary_by_branch: {
    "AI&DS": 4.951428571428572,
    "AI&ML": 6.1045945945945945,
    "CIVIL-A": 3.1675,
    "CIVIL-B": 3.320588235294118,
    "COMP-A": 5.983902439024391,
    "COMP-B": 7.196666666666666,
    "COMP-C": 5.53875,
    "E&TC-A": 4.971666666666667,
    "E&TC-B": 4.953636363636364,
    ELEX: 4.0375,
    IOT: 4.198823529411764,
    "IT-A": 5.429310344827586,
    "IT-B": 6.155454545454545,
    "MECH-A": 3.822222222222222,
    "MECH-B": 3.6136363636363638,
  },
};
// import React from "react";
// import { Typography, Grid, Paper, Box } from "@mui/material";
// import { Pie, Bar } from "react-chartjs-2";

const pieData1 = {
  labels: Object.keys(data.average_salary_by_branch),
  datasets: [
    {
      data: Object.values(data.average_salary_by_branch),
      backgroundColor: [
        "#64b5f6",
        "#81c784",
        "#ffb74d",
        "#ba68c8",
        "#7986cb",
        "#4db6ac",
        "#f06292",
        "#e57373",
        "#ff8a65",
        "#a1887f",
        "#9575cd",
        "#4fc3f7",
        "#aed581",
        "#ffd54f",
        "#dce775",
      ],
      borderColor: [
        "#64b5f6",
        "#81c784",
        "#ffb74d",
        "#ba68c8",
        "#7986cb",
        "#4db6ac",
        "#f06292",
        "#e57373",
        "#ff8a65",
        "#a1887f",
        "#9575cd",
        "#4fc3f7",
        "#aed581",
        "#ffd54f",
        "#dce775",
      ],
      borderWidth: 2,
    },
  ],
};

const pieData2 = {
  labels: Object.keys(data.Consent_graph),
  datasets: [
    {
      data: Object.values(data.Consent_graph),
      backgroundColor: ["#64b5f6", "#81c784", "#ffb74d"],
      borderColor: ["#64b5f6", "#81c784", "#ffb74d"],
      borderWidth: 2,
    },
  ],
};

const pieData3 = {
  labels: Object.keys(data.top_10_employers),
  datasets: [
    {
      data: Object.values(data.top_10_employers),
      backgroundColor: [
        "#7986cb",
        "#4db6ac",
        "#f06292",
        "#e57373",
        "#ff8a65",
        "#a1887f",
        "#9575cd",
        "#4fc3f7",
        "#aed581",
        "#ffd54f",
      ],
      borderColor: [
        "#7986cb",
        "#4db6ac",
        "#f06292",
        "#e57373",
        "#ff8a65",
        "#a1887f",
        "#9575cd",
        "#4fc3f7",
        "#aed581",
        "#ffd54f",
      ],
      borderWidth: 2,
    },
  ],
};

const barData = {
  labels: Object.keys(data.placement_distribution_by_branch),
  datasets: [
    {
      label: "Number of Students Placed",
      data: Object.values(data.placement_distribution_by_branch),
      backgroundColor: "#64b5f6",
      borderColor: "#64b5f6",
      borderWidth: 1,
    },
  ],
};

export default function Old() {
  return (
    <Box sx={{ padding: 3 }}>
      <Link
        to="/placement/Placement_Statistics"
        className="menu-item"
        style={{ color: "white" }}
      >
        Back to Placement Statistics
      </Link>
      <Grid container spacing={4}>
        {/* First Row - Bar Graph */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Number of Students Placed
            </Typography>
            <Bar data={barData} />
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              {`Branches and placement data: ${Object.entries(
                data.placement_distribution_by_branch
              )
                .map(([branch, count]) => `${branch}: ${count}`)
                .join(", ")}`}
            </Typography>
          </Paper>
        </Grid>

        {/* Second Row */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Average salary by branch
            </Typography>
            <Pie data={pieData1} />
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              {`Branches: ${Object.entries(data.average_salary_by_branch)
                .map(
                  ([branch, salary]) => `${branch}: ${salary.toFixed(2)} LPA`
                )
                .join(", ")}`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Student's Consent
            </Typography>
            <Pie data={pieData2} />
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              {`Consent data: ${Object.entries(data.Consent_graph)
                .map(([category, count]) => `${category}: ${count}`)
                .join(", ")}`}
            </Typography>
          </Paper>
        </Grid>

        {/* Third Row */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Companies
            </Typography>
            <Bar data={pieData3} />
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              {`Top employers: ${Object.entries(data.top_10_employers)
                .map(([company, count]) => `${company}: ${count}`)
                .join(", ")}`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
