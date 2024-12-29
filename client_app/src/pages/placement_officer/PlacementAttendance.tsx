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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { ExpandIcon, MoreVerticalIcon } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

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
];

const columnOptions = [
  { field: "attendance", label: "Attendance" },
  { field: "aptitude", label: "Aptitude" },
  { field: "gd", label: "Group Discussion (GD)" },
  { field: "case_study", label: "Case Study" },
  { field: "hr_round", label: "HR Round" },
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
  const [searchQuery, setSearchQuery] = useState("");
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
  >([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, boolean>
  >(
    columnOptions.reduce(
      (acc, col) => ({ ...acc, [col.field]: true }),
      {} as Record<string, boolean>
    )
  );

  // Menu-related state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<{
    field: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        setFormData(sampleData);
        setFilteredData(sampleData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load sample data");
        setLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredData(formData);
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

  const handleColumnToggle = (field: string) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  type ColumnField =
    | "attendance"
    | "aptitude"
    | "gd"
    | "case_study"
    | "hr_round";

  const handleToggle = (id: string, field: ColumnField) => {
    setFilteredData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  const handleSelectAll = (field: ColumnField) => {
    setFilteredData((prev) =>
      prev.map((item) => ({
        ...item,
        [field]: true,
      }))
    );
    handleCloseMenu();
  };

  const handleUnselectAll = (field: ColumnField) => {
    setFilteredData((prev) =>
      prev.map((item) => ({
        ...item,
        [field]: false,
      }))
    );
    handleCloseMenu();
  };

  const handleClickMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    column: { field: string; label: string }
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedColumn(column);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedColumn(null);
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

  const exportToCSV = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-"); // Format: dd-mm-yyyy
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `placement_attendance_${formattedDate}.csv`; // Use formatted date in file name
    link.click();
  };

  const exportToExcel = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB").replace(/\//g, "-"); // Format: dd-mm-yyyy
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement Attendance");
    XLSX.writeFile(wb, `placement_attendance_${formattedDate}.xlsx`); // Use formatted date in file name
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
      <Accordion sx={{ marginBottom: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandIcon />}
          aria-controls="column-selection-content"
          id="column-selection-header"
        >
          <Typography>Select Columns to Display</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup row>
            {columnOptions.map((column) => (
              <FormControlLabel
                key={column.field}
                control={
                  <Checkbox
                    checked={selectedColumns[column.field]}
                    onChange={() => handleColumnToggle(column.field)}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

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
              {columnOptions.map(
                (column) =>
                  selectedColumns[column.field] && (
                    <TableCell key={column.field}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {column.label}
                        <IconButton
                          size="small"
                          onClick={(e) => handleClickMenu(e, column)}
                          sx={{ marginLeft: 1 }}
                        >
                          <MoreVerticalIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )
              )}
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
                  {columnOptions.map(
                    (column) =>
                      selectedColumns[column.field] && (
                        <TableCell key={column.field}>
                          <Checkbox
                            checked={row[column.field as ColumnField]}
                            onChange={() =>
                              handleToggle(row.id, column.field as ColumnField)
                            }
                          />
                        </TableCell>
                      )
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dropdown Menu for Select All / Unselect All */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() =>
            handleSelectAll(
              (selectedColumn?.field as ColumnField) ??
                ("attendance" as ColumnField)
            )
          }
        >
          Select All
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedColumn &&
            handleUnselectAll(selectedColumn.field as ColumnField)
          }
        >
          Unselect All
        </MenuItem>
      </Menu>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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
