/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import Papa from "papaparse"; // Import papaparse
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
} from "@mui/material";

const Attendance = () => {
  const [rawData, setRawData] = useState([]);
  const [consolidatedData, setConsolidatedData] = useState<any[]>([]);
  const [branchConsolidatedData, setBranchConsolidatedData] = useState<any[]>(
    []
  );
  const [sessions, setSessions] = useState(new Set());

  // Fetch attendance data from Flask API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/program_coordinator/attendance/attendance_data/"
        );
        const data = await response.json();
        setRawData(data);

        // Generate tables after fetching the data
        generateTables(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);
  const generateTables = (data: any) => {
    if (data.length === 0) {
      alert("No data available from the database.");
      return;
    }

    const newSessions = new Set();
    data.forEach((item: any) => newSessions.add(item.session));
    setSessions(newSessions);

    const consolidated = consolidateAttendanceData(data);
    setConsolidatedData(consolidated);

    const batchConsolidated = consolidateAttendanceByBatch(data);
    setBranchConsolidatedData(batchConsolidated);
  };
  //   @ts-expect-error: Unreachable code error
  const consolidateAttendanceData = (data) => {
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

  interface SessionData {
    Present: number;
    Absent: number;
    Late: number;
  }

  interface BatchData {
    batch: string;
    program_name: string;
    year: string;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalStudents?: number;
    [key: string]: SessionData | string | number | undefined;
  }

  const consolidateAttendanceByBatch = (data: any) => {
    const batchConsolidated: BatchData[] = [];

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

        if (item.present === "Present" && batch[item.session]) {
          (batch[item.session] as SessionData).Present += 1;
          batch.totalPresent = (batch.totalPresent || 0) + 1;
        } else if (item.present === "Absent" && batch[item.session]) {
          (batch[item.session] as SessionData).Absent += 1;
          batch.totalAbsent = (batch.totalAbsent || 0) + 1;
        }

        if (item.late === "Late" && batch[item.session]) {
          (batch[item.session] as SessionData).Late += 1;
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
          const sessionData = batch[session] as SessionData | undefined;
          batch.totalStudents =
            (sessionData?.Present || 0) + (sessionData?.Absent || 0);
        }
      });
    });

    return batchConsolidated;
  };

  const downloadCSV = () => {
    const csvData = [];
    const headers = [
      "Batch",
      "Program Name",
      "Year",
      ...Array.from(sessions),
      "Total Students",
      "Total Present",
      "Total Absent",
      "Total Late",
    ];
    csvData.push(headers);

    branchConsolidatedData.forEach((item) => {
      const row = [item.batch, item.program_name, item.year];

      Array.from(sessions).forEach((session) => {
        const sessionData = item[session as keyof typeof item] || {};
        row.push(
          `Present: ${sessionData.Present || 0}, Absent: ${
            sessionData.Absent || 0
          }`
        );
      });

      row.push(item.totalStudents);
      row.push(item.totalPresent);
      row.push(item.totalAbsent);
      row.push(item.totalLate);

      csvData.push(row);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "batch_wise_attendance.csv";
    link.click();
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/save-branch-attendance/batch_attendance/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchData: branchConsolidatedData }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Data saved successfully!");
      } else {
        alert("Error saving data!");
      }
    } catch (error) {
      console.error("Error saving data to database:", error);
      alert("Error saving data!");
    }
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
              {Array.from(sessions).map((session, index) => (
                <TableCell
                  key={String(session)}
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  {String(session)}
                </TableCell>
              ))}
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Total Students
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Total Present
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Total Absent
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Total Late
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branchConsolidatedData.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell>{item.batch}</TableCell>
                <TableCell>{item.program_name}</TableCell>
                <TableCell>{item.year}</TableCell>
                {Array.from(sessions).map((session) => {
                  const sessionData = (item[
                    session as keyof typeof item
                  ] as SessionData) || { Present: 0, Absent: 0, Late: 0 };
                  return (
                    <TableCell key={String(session)}>
                      {`Present: ${sessionData.Present || 0}, Absent: ${
                        sessionData.Absent || 0
                      }`}
                    </TableCell>
                  );
                })}
                <TableCell>{item.totalStudents}</TableCell>
                <TableCell>{item.totalPresent}</TableCell>
                <TableCell>{item.totalAbsent}</TableCell>
                <TableCell>{item.totalLate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button
          onClick={downloadCSV}
          variant="contained"
          color="primary"
          sx={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "orange", color: "black" },
          }}
        >
          Download CSV
        </Button>
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
    </Box>
  );
};

export default Attendance;
