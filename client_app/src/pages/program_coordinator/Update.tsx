/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

interface AttendanceRecord {
  uid: number;
  name: string;
  batch: string;
  session: string;
  present: string;
}

const Update = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  interface LastUpdate {
    uid: number;
    session: string;
    newStatus: string;
  }
  const [lastUpdate, setLastUpdate] = useState<LastUpdate | null>(null);

  // Fetch attendance data from the API
  useEffect(() => {
    fetch("/api/program_coordinator/attendance/attendance_data/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAttendanceData(data);
        setFilteredData(data); // Initialize filtered data with the full dataset
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching attendance data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Handle search input
  const handleSearch = (e: any) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter data based on query matching any column
    const filtered = attendanceData.filter(
      (record) =>
        record.uid.toString().toLowerCase().includes(query) ||
        record.name.toLowerCase().includes(query) ||
        record.batch.toLowerCase().includes(query) ||
        record.present.toString().toLowerCase().includes(query)
    );

    setFilteredData(filtered);
  };

  // Handle attendance update
  const handleUpdate = (uid: any, session: any, currentStatus: any) => {
    const newStatus = currentStatus === "Present" ? "Absent" : "Present";

    // Update data in the backend
    fetch("http://127.0.0.1:5000/api/attendance/update/attendance_data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        session,
        new_status: newStatus,
      }),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.message);

        // Update the local state
        const updatedData = attendanceData.map((record) =>
          record.uid === uid && record.session === session
            ? { ...record, present: newStatus }
            : record
        );

        setAttendanceData(updatedData);
        setFilteredData(updatedData);

        // Track the last update
        setLastUpdate({ uid, session, newStatus });

        // Show alert with updated information
        alert(
          `Attendance Updated Successfully!\nUID: ${uid}\nSession: ${session}\nNew Status: ${newStatus}`
        );
      })
      .catch((error) => {
        console.error("Error updating attendance:", error);
      });
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: "20px",
        boxShadow: 3, // Adding a slight shadow for emphasis
        margin: "auto",
        maxWidth: 1000,
      }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", marginBottom: 3, color: "primary.main" }}
      >
        Update Attendance
      </Typography>
      <Typography variant="body1" align="center" color="textSecondary">
        View and manage attendance records below:
      </Typography>

      {/* Search bar */}
      <TextField
        label="Search by UID, Name, Branch, or Attendance"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ width: "100%", marginBottom: 3 }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography sx={{ color: "error.main" }} variant="body1">
          Error: {error}
        </Typography>
      ) : filteredData.length > 0 ? (
        <>
          <TableContainer>
            <Table
              sx={{
                marginTop: 3,
                marginBottom: 3,
                border: "1px solid black", // Added black border for table
              }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "orange" }}>
                  <TableCell sx={{ border: "1px solid black" }}>UID</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>Name</TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                    Branch
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                    Session
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                    Attendance
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((record, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#e3f2fd", // Hover effect on row
                      },
                    }}
                  >
                    <TableCell sx={{ border: "1px solid black" }}>
                      {record.uid}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {record.name}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {record.batch}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {record.session}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {record.present}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleUpdate(
                            record.uid,
                            record.session,
                            record.present
                          )
                        }
                        sx={{
                          backgroundColor: "success.main",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "success.dark",
                          },
                        }}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Display last update */}
          {lastUpdate && (
            <Box
              sx={{ marginTop: 2, padding: 2, backgroundColor: "info.light" }}
            >
              <Typography variant="body1">
                <strong>Last Update:</strong> UID: {lastUpdate.uid}, Session:{" "}
                {lastUpdate.session}, New Status: {lastUpdate.newStatus}
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" align="center">
          No attendance records found.
        </Typography>
      )}
    </Box>
  );
};

export default Update;
