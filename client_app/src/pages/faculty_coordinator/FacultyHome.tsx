/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Fade,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router";
import {
  Calendar as CalendarIcon,
  School as SchoolIcon,
  ArrowRight as ArrowForwardIcon,
} from "lucide-react";
import Sidebar from "./components/Sidebar";

interface ProgramData {
  program_name: string;
  dates: string[] | string;
  num_sessions: number;
  student_data: Array<{
    student_data?: any[]; // Adjust type as needed
  }>;
  phase?: string; // Assuming phase is part of the program data
}

function FacultyHome() {
  const [data, setData] = useState<ProgramData[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [phases, setPhases] = useState<string[]>([]); // State for Phases
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedPhase, setSelectedPhase] = useState(""); // State for selected phase
  const [selectedDateSession, setSelectedDateSession] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [, setBatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/faculty_coordinator/data");
        setData(response.data);

        const uniquePrograms = [
          ...new Set(
            response.data.map((item: ProgramData) => item.program_name)
          ),
        ] as string[];
        setPrograms(uniquePrograms);

        const allPhases = response.data.flatMap((item: ProgramData) => {
          return item.phase ? [item.phase] : []; // Extract phases if they exist
        });
        setPhases([...new Set(allPhases)] as string[]); // Set unique phases

        const allBatches = response.data.flatMap((item: ProgramData) => {
          const batches: any[] = [];
          if (Array.isArray(item.student_data)) {
            item.student_data.forEach((student) => {
              if (student.student_data && Array.isArray(student.student_data)) {
                const batch = student.student_data[2];
                if (batch && !batches.includes(batch)) {
                  batches.push(batch);
                }
              }
            });
          }
          return batches;
        });
        setBatches([...new Set(allBatches)] as string[]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        alert(
          "An error occurred while fetching the data. Please try again later."
        );
      }
    };

    fetchData();
  }, []);

  const handleProgramChange = (event: any) => {
    setSelectedProgram(event.target.value);
    setSelectedDateSession("");
    setSelectedBatch("");
    setSelectedPhase(""); // Reset phase selection when program changes
  };

  const handlePhaseChange = (event: any) => {
    setSelectedPhase(event.target.value);
    setSelectedDateSession(""); // Optionally reset session on phase change
  };

  const handleDateSessionChange = (event: any) => {
    setSelectedDateSession(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedProgram && selectedDateSession) {
      navigate("/faculty_coordinator/attendance", {
        state: {
          program: selectedProgram,
          dateSession: selectedDateSession,
          batch: selectedBatch,
          phase: selectedPhase, // Pass selected phase
        },
      });
    } else {
      alert("Please select both a program and a date/session.");
    }
  };

  const filteredData = selectedProgram
    ? data.filter((item) => item.program_name === selectedProgram)
    : data;

  // Optionally filter by phase
  const filteredPhaseData = selectedPhase
    ? filteredData.filter((item) => item.phase === selectedPhase)
    : filteredData;

  const dateSessionOptions = filteredPhaseData.flatMap((item) => {
    let dates = [];
    try {
      if (item.dates && typeof item.dates === "string") {
        dates = JSON.parse(item.dates);
      } else if (Array.isArray(item.dates)) {
        dates = item.dates;
      }
    } catch (error) {
      console.error("Error parsing dates:", error);
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      return [];
    }

    return dates.flatMap((date, index) =>
      Array.from({ length: item.num_sessions }, (_, i) => {
        const sessionKey = `${date} - Session ${i + 1}`;
        return { key: `${sessionKey}-${index}`, value: sessionKey };
      })
    );
  });

  return (
    <Box sx={{ display: "flex", minHeight: "80vh", bgcolor: "#fff5e6" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: "400px",
          flexShrink: 0,
          borderRight: "1px solid #FFE0B2",
          bgcolor: "white",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          ml: "250px", // Match sidebar width
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            background: "white",
            border: "1px solid #FFE0B2",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                textAlign: "center",
                color: "#f57c00",
                fontWeight: "bold",
                letterSpacing: "-0.5px",
              }}
            >
              Session Attendance
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress sx={{ color: "#f57c00" }} />
              </Box>
            ) : (
              <Fade in={!loading}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Program Select Dropdown */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#fb8c00",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#f57c00",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#f57c00",
                      },
                    }}
                  >
                    <InputLabel id="program-label">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SchoolIcon fontSize="small" />
                        Select Program
                      </Box>
                    </InputLabel>
                    <Select
                      labelId="program-label"
                      value={selectedProgram}
                      onChange={handleProgramChange}
                      label="Select Program"
                    >
                      <MenuItem value="">None</MenuItem>
                      {programs.map((program, index) => (
                        <MenuItem key={program || index} value={program}>
                          {program}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Phase Select Dropdown */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    disabled={!selectedProgram}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#fb8c00",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#f57c00",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#f57c00",
                      },
                    }}
                  >
                    <InputLabel id="phase-label">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <SchoolIcon fontSize="small" />
                        Select Phase
                      </Box>
                    </InputLabel>
                    <Select
                      labelId="phase-label"
                      value={selectedPhase}
                      onChange={handlePhaseChange}
                      label="Select Phase"
                    >
                      <MenuItem value="">None</MenuItem>
                      {phases.map((phase, index) => (
                        <MenuItem key={phase || index} value={phase}>
                          {phase}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Date and Session Select Dropdown */}
                  <FormControl
                    fullWidth
                    variant="outlined"
                    disabled={!selectedProgram}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#fb8c00",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#f57c00",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#f57c00",
                      },
                    }}
                  >
                    <InputLabel id="date-session-label">
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CalendarIcon fontSize="small" />
                        Select Date and Session
                      </Box>
                    </InputLabel>
                    <Select
                      labelId="date-session-label"
                      value={selectedDateSession}
                      onChange={handleDateSessionChange}
                      label="Select Date and Session"
                    >
                      <MenuItem value="">None</MenuItem>
                      {dateSessionOptions.length === 0 ? (
                        <MenuItem value="" disabled>
                          No sessions available
                        </MenuItem>
                      ) : (
                        dateSessionOptions.map((option, index) => (
                          <MenuItem
                            key={option.key || index}
                            value={option.value}
                          >
                            {option.value}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>

                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleSubmit}
                    disabled={!selectedProgram || !selectedDateSession}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      padding: "12px",
                      textTransform: "none",
                      fontSize: "1.1rem",
                      backgroundColor: "#f57c00",
                      "&:hover": {
                        backgroundColor: "#fb8c00",
                      },
                      "&:disabled": {
                        backgroundColor: "#FFE0B2",
                      },
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    View Attendance Table
                  </Button>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default FacultyHome;
