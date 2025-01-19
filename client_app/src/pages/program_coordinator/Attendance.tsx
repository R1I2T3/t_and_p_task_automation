/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Papa from "papaparse";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getCookie } from "@/utils";

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

interface ProgramSessions {
  [key: string]: Set<string>;
}

const Attendance = () => {
  const [_rawData, setRawData] = useState<AttendanceData[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<
    ConsolidatedStudent[]
  >([]);
  const [branchConsolidatedData, setBranchConsolidatedData] = useState<any[]>(
    []
  );
  const [programSessions, setProgramSessions] = useState<ProgramSessions>({});
  const [programNames, setProgramNames] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [filteredConsolidatedData, setFilteredConsolidatedData] = useState<
    ConsolidatedStudent[]
  >([]);
  const [filteredBranchData, setFilteredBranchData] = useState<any[]>([]);
  const [currentSessions, setCurrentSessions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/program_coordinator/attendance/attendance_data/"
        );
        const data = await response.json();
        setRawData(data);

        // Generate tables and extract program names
        const sessions = groupSessionsByProgram(data);
        setProgramSessions(sessions);
        const uniquePrograms = [
          ...new Set(data.map((item: AttendanceData) => item.program_name)),
        ] as string[];
        setProgramNames(uniquePrograms);

        generateTables(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProgram === "all") {
      setFilteredConsolidatedData(consolidatedData);
      setFilteredBranchData(branchConsolidatedData);
      // Combine all sessions when "All Programs" is selected
      const allSessions = new Set<string>();
      Object.values(programSessions).forEach((sessions) => {
        sessions.forEach((session) => allSessions.add(session));
      });
      setCurrentSessions(allSessions);
    } else {
      setFilteredConsolidatedData(
        consolidatedData.filter((item) => item.program_name === selectedProgram)
      );
      setFilteredBranchData(
        branchConsolidatedData.filter(
          (item) => item.program_name === selectedProgram
        )
      );
      // Set program-specific sessions
      setCurrentSessions(programSessions[selectedProgram] || new Set());
    }
  }, [
    selectedProgram,
    consolidatedData,
    branchConsolidatedData,
    programSessions,
  ]);

  const groupSessionsByProgram = (data: AttendanceData[]): ProgramSessions => {
    const sessions: ProgramSessions = {};
    data.forEach((item) => {
      if (!sessions[item.program_name]) {
        sessions[item.program_name] = new Set();
      }
      sessions[item.program_name].add(item.session);
    });
    return sessions;
  };

  const generateTables = (data: AttendanceData[]) => {
    if (data.length === 0) {
      alert("No data available from the database.");
      return;
    }

    const sessions = groupSessionsByProgram(data);
    setProgramSessions(sessions);

    const consolidated = consolidateAttendanceData(data);
    setConsolidatedData(consolidated);

    const batchConsolidated = consolidateAttendanceByBatch(data);
    setBranchConsolidatedData(batchConsolidated);
  };

  const consolidateAttendanceData = (data: AttendanceData[]) => {
    const consolidated: any[] = [];
    data.forEach((item) => {
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

  const consolidateAttendanceByBatch = (data: AttendanceData[]) => {
    const batchConsolidated: any[] = [];

    data.forEach((item) => {
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

  const downloadCSV = () => {
    const csvData = [];
    const headers = [
      "Batch",
      "Program Name",
      "Year",
      ...Array.from(currentSessions),
      "Total Students",
      "Total Present",
      "Total Absent",
      "Total Late",
    ];
    csvData.push(headers);

    filteredBranchData.forEach((item) => {
      const row = [item.batch, item.program_name, item.year];

      Array.from(currentSessions).forEach((session: any) => {
        const sessionData = item[session] || {};
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

  const downloadIndividualCSV = () => {
    const csvData = [];
    const headers = [
      "UID",
      "Name",
      "Program Name",
      "Batch",
      "Year",
      "Total Present",
      "Total Absent",
      "Total Late",
      "% Attendance",
    ];
    csvData.push(headers);

    filteredConsolidatedData.forEach((item) => {
      const totalSessions = (item.totalPresent || 0) + (item.totalAbsent || 0);
      const attendancePercentage =
        totalSessions > 0
          ? ((item.totalPresent || 0) / totalSessions) * 100
          : 0;

      const row = [
        item.uid,
        item.name,
        item.program_name,
        item.batch,
        item.year,
        item.totalPresent,
        item.totalAbsent,
        item.totalLate,
        attendancePercentage.toFixed(2),
      ];

      csvData.push(row);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "individual_attendance_details.csv";
    link.click();
  };

  const saveToDatabase = async () => {
    try {
      const sessionWiseData = filteredBranchData.flatMap((item) =>
        Array.from(currentSessions).map((session) => {
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

  const handleProgramChange = (event: any) => {
    setSelectedProgram(event.target.value);
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

      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="program-select-label">Select Program</InputLabel>
        <Select
          labelId="program-select-label"
          value={selectedProgram}
          label="Select Program"
          onChange={handleProgramChange}
        >
          <MenuItem value="all">All Programs</MenuItem>
          {programNames.map((program) => (
            <MenuItem key={program} value={program}>
              {program}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
              {Array.from(currentSessions).map((session) => (
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
            {filteredBranchData.map((item, index) => (
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
                {Array.from(currentSessions).map((session: any) => {
                  const sessionData = item[session] || {};
                  return (
                    <TableCell key={session}>
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
          Download CSV (Batch-wise)
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

      <Typography
        variant="h5"
        sx={{ mt: 5, fontWeight: "bold", color: "black", textAlign: "center" }}
      >
        Individual Attendance Details
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "90%",
          mt: 3,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "orange" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                UID
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Program Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Batch
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Year
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
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                % Attendance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConsolidatedData.map((item, index) => {
              const totalSessions =
                (item.totalPresent || 0) + (item.totalAbsent || 0);
              const attendancePercentage =
                totalSessions > 0
                  ? ((item.totalPresent || 0) / totalSessions) * 100
                  : 0;

              return (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#e3f2fd" },
                  }}
                >
                  <TableCell>{item.uid}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.program_name}</TableCell>
                  <TableCell>{item.batch}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell>{item.totalPresent}</TableCell>
                  <TableCell>{item.totalAbsent}</TableCell>
                  <TableCell>{item.totalLate}</TableCell>
                  <TableCell>{attendancePercentage.toFixed(2)}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          marginBottom: 4,
        }}
      >
        <Button
          onClick={downloadIndividualCSV}
          variant="contained"
          color="secondary"
          sx={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "orange", color: "black" },
          }}
        >
          Download CSV (Individual Details)
        </Button>
      </Box>
    </Box>
  );
};

export default Attendance;
