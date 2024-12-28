/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import axios, { AxiosError } from "axios";
import "./TablePage.css";
import Sidebar from "./components/Sidebar";
import { getCookie } from "@/utils";

interface LocationState {
  program: string;
  dateSession: string;
}

interface StudentData {
  student_data: [string, string, string]; // [UID, Name, Batch]
  year: string;
}

interface ProgramData {
  program_name: string;
  student_data: string; // JSON string of StudentData[]
  dates: string; // JSON string of dates
  num_sessions: number;
  year: string;
  semester: string;
}

interface AttendanceRecord {
  UID: string;
  Batch: string;
  Session: string;
  Present: boolean;
  status: "present" | "late" | "absent";
}

interface AttendanceData {
  [key: string]: AttendanceRecord;
}

interface SaveAttendancePayload {
  ProgramName: string;
  Session: string;
  UID: string;
  Name: string;
  Year: string;
  Batch: string;
  status: "present" | "late" | "absent";
}

function TablePage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const { program, dateSession } = (location.state as LocationState) || {};
  const [data, setData] = useState<ProgramData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [batches, setBatches] = useState<string[]>([]);
  // Fetch data and populate batches
  useEffect(() => {
    if (!program) return;

    axios
      .get<ProgramData[]>("/api/faculty_coordinator/data")
      .then((response) => {
        setData(response.data);

        // Filter batches based on program name
        const programData = response.data.filter(
          (item) => item.program_name === program
        );
        const uniqueBatches = Array.from(
          new Set(
            programData.flatMap((item) =>
              JSON.parse(item.student_data || "[]").map(
                (student: StudentData) => student.student_data[2]
              )
            )
          )
        );
        setBatches(uniqueBatches);
      })
      .catch((error: AxiosError) =>
        console.error("Error fetching data:", error)
      );
  }, [program]);

  // Load attendance data from localStorage on component mount
  useEffect(() => {
    const storedAttendanceData = localStorage.getItem("attendanceData");
    if (storedAttendanceData) {
      setAttendanceData(JSON.parse(storedAttendanceData));
    }
  }, []);

  // Save attendance data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  }, [attendanceData]);

  // Handle checkbox changes for individual students
  const handleAttendanceChange = (
    studentId: string,
    batch: string,
    status: "present" | "late" | "absent"
  ): void => {
    setAttendanceData((prevState) => {
      const studentKey = `${studentId}-${batch}-${dateSession}`;
      const updatedState = { ...prevState };

      updatedState[studentKey] = {
        UID: studentId,
        Batch: batch,
        Session: dateSession,
        Present: status === "present" || status === "late",
        status: status,
      };

      return updatedState;
    });
  };

  // Handle 'Select All' changes
  const handleSelectAllChange = (action: string): void => {
    setAttendanceData((prevState) => {
      const updatedState = { ...prevState };

      filteredByBatch.forEach((student) => {
        let status;
        if (action === "late") {
          status = "late";
        } else if (action === "absent") {
          status = "absent";
        } else {
          status = "present";
        }
        const studentKey = `${student.student_data[0]}-${student.student_data[2]}-${dateSession}`;
        updatedState[studentKey] = {
          UID: student.student_data[0],
          Batch: student.student_data[2],
          Session: dateSession,
          Present: action === "select",
          // @ts-expect-error: status is not assignable to type 'boolean'
          status,
        };
      });

      return updatedState;
    });
  };

  // Save data to backend
  const saveData = (): void => {
    const allStudents = filteredByBatch.map((student) => ({
      UID: student.student_data[0],
      Name: student.student_data[1],
      Year: student.year,
      Batch: student.student_data[2],
    }));

    const attendanceArray: SaveAttendancePayload[] = allStudents.map(
      (student) => {
        const studentKey = `${student.UID}-${student.Batch}-${dateSession}`;
        const attendance = attendanceData[studentKey] || {
          Present: false,
          Late: false,
        };

        return {
          ProgramName: program,
          Session: dateSession,
          UID: student.UID,
          Name: student.Name,
          Year: student.Year,
          Batch: student.Batch,
          status: attendance.status,
          semester: data[0].semester,
        };
      }
    );

    axios
      .post(
        "/api/faculty_coordinator/save-attendance",
        { students: attendanceArray },
        {
          headers: {
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          withCredentials: true,
        }
      )
      .then(() => {
        alert("Data saved successfully!");
      })
      .catch((error: AxiosError) => {
        console.error("Error saving data:", error.response?.data);
        alert("Error saving data.");
      });
  };

  const downloadCSV = (): void => {
    const csvRows: string[] = [];
    const headers = [
      "Program",
      "Session",
      "UID",
      "Name",
      "Year",
      "Batch",
      "Present",
      "Late",
    ];
    csvRows.push(headers.join(","));

    filteredByBatch.forEach((student) => {
      const studentKey = `${student.student_data[0]}-${student.student_data[2]}-${dateSession}`;
      const row = [
        program,
        dateSession,
        student.student_data[0],
        student.student_data[1],
        student.year,
        student.student_data[2],
        attendanceData[studentKey].status,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${program}-${dateSession}-attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!program || !dateSession) {
    return (
      <div>
        <p>Error: Missing program or session information.</p>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const filteredData = data.filter((item) => item.program_name === program);

  const filteredSessionData = filteredData.flatMap((item) => {
    let dates: string[] = [];
    try {
      dates = JSON.parse(item.dates);
    } catch (error) {
      console.error("Error parsing dates:", error);
    }

    return dates.flatMap((date) =>
      Array.from({ length: item.num_sessions }, (_, i) => {
        const sessionLabel = `${date} - Session ${i + 1}`;
        return sessionLabel === dateSession ? item : null;
      }).filter(Boolean)
    );
  });

  const filteredByBatch: (StudentData & { year: string })[] = selectedBatch
    ? filteredSessionData.flatMap((row) =>
        row
          ? JSON.parse(row.student_data || "[]")
              .filter(
                (student: StudentData) =>
                  student.student_data[2] === selectedBatch
              )
              .map((student: StudentData) => ({ ...student, year: row.year }))
          : []
      )
    : filteredSessionData.flatMap((row) =>
        row
          ? JSON.parse(row.student_data || "[]").map(
              (student: StudentData) => ({
                ...student,
                year: row.year,
              })
            )
          : []
      );

  return (
    <div className="page-container">
      <Sidebar />
      <div className="back">
        <main>
          <h1>Program: {program}</h1>
          <h2>Session: {dateSession}</h2>

          <div>
            <label>Select Batch: </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {batches.map((batch, index) => (
                <option key={index} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
          <br />

          <div className="dropdown-container">
            <label>Select All Present: </label>
            <select
              onChange={(e) =>
                handleSelectAllChange(
                  e.target.value as "present" | "late" | "absent"
                )
              }
              value=""
            >
              <option value="">-- Select Option --</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <br />

          {filteredByBatch.length === 0 ? (
            <p>No data available for the selected session and batch.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Session</th>
                  <th>UID</th>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Batch</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredByBatch.map((student, index) => {
                  const studentKey = `${student.student_data[0]}-${student.student_data[2]}-${dateSession}`;
                  const attendance = attendanceData[studentKey] || {};
                  return (
                    <tr key={index}>
                      <td>{program}</td>
                      <td>{dateSession}</td>
                      <td>{student.student_data[0]}</td>
                      <td>{student.student_data[1]}</td>
                      <td>{student.year}</td>
                      <td>{student.student_data[2]}</td>

                      <td colSpan={2}>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.student_data[0]}`}
                              value="present"
                              checked={
                                attendanceData[studentKey]?.status === "present"
                              }
                              onChange={() =>
                                handleAttendanceChange(
                                  student.student_data[0],
                                  student.student_data[2],
                                  "present"
                                )
                              }
                            />
                            <span className="ml-2">Present</span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.student_data[0]}`}
                              value="late"
                              checked={
                                attendanceData[studentKey]?.status === "late"
                              }
                              onChange={() =>
                                handleAttendanceChange(
                                  student.student_data[0],
                                  student.student_data[2],
                                  "late"
                                )
                              }
                            />
                            <span className="ml-2">Late</span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.student_data[0]}`}
                              value="absent"
                              checked={
                                attendanceData[studentKey]?.status === "absent"
                              }
                              onChange={() =>
                                handleAttendanceChange(
                                  student.student_data[0],
                                  student.student_data[2],
                                  "absent"
                                )
                              }
                            />
                            <span className="ml-2">Absent</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <center>
            <button onClick={saveData}>Save Data</button>
            <button onClick={() => navigate("/faculty_coordinator")}>
              Go Back
            </button>
            <button onClick={downloadCSV}>Download CSV</button>
          </center>
        </main>
      </div>
    </div>
  );
}

export default TablePage;
