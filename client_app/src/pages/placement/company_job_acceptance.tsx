import React, { useState } from "react";
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
import Submit from "./components/submit";
import { objectToFormData } from "@/utils.js";

const AcceptanceForm = () => {
  const [selectOption, setSelectOption] = useState("");
  const [customOption, setCustomOption] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobType, setJobType] = useState("");
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [offerLetterURL, setOfferLetterURL] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const SIZE_LIMIT_KB = 256; // File size limit in KB
  const SIZE_LIMIT_BYTES = SIZE_LIMIT_KB * 1024;

  const companyOptions = ["Google", "Amazon", "Microsoft", "Facebook", "Apple"];
  // @ts-expect-error: suppress TS error for now
  const handleSelectOption = (e) => {
    setSelectOption(e.target.value);
    setCustomOption("");
    setCompanyName("");
  };
  // @ts-expect-error: suppress TS error for now
  const handleFileUpload = (e) => {
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

  // @ts-expect-error: suppress TS error for now
  const handleSubmit = (e) => {
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
      selectOption,
      companyName: preference,
      jobType,
      offerLetter,
    };

    // Convert to FormData
    const formData = objectToFormData(formDataObject);

    try {
      console.log("FormData:", [...formData.entries()]);

      alert("Form submitted successfully!");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting the form.");
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
                <InputLabel id="company-name-label">Select Company</InputLabel>
                <Select
                  labelId="company-name-label"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isSubmitted}
                  label="Select Company"
                >
                  {companyOptions.map((company, index) => (
                    <MenuItem key={index} value={company}>
                      {company}
                    </MenuItem>
                  ))}
                </Select>
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
            <Submit isSubmitted={isSubmitted} />
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default AcceptanceForm;
