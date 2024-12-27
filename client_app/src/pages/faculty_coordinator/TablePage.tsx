/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import "./TablePage.css";
interface ProgramData {
  program_name: string;
  student_data: string;
  dates: string;
  year: string;
  num_sessions: number;
}

interface AttendanceRecord {
  UID: string;
  Batch: string;
  Session: string;
  Present: boolean;
  Late: boolean;
}

import "./TablePage.css";

import { getCookie } from "@/utils";

function FacultyTablePage() {
  const [data, setData] = useState<ProgramData[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const { program, dateSession } = location.state || {};
  const [attendanceData, setAttendanceData] = useState<{
    [key: string]: AttendanceRecord;
  }>({});
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState<string[]>([]);

  // Fetch data and populate batches
  useEffect(() => {
    if (!program) return;

    axios
      .get("http://127.0.0.1:5000/api/data")
      .then((response) => {
        setData(response.data);

        // Filter batches based on program name
        const programData = response.data.filter(
          (item: ProgramData) => item.program_name === program
        );
        const uniqueBatches = Array.from(
          new Set(
            programData.flatMap((item: ProgramData) =>
              JSON.parse(item.student_data || "[]").map(
                (student: any) => student.student_data[2]
              )
            )
          )
        ) as string[];
        setBatches(uniqueBatches);
      })
      .catch((error) => console.error("Error fetching data:", error));
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
  const handleCheckboxChange = (
    studentId: any,
    batch: any,
    checkboxType: any
  ) => {
    setAttendanceData((prevState) => {
      const studentKey = `${studentId}-${batch}-${dateSession}`;
      const updatedState = { ...prevState };

      if (checkboxType === "Present") {
        updatedState[studentKey] = {
          ...(updatedState[studentKey] || {
            UID: studentId,
            Batch: batch,
            Session: dateSession,
            Present: false,
            Late: false,
          }),
          Present: !updatedState[studentKey]?.Present,
          Late: updatedState[studentKey]?.Present
            ? false
            : updatedState[studentKey]?.Late,
        };
      } else if (checkboxType === "Late") {
        updatedState[studentKey] = {
          ...(updatedState[studentKey] || {
            UID: studentId,
            Batch: batch,
            Session: dateSession,
            Present: false,
            Late: false,
          }),
          Late: !updatedState[studentKey]?.Late,
          Present: updatedState[studentKey]?.Late
            ? true
            : updatedState[studentKey]?.Present,
        };
      }

      return updatedState;
    });
  };

  // Handle 'Select All' changes
  const handleSelectAllChange = (checkboxType: any, action: any) => {
    setAttendanceData((prevState) => {
      const updatedState = { ...prevState };

      filteredByBatch.forEach((student) => {
        const studentKey = `${student.student_data[0]}-${student.student_data[2]}-${dateSession}`;
        updatedState[studentKey] = updatedState[studentKey] || {
          UID: student.student_data[0],
          Batch: student.student_data[2],
          Session: dateSession,
          Present: false,
          Late: false,
        };

        if (checkboxType === "Present") {
          updatedState[studentKey].Present = action === "select";
          if (action !== "select") {
            updatedState[studentKey].Late = false;
          }
        } else if (checkboxType === "Late") {
          updatedState[studentKey].Late = action === "select";
          if (action === "select") {
            updatedState[studentKey].Present = true;
          }
        }
      });

      return updatedState;
    });
  };

  // Save data to backend
  const saveData = () => {
    const allStudents = filteredByBatch.map((student) => ({
      UID: student.student_data[0],
      Name: student.student_data[1],
      Year: student.year,
      Batch: student.student_data[2],
    }));

    const attendanceArray = allStudents.map((student) => {
      const studentKey = `${student.UID}-${student.Batch}-${dateSession}`;
      const attendance = attendanceData[studentKey] || {
        Present: false,
        Late: false,
      };

      const presentStatus = attendance.Present ? "Present" : "Absent";
      const lateStatus = attendance.Late ? "Late" : "Not Late";

      return {
        ProgramName: program,
        Session: dateSession,
        UID: student.UID,
        Name: student.Name,
        Year: student.Year,
        Batch: student.Batch,
        Present: presentStatus,
        Late: lateStatus,
      };
    });

    axios
      .post(
        "http://127.0.0.1:5000/api/save-attendance",
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
      .catch((error) => {
        console.error("Error saving data:", error.response?.data);
        alert("Error saving data.");
      });
  };

  const downloadCSV = () => {
    const csvRows = [];
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
      const present = attendanceData[studentKey]?.Present
        ? "Present"
        : "Absent";
      const late = attendanceData[studentKey]?.Late ? "Late" : "Not Late";

      const row = [
        program,
        dateSession,
        student.student_data[0],
        student.student_data[1],
        student.year,
        student.student_data[2],
        present,
        late,
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
    let dates = [];
    try {
      dates = JSON.parse(item.dates);
    } catch (error) {
      console.error("Error parsing dates:", error);
    }

    return dates.flatMap((date: any) =>
      Array.from({ length: item.num_sessions }, (_, i) => {
        const sessionLabel = `${date} - Session ${i + 1}`;
        return sessionLabel === dateSession ? item : null;
      }).filter(Boolean)
    );
  });

  const filteredByBatch = selectedBatch
    ? filteredSessionData.flatMap((row) =>
        JSON.parse(row.student_data || "[]")
          .filter((student: any) => student.student_data[2] === selectedBatch)
          .map((student: any) => ({ ...student, year: row.year }))
      )
    : filteredSessionData.flatMap((row) =>
        JSON.parse(row.student_data || "[]").map((student: any) => ({
          ...student,
          year: row.year,
        }))
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
              onChange={(e) => handleSelectAllChange("Present", e.target.value)}
            >
              <option value="">-- Select Option --</option>
              <option value="select">Select All</option>
              <option value="deselect">Deselect All</option>
            </select>
            <br />
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
                  <th>Present</th>
                  <th>Late</th>
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
                      <td>
                        <input
                          type="checkbox"
                          checked={attendance.Present || false}
                          onChange={() =>
                            handleCheckboxChange(
                              student.student_data[0],
                              student.student_data[2],
                              "Present"
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={attendance.Late || false}
                          disabled={!attendance.Present} // Disable if 'Present' is unchecked
                          onChange={() =>
                            handleCheckboxChange(
                              student.student_data[0],
                              student.student_data[2],
                              "Late"
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <center>
            <button onClick={saveData}>Save Data</button>
            <button onClick={() => navigate("/")}>Go Back</button>
            <button onClick={downloadCSV}>Download CSV</button>
          </center>
        </main>
      </div>
    </div>
  );
}

export default FacultyTablePage;
