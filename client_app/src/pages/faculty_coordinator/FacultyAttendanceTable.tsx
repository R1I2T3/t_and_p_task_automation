/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import "./TablePage.css";
import Sidebar from "./components/Sidebar";
import { getCookie } from "@/utils";

function TablePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { program, dateSession } = location.state || {};

  interface DataItem {
    program_name: string;
    student_data: string;
    dates: string;
    num_sessions: number;
    year: string;
    semester: string;
  }
  const [phase, setPhase] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  interface AttendanceRecord {
    UID: string;
    Batch: string;
    Session: string;
    Present: boolean;
    Late: boolean;
  }

  const [attendanceData, setAttendanceData] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState<string[]>([]);

  // Fetch data and populate batches
  useEffect(() => {
    if (!program) return;

    axios
      .get("/api/faculty_coordinator/data")
      .then((response) => {
        setData(response.data);

        const programData = response.data.filter(
          (item: any) => item.program_name === program
        );
        const uniqueBatches = Array.from(
          new Set(
            programData.flatMap((item: any) =>
              JSON.parse(item.student_data || "[]").map(
                (student: any) => student.student_data[2]
              )
            )
          )
        ) as string[];
        setPhase(programData[0].phase);
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
  const handleSelectAllChange = (
    checkboxType: "Present" | "Late",
    action: "select" | "deselect"
  ) => {
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
        Phase: phase, // Add the phase here
        semester: data[0].semester,
      };
    });

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
    let dates: string[] = [];
    try {
      dates = JSON.parse(item.dates);
    } catch (error) {
      console.error("Error parsing dates:", error);
    }

    return dates.flatMap((date: string) =>
      Array.from({ length: item.num_sessions }, (_, i) => {
        const sessionLabel = `${date} - Session ${i + 1}`;
        return sessionLabel === dateSession ? item : null;
      }).filter(Boolean)
    );
  });

  const filteredByBatch = selectedBatch
    ? filteredSessionData.flatMap((row) =>
        JSON.parse(row?.student_data || "[]")
          .filter((student: any) => student.student_data[2] === selectedBatch)
          .map((student: any) => ({ ...student, year: row?.year }))
      )
    : filteredSessionData.flatMap((row) =>
        JSON.parse(row?.student_data || "[]").map((student: any) => ({
          ...student,
          year: row?.year,
        }))
      );

  return (
    <div className="page-container">
      <Sidebar />
      <div className="back">
        <main>
          <h1>Program: {program}</h1>
          <h2>Session: {dateSession}</h2>
          <h2>Phase: {phase}</h2>
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
                  "Present",
                  e.target.value as "select" | "deselect"
                )
              }
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
                  <th>UID</th>
                  <th>Name</th>
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
                      <td>{student.student_data[0]}</td>
                      <td>{student.student_data[1]}</td>
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

export default TablePage;
