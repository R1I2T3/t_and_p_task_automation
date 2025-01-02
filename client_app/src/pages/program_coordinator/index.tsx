/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
const ProgramHome = () => {
  interface AverageData {
    Branch_Div: string;
    Year: number;
    avg_attendance: number;
    avg_performance: number;
    [key: string]: string | number; // Add index signature
  }

  const [avgData, setAvgData] = useState<AverageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchDiv, setBranchDiv] = useState<string[]>([]); // Holds selected branch/division
  const [year, setYear] = useState<number[]>([]); // Holds selected years
  const [uniqueYears, setUniqueYears] = useState<number[]>([]); // Holds unique years
  const [uniqueBranchDiv, setUniqueBranchDiv] = useState<string[]>([]); // Holds unique branch/division
  const [filterType, setFilterType] = useState(["avg_attendance"]); // Default to average attendance
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Average Attendance and Performance by Branch Division",
        color: "#fff", // Title color to make it stand out
        font: { size: 20 },
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" }, // White ticks for contrast
        grid: { color: "rgba(255, 255, 255, 0.3)" }, // Light grid color
        title: {
          display: true,
          text: "Branch",
          color: "white",
          font: { size: 16 },
        },
      },
      y: {
        ticks: { color: "#fff" }, // White ticks for contrast
        grid: { color: "rgba(255, 255, 255, 0.3)" }, // Light grid color
        title: {
          display: true,
          text: "Percentage",
          color: "white",
          font: { size: 16 },
        },
      },
    },
  };
  useEffect(() => {
    fetch("/api/program_coordinator/average-data/program1/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAvgData(data);
        const uniqueYears = [
          ...new Set(data.map((item: any) => Number(item.Year))),
        ];
        // @ts-expect-error Property 'setUniqueYears' does not exist on type 'SetStateAction<any[]>'.
        setUniqueYears(uniqueYears);

        const uniqueBranchDiv = [
          ...new Set(
            data.map((item: { Branch_Div: string }) => item.Branch_Div)
          ),
        ];
        // @ts-expect-error Property 'setUniqueYears' does not exist on type 'SetStateAction<any[]>'.
        setUniqueBranchDiv(uniqueBranchDiv);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleBranchDivChange = (event: any) => {
    setBranchDiv(event.target.value);
  };

  const handleYearChange = (event: any) => {
    setYear(event.target.value);
  };

  const handleFilterTypeChange = (event: any) => {
    setFilterType(event.target.value);
  };
  const getDropdownLabel = (type: any) => {
    if (type === "Branch Division") {
      return branchDiv.length === 0 ||
        branchDiv.length === uniqueBranchDiv.length
        ? "All Branch Divisions"
        : branchDiv.join(", ");
    } else if (type === "Year") {
      return year.length === 0 || year.length === uniqueYears.length
        ? "All Years"
        : year.join(", ");
    }
  };
  const filteredData = avgData.filter(
    (item) =>
      (branchDiv.length === 0 || branchDiv.includes(item.Branch_Div)) &&
      (year.length === 0 || year.includes(item.Year))
  );
  const chartData = {
    labels: filteredData.map((item) => `${item.Branch_Div} (${item.Year})`),
    datasets: filterType.map((type) => ({
      label:
        type === "avg_attendance"
          ? "Average Attendance (%)"
          : "Average Training Performance",
      data: filteredData.map((item) => item[type]),
      backgroundColor:
        type === "avg_attendance"
          ? "rgba(255, 99, 132, 1)" // Apply the desired color for average attendance
          : "rgba(75, 192, 192, 1)", // Apply the color for average training performance
      borderColor:
        type === "avg_attendance"
          ? "rgba(255, 99, 132, 1)" // Border color same as background for avg_attendance
          : "rgba(75, 192, 192, 1)", // Border color for average training performance
      borderWidth: 2,
    })),
  };
  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "white",
        color: "black",
        borderRadius: "20px",
        paddingBottom: "20px",
        height: "auto", // Adjust height
      }}
    >
      <Container maxWidth="lg">
        <br />
        <Typography variant="h5" color="textSecondary" align="center" paragraph>
          Average Attendance and Performance by Branch Division
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          paragraph
        >
          This graph shows both the average attendance and performance of each
          branch division.
        </Typography>

        {/* Dropdowns for Filtering */}
        <Box sx={{ marginBottom: "2rem", textAlign: "center" }}>
          <FormControl sx={{ marginRight: "2rem", minWidth: 200 }}>
            <InputLabel>Branch Division</InputLabel>
            <Select
              value={branchDiv}
              onChange={handleBranchDivChange}
              label="Branch Division"
              multiple
              sx={{
                bgcolor: "white",
                "& .MuiSelect-select": { padding: "10px 14px" },
                "& .MuiInputBase-root": { borderRadius: "20px" },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueBranchDiv.map((branch, index) => (
                <MenuItem key={index} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ marginRight: "2rem", minWidth: 200 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              onChange={handleYearChange}
              label="Year"
              multiple
              sx={{
                bgcolor: "white",
                "& .MuiSelect-select": { padding: "10px 14px" },
                "& .MuiInputBase-root": { borderRadius: "20px" },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueYears.map((uniqueYear, index) => (
                <MenuItem key={index} value={uniqueYear}>
                  {uniqueYear}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              onChange={handleFilterTypeChange}
              label="Filter Type"
              multiple
              sx={{
                bgcolor: "white",
                "& .MuiSelect-select": { padding: "10px 14px" },
                "& .MuiInputBase-root": { borderRadius: "10px" },
              }}
            >
              <MenuItem value="avg_attendance">Average Attendance</MenuItem>
              <MenuItem value="avg_performance">Average Performance</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Typography variant="h6" color="textSecondary" align="center">
            Loading data...
          </Typography>
        ) : error ? (
          <Typography variant="h6" color="error" align="center">
            Error: {error}
          </Typography>
        ) : filteredData.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Paper
                sx={{
                  padding: "1.5rem",
                  bgcolor: "#212121",
                  boxShadow: 4,
                }}
              >
                <Typography
                  variant="h6"
                  color="white"
                  align="center"
                  gutterBottom
                >
                  {getDropdownLabel("Branch Division")}
                </Typography>
                <Bar data={chartData} options={chartOptions} />
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h6" color="textSecondary" align="center">
            No data available to display.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default ProgramHome;
