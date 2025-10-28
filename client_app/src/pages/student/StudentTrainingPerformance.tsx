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
    primary: {
      main: "#ff9800", // Orange theme
    },
    secondary: {
      main: "#ff5722",
    },
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/student/training-performance/", {
          method: "GET",
          credentials: "include", // ✅ session auth
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch performance data");
        }

        const data = await res.json();
        console.log("Training Performance:", data);
        setPerformance(data);
      } catch (err: any) {
        console.error("Error fetching training data:", err);
        setError(err.message);
        toast.error("Failed to load training performance");
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
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
          ) : !performance ? (
            <Typography textAlign="center" color="textSecondary">
              No data available.
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
                          <TableCell
                            sx={{ color: "black", fontWeight: "bold" }}
                          >
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
