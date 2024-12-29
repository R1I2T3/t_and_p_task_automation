import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";

interface PlacementData {
  company_data: {
    [company: string]: {
      [branch: string]: number;
    };
  };
  student_data: Array<{
    student__uid: string;
    student__department: string;
    company__name: string;
    salary: number;
  }>;
  total_placed_students: number;
  total_accepted_offers: number;
  total_salary_accepted: number;
  avg_salary_accepted: number;
  max_salary_accepted: number;
  min_salary_accepted: number;
}

const PlacementReport = () => {
  const [data, setData] = useState<PlacementData | null>(null);

  useEffect(() => {
    axios
      .get("/api/placement_officer/consolidated/")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  if (!data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const tableStyle: React.CSSProperties = {
    border: "1px solid black",
    borderCollapse: "collapse" as const,
  };

  const cellStyle = {
    border: "1px solid black",
    padding: "10px",
    textAlign: "center" as const,
  };

  const headerCellStyle = {
    ...cellStyle,
    fontWeight: "bold",
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h3" align="center" gutterBottom>
          Consolidated Placement Report
        </Typography>

        {/* Grouped by Company and Branch */}
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{
            border: "1px solid black",
            marginBottom: "0px",
          }}
        >
          Grouped by Company and Branch
        </Typography>
        <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
          <Table style={tableStyle}>
            <TableHead>
              <TableRow>
                <TableCell style={headerCellStyle}>Company</TableCell>
                <TableCell style={headerCellStyle}>Branch</TableCell>
                <TableCell style={headerCellStyle}>Students Placed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data.company_data).map(([company, branches]) =>
                Object.entries(branches).map(([branch, count]) => (
                  <TableRow key={`${company}-${branch}`}>
                    <TableCell style={cellStyle}>{company}</TableCell>
                    <TableCell style={cellStyle}>{branch}</TableCell>
                    <TableCell style={cellStyle}>{count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Detailed Student Data */}
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            border: "1px solid black",
            marginBottom: "0px",
          }}
        >
          Detailed Student Data
        </Typography>
        <TableContainer component={Paper}>
          <Table style={tableStyle}>
            <TableHead>
              <TableRow>
                <TableCell style={headerCellStyle}>Student UID</TableCell>
                <TableCell style={headerCellStyle}>Department</TableCell>
                <TableCell style={headerCellStyle}>Company</TableCell>
                <TableCell style={headerCellStyle}>Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.student_data.map((student, index) => (
                <TableRow key={index}>
                  <TableCell style={cellStyle}>
                    {student.student__uid}
                  </TableCell>
                  <TableCell style={cellStyle}>
                    {student.student__department}
                  </TableCell>
                  <TableCell style={cellStyle}>
                    {student.company__name}
                  </TableCell>
                  <TableCell style={cellStyle}>{student.salary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Overall Statistics */}
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            border: "1px solid black",
            marginBottom: "0px",
          }}
        >
          Overall Statistics
        </Typography>
        <TableContainer component={Paper}>
          <Table style={tableStyle}>
            <TableBody>
              <TableRow>
                <TableCell style={headerCellStyle}>
                  Total Placed Students
                </TableCell>
                <TableCell style={cellStyle}>
                  {data.total_placed_students}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={headerCellStyle}>
                  Total Accepted Offers
                </TableCell>
                <TableCell style={cellStyle}>
                  {data.total_accepted_offers}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={headerCellStyle}>
                  Total Salary Accepted
                </TableCell>
                <TableCell style={cellStyle}>
                  {data.total_salary_accepted}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={headerCellStyle}>
                  Average Salary Accepted
                </TableCell>
                <TableCell style={cellStyle}>
                  {data.avg_salary_accepted}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={headerCellStyle}>
                  Maximum Salary Accepted
                </TableCell>
                <TableCell style={cellStyle}>
                  {data.max_salary_accepted}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={headerCellStyle}>
                  Minimum Salary Accepted
                </TableCell>
                <TableCell style={cellStyle}>
                  {data.min_salary_accepted}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default PlacementReport;
