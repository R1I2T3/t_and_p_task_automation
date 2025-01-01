/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  ThemeProvider,
  Container,
  Box,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import theme from "./components/theme";
import toast from "react-hot-toast";
import { Button as ShadcnButton } from "@/components/ui/button";
import { getCookie, objectToFormData } from "@/utils";
import { useNavigate } from "react-router";
const InternShipSubmission = () => {
  const [selectOption, setSelectOption] = useState("in_house");
  const [year, setYear] = useState("FE");
  const [domain, setDomain] = useState("Web development");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [stipend, setStipend] = useState<string>("");
  const navigate = useNavigate();
  const domains = [
    "Web development",
    "App development",
    "Data Science",
    "AI",
    "Blockchain",
    "Other",
  ];

  const SIZE_LIMIT_KB = 256; // File size limit in KB
  const SIZE_LIMIT_BYTES = SIZE_LIMIT_KB * 1024;
  const handleFileUpload = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        if (selectedFile.size <= SIZE_LIMIT_BYTES) {
          setOfferLetter(selectedFile);
        } else {
          setOfferLetter(null);
          toast.error(`File size should be less than ${SIZE_LIMIT_KB}KB`);
        }
      } else {
        setOfferLetter(null);
        toast.error("Only PDF files are allowed");
      }
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const requestBody = objectToFormData({
      selectOption,
      year,
      domain,
      startDate,
      endDate,
      companyName,
      offerLetter,
      stipend,
    });
    try {
      const response = await fetch("/api/internship/job_acceptance/create/", {
        method: "POST",
        body: requestBody,
        headers: {
          "X-CSRFTOKEN": getCookie("csrftoken") || "",
        },
      });
      if (response.ok) {
        toast.success("Internship submitted successfully");
        navigate("/student/");
      } else {
        const data = await response.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
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
            Internship Submission Form
          </Typography>
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle1">Select an option:</Typography>
            <RadioGroup
              row
              value={selectOption}
              onChange={(e) => setSelectOption(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="in_house"
                control={<Radio color="primary" />}
                label="In-house"
              />
              <FormControlLabel
                value="out_house"
                control={<Radio color="primary" />}
                label="Out-house"
              />
            </RadioGroup>
            <Typography variant="subtitle1">Select Year:</Typography>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="Year"
              fullWidth
              sx={{ mb: 2 }}
              required
            >
              <MenuItem value="FE">FE</MenuItem>
              <MenuItem value="SE">SE</MenuItem>
              <MenuItem value="TE">TE</MenuItem>
              <MenuItem value="BE">BE</MenuItem>
            </Select>
            <Typography variant="subtitle1">Select Domain:</Typography>
            <Select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              label="Domain"
              fullWidth
              sx={{ mb: 2 }}
              required
            >
              {domains.map((domain) => (
                <MenuItem key={domain} value={domain}>
                  {domain}
                </MenuItem>
              ))}
            </Select>
            <div className="flex justify-between gap-2">
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </div>
            {selectOption === "out_house" && (
              <div className="mt-4">
                <Typography variant="subtitle1">Enter Company name</Typography>
                <TextField
                  label="Company Name"
                  name="companyName"
                  fullWidth
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Typography variant="subtitle1">
                  Enter Stipend if received any
                </Typography>
                <TextField
                  label="Stipend"
                  name="stipend"
                  fullWidth
                  required
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  type="number"
                />
                <Box mt={2}>
                  <Typography variant="subtitle1">
                    Upload Offer Letter (PDF, max {SIZE_LIMIT_KB}KB):
                  </Typography>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    style={{ marginTop: "8px" }}
                  />
                </Box>
              </div>
            )}
            <ShadcnButton className="w-full my-3 bg-orange-500 hover:bg-orange-500">
              Submit
            </ShadcnButton>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default InternShipSubmission;
