/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement, // Added for Line chart
  LineElement, // Added for Line chart
} from "chart.js";

import { Link } from "react-router";
import Year2022 from "./components/old/Year2022";
import Year2023 from "./components/old/Year2023";
import Year2024 from "./components/old/Year2024";
import Year2025 from "./components/old/Year2025";
// Register all required ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement, // Registered for Line chart
  LineElement // Registered for Line chart
);

export default function Old() {
  const [selectedYear, setSelectedYear] = useState("2025");

  const handleYearChange = (event: any) => {
    setSelectedYear(event.target.value as string);
  };

  const renderYearComponent = () => {
    switch (selectedYear) {
      case "2022":
        return <Year2022 />;
      case "2023":
        return <Year2023 />;
      case "2024":
        return <Year2024 />;
      case "2025":
        return <Year2025 />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Typography variant="h5">
        Placement Statistics of {selectedYear}
      </Typography>
      <Box sx={{ padding: 3 }}>
        <Link
          to="/placement/Placement_Statistics"
          className="menu-item"
          style={{ color: "white" }}
        >
          Back to Placement Statistics
        </Link>

        <FormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel id="year-select-label">Select Year</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear}
            onChange={handleYearChange}
            label="Select Year"
          >
            <MenuItem value="2022">2022</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
          </Select>
        </FormControl>

        {renderYearComponent()}
      </Box>
    </div>
  );
}

// Year 2022 Component with inline data
