/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

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

interface BatchAttendance {
  batch: string;
  program_name: string;
  year: string;
  totalPresent?: number;
  totalAbsent?: number;
  totalLate?: number;
  totalStudents?: number;
  [key: string]: any;
}

const Attendance = () => {
  const [_rawData, setRawData] = useState<AttendanceData[]>([]);
  const [_consolidatedData, setConsolidatedData] = useState<
    ConsolidatedStudent[]
  >([]);
  const [_branchConsolidatedData, setBranchConsolidatedData] = useState<
    BatchAttendance[]
  >([]);
  const [_sessions, setSessions] = useState<Set<string>>(new Set());
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [_sessionDates, setSessionDates] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<string[]>([]);
  const [_filteredStudentData, setFilteredStudentData] = useState<
    ConsolidatedStudent[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/program_coordinator/attendance/attendance_data/"
        );
        const data: AttendanceData[] = await response.json();
        setRawData(data);

        const uniquePrograms = Array.from(
          new Set(data.map((item) => item.program_name))
        );
        const uniqueYears = Array.from(new Set(data.map((item) => item.year)));

        setPrograms(uniquePrograms);
        setYears(uniqueYears);

        generateTables(data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchData();
  }, []);

  const generateTables = (data: AttendanceData[]) => {
    if (data.length === 0) {
      alert("No data available from the database.");
      return;
    }

    setSessions(new Set(data.map((item) => item.session)));
    setConsolidatedData(consolidateAttendanceData(data));
    setFilteredStudentData(consolidateAttendanceData(data));
    setBranchConsolidatedData(consolidateAttendanceByBatch(data));
  };

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const year = event.target.value as string;
    setSelectedYear(year);
    filterData(selectedProgram, year);
  };

  const handleProgramChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const programName = event.target.value as string;
    setSelectedProgram(programName);
    filterData(programName, selectedYear);
  };

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
    setFilteredStudentData(consolidateAttendanceData(filteredData));
  };

  const consolidateAttendanceData = (
    data: AttendanceData[]
  ): ConsolidatedStudent[] => {
    const consolidated: Record<string, ConsolidatedStudent> = {};
    data.forEach((item) => {
      const key = `${item.uid}-${item.program_name}`;
      if (!consolidated[key]) {
        consolidated[key] = {
          program_name: item.program_name,
          name: item.name,
          batch: item.batch,
          year: item.year,
          uid: item.uid,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
        };
      }
      consolidated[key][item.session] = item.present;
      if (item.present === "Present") consolidated[key].totalPresent!++;
      if (item.present === "Absent") consolidated[key].totalAbsent!++;
      if (item.late === "Late") consolidated[key].totalLate!++;
    });
    return Object.values(consolidated);
  };

  const consolidateAttendanceByBatch = (
    data: AttendanceData[]
  ): BatchAttendance[] => {
    const batchMap: Record<string, BatchAttendance> = {};
    data.forEach((item) => {
      const key = `${item.batch}-${item.program_name}-${item.year}`;
      if (!batchMap[key]) {
        batchMap[key] = {
          batch: item.batch,
          program_name: item.program_name,
          year: item.year,
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
        };
      }
      if (item.present === "Present") batchMap[key].totalPresent!++;
      if (item.present === "Absent") batchMap[key].totalAbsent!++;
      if (item.late === "Late") batchMap[key].totalLate!++;
    });
    return Object.values(batchMap);
  };

  return (
    <Box>
      <Typography variant="h4">Attendance Table Generator</Typography>
      <FormControl>
        <InputLabel>Program Name</InputLabel>

        <Select
          value={selectedProgram}
          // @ts-expect-error: This is error
          onChange={handleProgramChange}
        >
          {programs.map((program) => (
            <MenuItem key={program} value={program}>
              {program}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel>Year</InputLabel>
        <Select
          value={selectedYear}
          // @ts-expect-error: This is error
          onChange={handleYearChange}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Attendance;
