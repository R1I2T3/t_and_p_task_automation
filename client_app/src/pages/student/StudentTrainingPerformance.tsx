import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#ff9800" },
    secondary: { main: "#ff5722" },
  },
});

interface Category {
  category_name: string;
  marks: number;
}

interface TrainingTypeData {
  training_type: string;
  categories: Category[];
}

interface StudentPerformance {
  uid: string;
  training_performance: TrainingTypeData[];
}

const StudentTrainingPerformance: React.FC = () => {
  const [performance, setPerformance] = useState<StudentPerformance | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/student/training-performance/", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          let errMsg = `Server Error: ${res.status}`;
          try {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          } catch {
            // Non-JSON error response
          }
          throw new Error(errMsg);
        }

        let data: StudentPerformance;
        try {
          data = await res.json();
        } catch {
          throw new Error("Invalid response format from server.");
        }

        if (!data || !data.training_performance) {
          throw new Error("Incomplete data received from the server.");
        }

        setPerformance(data);
      } catch (err: any) {
        let message = "An unexpected error occurred.";
        if (err.name === "TypeError") {
          message = "Network error or server unreachable.";
        } else if (err instanceof Error) {
          message = err.message;
        }

        console.error("Training performance fetch error:", err);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box p={4} bgcolor="#fff3e0" minHeight="100vh">
        <Box
          maxWidth={800}
          mx="auto"
          p={3}
          bgcolor="#ffffff"
          borderRadius={2}
          boxShadow={3}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            textAlign="center"
            mb={3}
          >
            Training Performance
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress color="primary" />
            </Box>
          ) : error ? (
            <Typography color="error" textAlign="center" mt={2}>
              {error}
            </Typography>
          ) : !performance ? (
            <Typography textAlign="center" color="textSecondary" mt={2}>
              No data available.
            </Typography>
          ) : performance.training_performance.length === 0 ? (
            <Typography textAlign="center" color="textSecondary" mt={2}>
              No training performance records found.
            </Typography>
          ) : (
            <>
              <Box textAlign="center" mb={3}>
                <Typography variant="h6">
                  UID: <strong>{performance.uid}</strong>
                </Typography>
              </Box>

              {performance.training_performance.map((type, index) => (
                <Box key={index} mb={4}>
                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                    mb={1}
                    textAlign="center"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {type.training_type} Performance
                  </Typography>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#ff9800" }}>
                          <TableCell sx={{ color: "black", fontWeight: "bold" }}>
                            Category
                          </TableCell>
                          <TableCell
                            sx={{ color: "black", fontWeight: "bold" }}
                            align="center"
                          >
                            Marks
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {type.categories.map((cat, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{cat.category_name}</TableCell>
                            <TableCell align="center">{cat.marks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StudentTrainingPerformance;
