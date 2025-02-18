/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import * as XLSX from "xlsx"; // Import xlsx
import { getCookie } from "@/utils";
const Attendance = () => {
  interface ConsolidatedStudent {
    program_name: string;
    name: string;
    batch: string;
    year: string;
    uid: string;
    totalPresent?: number;
    totalAbsent?: number;
    totalLate?: number;
    [key: string]: any;
  }

  const [_rawData, setRawData] = useState<AttendanceData[]>([]);
  const [_consolidatedData, setConsolidatedData] = useState<
    ConsolidatedStudent[]
  >([]);
  const [branchConsolidatedData, setBranchConsolidatedData] = useState<any[]>(
    []
  );
  const [sessions, setSessions] = useState(new Set());
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [sessionDates, setSessionDates] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/program_coordinator/attendance/attendance_data/"
        );
        const data = await response.json();
        setRawData(data);

        // Get unique programs and years
        const uniquePrograms = Array.from(
          new Set(data.map((item: any) => item.program_name))
        ) as string[];
        const uniqueYears = Array.from(
          new Set(data.map((item: any) => item.year))
        ) as string[];

        setPrograms(uniquePrograms);
        setYears(uniqueYears);

        generateTables(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  interface AttendanceData {
    session: string;
    uid: string;
    name: string;
    program_name: string;
    batch: string;
    year: string;
    present: string;
    late: string;
  }

  const generateTables = (data: AttendanceData[]) => {
    if (data.length === 0) {
      alert("No data available from the database.");
      return;
    }

    const newSessions = new Set();
    data.forEach((item) => newSessions.add(item.session));
    setSessions(newSessions);

    const consolidated = consolidateAttendanceData(data);
    setConsolidatedData(consolidated);

    const batchConsolidated = consolidateAttendanceByBatch(data);
    setBranchConsolidatedData(batchConsolidated);
  };

  // const handleProgramChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   const programName = event.target.value as string;
  //   setSelectedProgram(programName);
  //   filterDataByProgram(programName);
  //   setSessionDates(getSessionDatesForProgram(programName));
  // };
  const handleYearChange = (event: any) => {
    const year = event.target.value;
    setSelectedYear(year);
    filterData(selectedProgram, year);
  };

  const handleProgramChange = (event: any) => {
    const programName = event.target.value;
    setSelectedProgram(programName);
    filterData(programName, selectedYear);
  };

  // const filterDataByProgram = (programName: string) => {
  //   const filteredData = _rawData.filter(
  //     (item) => item.program_name === programName
  //   );
  //   generateTables(filteredData);
  // };

  // const getSessionDatesForProgram = (programName: string) => {
  //   const sessionsForProgram = Array.from(
  //     new Set(
  //       _rawData
  //         .filter((item) => item.program_name === programName)
  //         .map((item) => item.session)
  //     )
  //   );
  //   return sessionsForProgram;
  // };
  const filterData = (programName: string, year: string) => {
    let filteredData = _rawData;

    if (programName) {
      filteredData = filteredData.filter(
        (item) => item.program_name === programName
      );
    }

    if (year) {
      filteredData = filteredData.filter((item) => item.year === year);
    }

    generateTables(filteredData);
    setSessionDates(
      Array.from(new Set(filteredData.map((item) => item.session)))
    );
  };

  const consolidateAttendanceData = (data: any) => {
    const consolidated: any[] = [];
    data.forEach((item: any) => {
      const student = consolidated.find(
        (s) => s.uid === item.uid && s.program_name === item.program_name
      );

      if (student) {
        student[item.session] = item.present;
        if (item.present === "Present") {
          student.totalPresent = (student.totalPresent || 0) + 1;
        } else if (item.present === "Absent") {
          student.totalAbsent = (student.totalAbsent || 0) + 1;
        } else if (item.late === "Late") {
          student.totalLate = (student.totalLate || 0) + 1;
        }
      } else {
        const newStudent = {
          program_name: item.program_name,
          name: item.name,
          batch: item.batch,
          year: item.year,
          uid: item.uid,
          [item.session]: item.present,
          totalPresent: item.present === "Present" ? 1 : 0,
          totalAbsent: item.present === "Absent" ? 1 : 0,
          totalLate: item.late === "Late" ? 1 : 0,
        };
        consolidated.push(newStudent);
      }
    });
    return consolidated;
  };

  const consolidateAttendanceByBatch = (data: any) => {
    const batchConsolidated: any[] = [];

    data.forEach((item: any) => {
      const batch = batchConsolidated.find(
        (b) =>
          b.batch === item.batch &&
          b.program_name === item.program_name &&
          b.year === item.year
      );

      if (batch) {
        batch[item.session] = batch[item.session] || {
          Present: 0,
          Absent: 0,
          Late: 0,
        };

        if (item.present === "Present") {
          batch[item.session].Present += 1;
          batch.totalPresent = (batch.totalPresent || 0) + 1;
        } else if (item.present === "Absent") {
          batch[item.session].Absent += 1;
          batch.totalAbsent = (batch.totalAbsent || 0) + 1;
        }

        if (item.late === "Late") {
          batch[item.session].Late += 1;
          batch.totalLate = (batch.totalLate || 0) + 1;
        }
      } else {
        const newBatch = {
          batch: item.batch,
          program_name: item.program_name,
          year: item.year,
          [item.session]: {
            Present: item.present === "Present" ? 1 : 0,
            Absent: item.present === "Absent" ? 1 : 0,
            Late: item.late === "Late" ? 1 : 0,
          },
          totalPresent: item.present === "Present" ? 1 : 0,
          totalAbsent: item.present === "Absent" ? 1 : 0,
          totalLate: item.late === "Late" ? 1 : 0,
        };
        batchConsolidated.push(newBatch);
      }
    });

    batchConsolidated.forEach((batch) => {
      Object.keys(batch).forEach((session) => {
        if (
          session !== "batch" &&
          session !== "program_name" &&
          session !== "year" &&
          session !== "totalPresent" &&
          session !== "totalAbsent" &&
          session !== "totalLate"
        ) {
          batch.totalStudents =
            (batch[session].Present || 0) + (batch[session].Absent || 0);
        }
      });
    });

    return batchConsolidated;
  };

  const saveToDatabase = async () => {
    try {
      const sessionWiseData = branchConsolidatedData.flatMap((item) =>
        Array.from(sessions).map((session) => {
          // @ts-expect-error : TS doesn't recognize dynamic keys
          const sessionData = item[session] || {};

          return {
            batch: item.batch,
            program_name: item.program_name,
            year: item.year,
            session: session,
            totalPresent: sessionData.Present || 0,
            totalAbsent: sessionData.Absent || 0,
            totalLate: sessionData.Late || 0,
            totalStudents:
              (sessionData.Present || 0) + (sessionData.Absent || 0),
          };
        })
      );

      const response = await fetch(
        "/api/program_coordinator/save-branch-attendance/batch_attendance/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          body: JSON.stringify({ branchData: sessionWiseData }),
        }
      );

      if (!response.ok) {
        console.error("Response not OK:", response.status, response.statusText);
        alert(`Error saving data! Status: ${response.status}`);
        return;
      }

      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (result.success) {
          alert("Data saved successfully!");
        } else {
          alert("Error saving data!");
        }
      } catch (error) {
        console.error("Error parsing JSON response:", error, text);
        alert("Error saving data: Invalid server response.");
      }
    } catch (error) {
      console.error("Error saving data to database:", error);
      alert("Error saving data!");
    }
  };

  // Download Excel file
  const downloadExcel = () => {
    if (branchConsolidatedData.length === 0) {
      alert("No data available to download.");
      return;
    }

    // Extract session dates dynamically
    const allSessions = Array.from(sessions).sort(); // Ensure consistent ordering

    // Create dynamic headers for each session with separate Present and Absent columns
    // const sessionHeaders = allSessions.flatMap((session) => [
    //   `${session} - Present`,
    //   `${session} - Absent`,
    // ]);

    // const headers = [
    //   "Batch",
    //   "Program Name",
    //   "Year",
    //   ...sessionHeaders,
    //   "Total Students",
    //   "Total Present",
    //   "Total Absent",
    //   "Total Late",
    // ];

    // Format data to match table structure
    const excelData = branchConsolidatedData.map((item) => {
      const rowData: any = {
        Batch: item.batch,
        "Program Name": item.program_name,
        Year: item.year,
        "Total Students": item.totalStudents,
        // "Total Present": item.totalPresent,
        // "Total Absent": item.totalAbsent,
        // "Total Late": item.totalLate
      };

      allSessions.forEach((session) => {
        // @ts-expect-error : TS doesn't recognize dynamic keys
        const sessionData = item[session] || { Present: 0, Absent: 0 };
        rowData[`${session} - Present`] = sessionData.Present || 0;
        rowData[`${session} - Absent`] = sessionData.Absent || 0;
      });

      return rowData;
    });

    // Convert to worksheet and save file
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_data.xlsx");
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: "20px",
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: "bold", color: "black" }}
      >
        Attendance Table Generator
      </Typography>

      {/* Dropdown for Program Name */}
      <FormControl sx={{ mb: 3, width: 200 }}>
        <InputLabel>Program Name</InputLabel>
        <Select
          value={selectedProgram}
          onChange={handleProgramChange}
          label="Program Name"
        >
          {programs.map((program) => (
            <MenuItem key={program} value={program}>
              {program}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ width: 200 }}>
        <InputLabel>Year</InputLabel>
        <Select value={selectedYear} onChange={handleYearChange} label="Year">
          <MenuItem value="">All Years</MenuItem>
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Table for Batch-wise Attendance */}
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "90%",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "orange" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Batch
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Program Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Year
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Total Students
              </TableCell>
              {sessionDates.map((session) => (
                <TableCell
                  key={session}
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  {session}
                </TableCell>
              ))}

              {/* <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Present</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Absent</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Late</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {branchConsolidatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.batch}</TableCell>
                <TableCell>{item.program_name}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell>{item.totalStudents}</TableCell>
                {sessionDates.map((session) => {
                  const sessionData = item[session] || {};
                  return (
                    <TableCell key={session}>
                      {`Present: ${sessionData.Present || 0}, Absent: ${
                        sessionData.Absent || 0
                      }`}
                    </TableCell>
                  );
                })}

                {/* <TableCell>{item.totalPresent}</TableCell>
                <TableCell>{item.totalAbsent}</TableCell>
                <TableCell>{item.totalLate}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save to Database Button */}
      <Box sx={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
        <Button
          onClick={saveToDatabase}
          variant="contained"
          color="success"
          sx={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "orange", color: "black" },
          }}
        >
          Save to Database
        </Button>
      </Box>

      {/* Download Excel Button */}
      <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}>
        <Button
          onClick={downloadExcel}
          variant="contained"
          color="primary"
          sx={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "orange", color: "black" },
          }}
        >
          Download Excel
        </Button>
      </Box>
    </Box>
  );
};

export default Attendance;
