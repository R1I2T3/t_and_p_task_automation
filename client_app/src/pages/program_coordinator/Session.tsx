/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAtomValue } from "jotai";
import { authAtom } from "@/authAtom";
import { getCookie } from "@/utils";

interface FormData {
  programName: string;
  year: string;
  numSessions: number;
  numDays: number;
  dates: Array<{ day: string; date: string }>;
  tableData: Array<{
    fileData: any[];
    batch: string;
    sessions: Array<string[]>;
  }>;
  fileHeaders: string[];
  semester: string;
}

function Session() {
  const auth = useAtomValue(authAtom);
  const [formData, setFormData] = useState<FormData>({
    programName: auth?.program ?? "",
    year: "fe",
    numSessions: 1,
    numDays: 1,
    dates: [],
    tableData: [],
    fileHeaders: [],
    semester: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const SEM_OPTIONS = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];
  useEffect(() => {
    if (auth?.role === "faculty" && auth.program) {
      setFormData((prevData) => ({
        ...prevData,
        programName: auth?.program || "ACT_TECHNICAL",
      }));
    }
  }, [auth]);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target && e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (fileExtension === "csv") {
          const csvData = (event.target as FileReader).result;
          parseCSV(csvData);
        } else if (["xlsx", "xls"].includes(fileExtension)) {
          const binaryStr = (event.target as FileReader).result;
          if (binaryStr instanceof ArrayBuffer) {
            parseExcel(binaryStr);
          } else {
            throw new Error("Failed to read Excel file.");
          }
        } else {
          throw new Error(
            "Invalid file type. Please upload a CSV or Excel file."
          );
        }
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    };

    if (["xlsx", "xls"].includes(fileExtension)) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvData: any) => {
    const rows = csvData
      .split("\n")
      .map((row: any) => row.split(",").map((cell: string) => cell.trim()));
    const cleanedRows = rows.filter((row: string[]) => row.length > 0);

    if (cleanedRows.length === 0) {
      setErrorMessage("The uploaded CSV file is empty.");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      fileHeaders: cleanedRows[0],
      tableData: cleanedRows.slice(1).map((row: string[]) => ({
        fileData: row,
        batch: row[2],
        sessions: [],
      })),
    }));
  };

  const parseExcel = (binaryStr: ArrayBuffer) => {
    const workbook = XLSX.read(binaryStr, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    });

    if (sheetData.length === 0) {
      setErrorMessage("The uploaded Excel file is empty.");
      return;
    }

    setFormData((prevData: any) => ({
      ...prevData,
      fileHeaders: sheetData[0],
      tableData: sheetData.slice(1).map((row) => ({
        fileData: row,
        batch: row[2],
        sessions: [],
      })),
    }));
  };

  const generateDateInputs = () => {
    if (formData.numDays <= 0 || formData.numSessions <= 0) {
      setErrorMessage("Please enter valid numbers for days and sessions.");
      return;
    }
    const dateFields = Array.from({ length: formData.numDays }, (_, i) => ({
      day: `Day ${i + 1}`,
      date: "",
    }));
    setFormData((prevData) => ({ ...prevData, dates: dateFields }));
  };

  const handleDateChange = (index: number, value: string) => {
    const updatedDates = [...formData.dates];
    updatedDates[index].date = value;
    setFormData((prevData) => ({ ...prevData, dates: updatedDates }));
  };

  const generateTable = () => {
    if (formData.tableData.length === 0) {
      setErrorMessage("Please upload a file first.");
      return;
    }

    const updatedTableData = formData.tableData.map((row) => ({
      ...row,
      sessions: formData.dates.map(() =>
        Array.from({ length: formData.numSessions }, () => "")
      ),
    }));

    setFormData((prevData) => ({ ...prevData, tableData: updatedTableData }));
  };

  const handleAttendanceChange = (
    rowIndex: number,
    dayIndex: number,
    sessionIndex: number,
    value: string
  ) => {
    const updatedTableData = [...formData.tableData];
    updatedTableData[rowIndex].sessions[dayIndex][sessionIndex] = value;
    setFormData((prevData) => ({ ...prevData, tableData: updatedTableData }));
  };
  const csrfToken = getCookie("csrftoken");
  const sendDataToApi = async () => {
    const {
      programName,
      year,
      numSessions,
      numDays,
      dates,
      fileHeaders,
      tableData,
      semester,
    } = formData;

    if (
      !programName ||
      !year ||
      numSessions <= 0 ||
      numDays <= 0 ||
      tableData.length === 0
    ) {
      setErrorMessage(
        "Please fill in all required fields and upload a valid file."
      );
      return;
    }

    if (dates.some((date) => !date.date)) {
      setErrorMessage("Please enter dates for all days.");
      return;
    }

    const requestData = {
      program_name: programName,
      year: year,
      num_sessions: numSessions,
      num_days: numDays,
      dates: dates.map((date) => date.date),
      semester: semester,
      file_headers: fileHeaders,
      attendance_data: tableData.map((row) => ({
        student_data: [
          row.fileData[0], // UID
          row.fileData[1], // Name
          row.batch, // Batch
        ],
        sessions: row.sessions,
      })),
    };

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/program_coordinator/create-attendance-record/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
          credentials: "include",
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      alert("Data successfully sent to API!");
      console.log(data);
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMessage(`Failed to send data to API. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "white", borderRadius: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Generate Session Table
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Upload File
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
          />
        </Button>
        <br />
        <br />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Choose a Year</InputLabel>
          <br />
          <Select
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          >
            <MenuItem value="fe">First Year</MenuItem>
            <MenuItem value="se">Second Year</MenuItem>
            <MenuItem value="te">Third Year</MenuItem>
            <MenuItem value="be">Final Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <br />
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Choose a Semester</InputLabel>
          <br />
          <Select
            value={formData.semester}
            onChange={(e) =>
              setFormData({ ...formData, semester: e.target.value })
            }
          >
            {SEM_OPTIONS.map((sem) => (
              <MenuItem value={sem}>{sem}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <br />
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Number of Days"
          type="number"
          value={formData.numDays}
          onChange={(e) =>
            setFormData({ ...formData, numDays: parseInt(e.target.value) })
          }
          fullWidth
        />
        <TextField
          label="Number of Sessions"
          type="number"
          value={formData.numSessions}
          onChange={(e) =>
            setFormData({ ...formData, numSessions: parseInt(e.target.value) })
          }
          fullWidth
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={generateDateInputs}>
          Generate Date Inputs
        </Button>
      </Box>

      {formData.dates.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {formData.dates.map((date, index) => (
            <Box
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
              key={index}
            >
              <Typography sx={{ mr: 2 }}>{date.day}:</Typography>
              <TextField
                type="date"
                value={date.date}
                onChange={(e) => handleDateChange(index, e.target.value)}
              />
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={generateTable}>
          Generate Table
        </Button>
      </Box>

      <SessionTable
        formData={formData}
        handleAttendanceChange={handleAttendanceChange}
      />

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={sendDataToApi}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Send to API"}
        </Button>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
}

const SessionTable = ({
  formData,
  handleAttendanceChange,
}: {
  formData: FormData;
  handleAttendanceChange: any;
}) => {
  const [page, setPage] = useState(0);
  if (formData.tableData.length === 0) return null;
  const headers = ["Program", "Name", "Year", "UID", "Batch"];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sessionHeaders = formData.dates.flatMap((date, dayIndex) =>
    Array.from(
      { length: formData.numSessions },
      (_, sessionIndex) => `${date.date} - Session ${sessionIndex + 1}`
    )
  );
  console.log(formData.programName);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            {headers.concat(sessionHeaders).map((header, index) => (
              <TableCell key={index}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.tableData
            .slice(page * 20, page * 20 + 20)
            .map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{formData.programName}</TableCell>
                <TableCell>{row.fileData[1]}</TableCell>
                <TableCell>{formData.year}</TableCell>
                <TableCell>{row.fileData[0]}</TableCell>
                <TableCell>{row.batch}</TableCell>
                {row.sessions.map((sessionsForDay, dayIndex) =>
                  sessionsForDay.map((session, sessionIndex) => (
                    <TableCell key={`${dayIndex}-${sessionIndex}`}>
                      <TextField
                        value={session}
                        onChange={(e) =>
                          handleAttendanceChange(
                            rowIndex + page * 20,
                            dayIndex,
                            sessionIndex,
                            e.target.value
                          )
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  ))
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          disabled={page === 0}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <Typography sx={{ mx: 2, lineHeight: "32px" }}>
          Page {page + 1} of {Math.ceil(formData.tableData.length / 20)}
        </Typography>
        <Button
          disabled={page >= Math.ceil(formData.tableData.length / 20) - 1}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </Box>
    </>
  );
};
export default Session;
