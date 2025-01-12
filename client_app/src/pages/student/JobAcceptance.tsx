/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import theme from "./components/theme";
import {
  Container,
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  ThemeProvider,
  Paper,
} from "@mui/material";
import { Button as ShadCnBUtton } from "@/components/ui/button";
import { getCookie, objectToFormData } from "@/utils";
import toast from "react-hot-toast";

const JobAcceptanceForm = () => {
  const [selectOption, setSelectOption] = useState("");
  const [customOption, setCustomOption] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobType, setJobType] = useState("");
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [offerLetterURL, setOfferLetterURL] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [salary, setSalary] = useState("");
  const [position, setPosition] = useState("");

  const SIZE_LIMIT_KB = 256; // File size limit in KB
  const SIZE_LIMIT_BYTES = SIZE_LIMIT_KB * 1024;

  interface Company {
    id: number;
    name: string;
    batch: string;
  }

  const [companies, setCompanies] = useState<Company[]>([]);
  const csrfToken = getCookie("csrftoken");
  useEffect(() => {
    axios
      .get("/api/placement/company/all/", {
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        withCredentials: true, // Ensure cookies are included in the request
      })
      .then((response) => {
        const formattedCompanies = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          batch: item.batch,
        }));
        console.log(formattedCompanies);
        setCompanies(formattedCompanies);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }, []);
  const handleSelectOption = (e: any) => {
    setSelectOption(e.target.value);
    setCustomOption("");
    setCompanyName("");
  };

  const handleFileUpload = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        if (selectedFile.size <= SIZE_LIMIT_BYTES) {
          setOfferLetter(selectedFile);
          setOfferLetterURL(URL.createObjectURL(selectedFile));
          setError("");
          setShowPreview(false);
        } else {
          setOfferLetter(null);
          setOfferLetterURL("");
          setError(`File size exceeds the ${SIZE_LIMIT_KB}KB limit.`);
          setShowPreview(false);
        }
      } else {
        setOfferLetter(null);
        setOfferLetterURL("");
        setError("Please upload a valid PDF file.");
        setShowPreview(false);
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectOption) {
      alert("Please select In-house or Out-house.");
      return;
    }
    if (selectOption === "inHouse" && !companyName) {
      alert("Please select a company name.");
      return;
    }
    if (selectOption === "outHouse" && !customOption) {
      alert("Please enter a custom company name.");
      return;
    }
    if (!jobType) {
      alert("Please select a job type.");
      return;
    }
    if (!offerLetter) {
      alert("Please upload the offer letter.");
      return;
    }
    const preference = selectOption === "outHouse" ? customOption : companyName;
    const formDataObject = {
      type: selectOption,
      company_name: preference,
      salary_category: jobType,
      offer_letter: offerLetter,
      salary: salary,
      position: position,
    };
    const formData = objectToFormData(formDataObject);
    try {
      await axios.post("/api/placement/job_acceptance/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken || "",
        },
        withCredentials: true,
      });
      toast.success("Form submitted successfully!");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error submitting the form.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box
          mt={5}
          p={4}
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: 2,
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h5" align="center" gutterBottom color="primary">
            Acceptance Form
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Radio Buttons */}
            <Typography variant="subtitle1">Select an option:</Typography>
            <RadioGroup
              row
              value={selectOption}
              onChange={handleSelectOption}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="inHouse"
                control={<Radio color="primary" disabled={isSubmitted} />}
                label="In-house"
              />
              <FormControlLabel
                value="outHouse"
                control={<Radio color="primary" disabled={isSubmitted} />}
                label="Out-house"
              />
            </RadioGroup>

            {/* Dropdown for In-house */}
            {selectOption === "inHouse" && (
              <FormControl fullWidth margin="normal" required>
                <TextField
                  select
                  label="Select Company"
                  name="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  fullWidth
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.name}>
                      {company.name}-{company.batch}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            )}

            {/* Text Input for Out-house */}
            {selectOption === "outHouse" && (
              <TextField
                fullWidth
                margin="normal"
                label="Custom Company Name"
                variant="outlined"
                value={customOption}
                onChange={(e) => setCustomOption(e.target.value)}
                placeholder="Enter custom company name"
                disabled={isSubmitted}
                required
              />
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Enter salary"
              variant="outlined"
              value={salary}
              type="number"
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Enter Salary"
              disabled={isSubmitted}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Enter Position"
              variant="outlined"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Enter position"
              disabled={isSubmitted}
              required
            />
            {/* Job Type Dropdown */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="job-type-label">Job Type</InputLabel>
              <Select
                labelId="job-type-label"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                disabled={isSubmitted}
                label="Job Type"
              >
                <MenuItem value="super">Super</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="good">Good</MenuItem>
              </Select>
            </FormControl>

            {/* File Upload */}
            <Box mt={2}>
              <Typography variant="subtitle1">
                Upload Offer Letter (PDF, max {SIZE_LIMIT_KB}KB):
              </Typography>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={isSubmitted}
                style={{ marginTop: "8px" }}
              />
              {error && (
                <Typography color="error" variant="body2" mt={1}>
                  {error}
                </Typography>
              )}
              {offerLetter && (
                <Box display="flex" alignItems="center" mt={2}>
                  <Typography variant="body2" color="primary" sx={{ mr: 2 }}>
                    File Selected: {offerLetter.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? "Hide Preview" : "Preview"}
                  </Button>
                </Box>
              )}
              {/* Preview Section */}
              {showPreview && offerLetterURL && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Offer Letter Preview:
                  </Typography>
                  <iframe
                    src={offerLetterURL}
                    title="PDF Preview"
                    style={{
                      width: "100%",
                      height: "400px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Submit Button */}
            <ShadCnBUtton
              type="submit"
              className="w-full bg-orange-500 text-white"
            >
              Submit
            </ShadCnBUtton>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default JobAcceptanceForm;
