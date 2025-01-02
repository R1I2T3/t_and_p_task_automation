/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Grid,
} from "@mui/material";
import { ExpandIcon, MoreVerticalIcon } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { getCookie } from "@/utils";
import axios from "axios";
import { Button as ShadCnButton } from "@/components/ui/button";
const columnOptions = [
  { field: "attendance", label: "Attendance" },
  { field: "aptitude", label: "Aptitude" },
  { field: "gd", label: "Group Discussion (GD)" },
  { field: "case_study", label: "Case Study" },
  { field: "hr_round", label: "HR Round" },
];

export default function PlacementAttendance() {
  const [formData, _setFormData] = useState<
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
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, _setSearchQuery] = useState("");
  interface CompanyDataType {
    id: string;
    name: string;
    batch: string;
  }
  const [companyData, setCompanyData] = useState<CompanyDataType[]>([]);
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
  const csrftoken = getCookie("csrftoken");
  useEffect(() => {
    axios
      .get("/api/placement/company/all", {
        headers: {
          "X-CSRFToken": csrftoken || "",
        },
        withCredentials: true, // Ensure cookies are included in the request
      })
      .then((response) => {
        const formattedCompanies = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          batch: item.batch,
        }));
        setCompanyData(formattedCompanies);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch data");
      })
      .finally(() => {
        setLoading(false);
      });
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
    _event: React.MouseEvent<HTMLButtonElement> | null,
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
    console.log(filteredData);
    fetch("http://localhost:8000/api/placement/attendance/save/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken || "",
      },
      body: JSON.stringify(filteredData),
      credentials: "include",
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
  const fetchApplicants = async () => {
    try {
      const response = await fetch(
        `/api/placement/job_application/company/get/${company}`
      );
      const data = await response.json();
      setFilteredData(data.students);
    } catch (error) {
      console.error(error);
    }
  };
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

      <Grid item xs={12}>
        <TextField
          select
          label="Select Company"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          fullWidth
        >
          {companyData?.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}-{company.batch}
            </MenuItem>
          ))}
        </TextField>
        <ShadCnButton
          className="mx-auto my-3 bg-orange-500"
          onClick={() => fetchApplicants()}
        >
          Fetch Candidates
        </ShadCnButton>
      </Grid>

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
