/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  Paper,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import * as XLSX from "xlsx"; // For Excel
import Papa from "papaparse"; // For CSV

// Sample JSON data for development
const sampleData = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    student: "Dhruv Paste",
    company: "JP Morgan",
    attendance: true,
    aptitude: true,
    gd: true,
    case_study: true,
    hr_round: true,
  },
  {
    id: "b2c3d4e5-f6g7-8901-hijk-lm2345678901",
    student: "Ritesh Jha",
    company: "Goldman Sachs",
    attendance: true,
    aptitude: true,
    gd: true,
    case_study: true,
    hr_round: true,
  },
  // Add more sample entries as needed
];

export default function PlacementAttendance() {
  const [formData, setFormData] = useState<
    {
      id: string;
      student: string;
      company: string;
      attendance: boolean;
      aptitude: boolean;
      gd: boolean;
      case_study: boolean;
      hr_round: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // To store search query
  const [filteredData, setFilteredData] = useState<
    {
      id: string;
      student: string;
      company: string;
      attendance: boolean;
      aptitude: boolean;
      gd: boolean;
      case_study: boolean;
      hr_round: boolean;
    }[]
  >([]); // To store filtered data

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    // Simulate API fetch with sample data
    setTimeout(() => {
      try {
        setFormData(sampleData);
        setFilteredData(sampleData); // Initialize filteredData with sample data
        setLoading(false);
      } catch (err) {
        setError("Failed to load sample data");
        setLoading(false);
      }
    }, 500); // Simulate delay for better UX
  }, []);

  useEffect(() => {
    // Filter data based on search query
    if (searchQuery === "") {
      setFilteredData(formData); // If no search query, show all data
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = formData.filter(
        (item) =>
          item.student.toLowerCase().includes(lowercasedQuery) ||
          item.company.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, formData]);

  const handleToggle = (id: string, field: keyof (typeof formData)[0]) => {
    const updatedData = filteredData.map((item) =>
      item.id === id
        ? { ...item, [field]: item[field] === null ? true : !item[field] }
        : item
    );
    setFilteredData(updatedData);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getButtonColor = (status: boolean) => (status ? "success" : "error");

  const getButtonText = (status: boolean) =>
    status ? "Cleared" : "Not Cleared";

  const exportToCSV = () => {
    const csv = Papa.unparse(filteredData); // Converts data to CSV format
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "placement_attendance.csv"; // Set filename for CSV
    link.click();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData); // Converts data to Excel sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement Attendance");
    XLSX.writeFile(wb, "placement_attendance.xlsx"); // Set filename for Excel
  };

  const saveToDatabase = () => {
    fetch("http://localhost:8000/api/save/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("Data saved successfully!");
        } else if (data.error) {
          alert("Error: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        alert("Failed to save data to the database");
      });
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 400, margin: "0 auto", padding: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, margin: "0 auto", padding: 2 }}>
      <Typography variant="h5" sx={{ textAlign: "center", marginBottom: 2 }}>
        Placement Attendance Table
      </Typography>

      {/* Search Bar */}
      <Box sx={{ textAlign: "center", marginBottom: 2 }}>
        <TextField
          label="Search by Student or Company"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: "60%" }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Aptitude</TableCell>
              <TableCell>Group Discussion (GD)</TableCell>
              <TableCell>Case Study</TableCell>
              <TableCell>HR Round</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getButtonColor(row.attendance)}
                      onClick={() => handleToggle(row.id, "attendance")}
                    >
                      {getButtonText(row.attendance)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getButtonColor(row.aptitude)}
                      onClick={() => handleToggle(row.id, "aptitude")}
                    >
                      {getButtonText(row.aptitude)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getButtonColor(row.gd)}
                      onClick={() => handleToggle(row.id, "gd")}
                    >
                      {getButtonText(row.gd)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getButtonColor(row.case_study)}
                      onClick={() => handleToggle(row.id, "case_study")}
                    >
                      {getButtonText(row.case_study)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={getButtonColor(row.hr_round)}
                      onClick={() => handleToggle(row.id, "hr_round")}
                    >
                      {getButtonText(row.hr_round)}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Export and Save buttons */}
      <Box sx={{ marginTop: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginRight: 2 }}
          onClick={exportToCSV}
        >
          Export as CSV
        </Button>
        <Button variant="contained" color="secondary" onClick={exportToExcel}>
          Export as Excel
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{ marginLeft: 2 }}
          onClick={saveToDatabase}
        >
          Save to Database
        </Button>
      </Box>
    </Box>
  );
}
