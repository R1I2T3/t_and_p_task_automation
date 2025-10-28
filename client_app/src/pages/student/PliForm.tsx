import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getCookie } from "../../utils";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Paper,
} from "@mui/material";
import { useParams } from "react-router";
import { useReactToPrint } from "react-to-print";
import Entrepreneurship from "./components/pliForms/Entrepreneurship";
import Placement from "./components/pliForms/Placement";
import HigherStudies from "./components/pliForms/HigherStudies";
import { StudentFormData } from "./types";

const PliForm = () => {
  const [pliOption, setPliOption] = useState(false);
  const [isPli, setIsPli] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState("Placement");
  const [studentData, setStudentData] = useState<StudentFormData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactPrintFn = useReactToPrint({ contentRef });
  const csrfToken = getCookie("csrftoken");

  const { id } = useParams();

  useEffect(() => {
    axios.get('/api/student/student-data/', {
      headers: {
        "X-CSRFToken": csrfToken || "",
      },
      withCredentials: true,
    })
      .then((response) => {
        const student = response.data.student;
        console.log("useEffect Student", student)
        setStudentData(student);
        setSelectedConsent(student.consent);
      })
      .catch((error) => {
        console.error("Error submitting pli:", error);
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `/api/student/pli/${id}`,
        { is_pli: pliOption },
        {
          headers: {
            "X-CSRFToken": csrfToken || "",
          },
          withCredentials: true,
        }
      );
      const student = response.data.student;
      setIsSubmitted(true);
      setIsPli(pliOption);
      console.log("Student in submit:", student);
      alert("PLI submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting pli:", error);
      const errorMessage =
        error?.response?.data?.error || "Failed to submit PLI form!";
      alert(errorMessage);
    }
  };

  const onPrint = () => {
    reactPrintFn();
  };

  console.log("student data in the console: ", studentData, "submitted: ", isSubmitted)

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 4,
        borderRadius: 3,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
        PLI Form
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl component="fieldset" fullWidth margin="normal">
          <FormLabel component="legend">Select your PLI</FormLabel>
          <RadioGroup
            row
            aria-label="pli"
            name="pli"
            value={pliOption ? "yes" : "no"}
            onChange={(e) => setPliOption(e.target.value === "yes")}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={!studentData}
        >
          Submit
        </Button>

      </Box>
      {isPli && (studentData && (
        <>
          <div style={{ display: "none" }}>
            {isSubmitted && (selectedConsent === "placement" && (<Placement ref={contentRef} formData={studentData} />))}
            {isSubmitted && (selectedConsent === "Entrepreneurship" && (<Entrepreneurship ref={contentRef} formData={studentData} />))}
            {isSubmitted && (selectedConsent === "Higher studies" && (<HigherStudies ref={contentRef} formData={studentData} />))}
          </div>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onPrint}
            >
              Print {selectedConsent} Form
            </Button>
          </Box>
        </>
      ))}

    </Paper>
  );
};

export default PliForm;
