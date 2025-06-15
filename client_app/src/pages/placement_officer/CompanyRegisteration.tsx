/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Container,
  Paper,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { getCookie } from "@/utils";
import toast from "react-hot-toast";

const CompanyRegistrationForm = () => {
  interface FormDataType {
    name: string;
    min_tenth_marks: string;
    min_higher_secondary_marks: string;
    min_cgpa: string;
    min_attendance: string;
    is_kt: boolean;
    is_backLog: boolean;
    domain: string;
    Departments: string;
    is_pli: boolean;
    is_ojt_aedp: boolean;
    selectedDepartments: string[];
    jobOffers: Array<{ type: string; salary: string; position: string, degree: string }>;
    batch: string;
  }

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    min_tenth_marks: "",
    min_higher_secondary_marks: "",
    min_cgpa: "",
    min_attendance: "",
    is_kt: false,
    is_backLog: false,
    domain: "core",
    Departments: "all",
    is_pli: false,
    is_ojt_aedp: false,
    selectedDepartments: [],
    jobOffers: [{ type: "", salary: "", position: "", degree: "" }],
    batch: "",
  });

  const navigate = useNavigate();
  const departmentOptions = [
    "CS",
    "IT",
    "AI & DS",
    "AL & ML",
    "CIVIL",
    "E & TC",
    "ELEX",
    "IOT",
    "MECH",
  ];

  const degreeOptions = ["BE", "ME", "BE, ME"]

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDepartmentChange = (e: any) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      selectedDepartments: checked
        ? [...prevData.selectedDepartments, value]
        : prevData.selectedDepartments.filter((dept) => dept !== value),
    }));
  };

  const handleJobOfferChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedJobOffers = [...formData.jobOffers];
    updatedJobOffers[index] = {
      ...updatedJobOffers[index],
      [name as keyof (typeof updatedJobOffers)[typeof index]]: value,
    };
    setFormData({ ...formData, jobOffers: updatedJobOffers });
  };

  const handleDegreeChange = (index: number, e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    const updatedJobOffers = [...formData.jobOffers];
    updatedJobOffers[index] = {
      ...updatedJobOffers[index],
      degree: value,
    };
    setFormData({ ...formData, jobOffers: updatedJobOffers });
  };


  const addJobOffer = () => {
    setFormData((prevData) => ({
      ...prevData,
      jobOffers: [
        ...prevData.jobOffers,
        { type: "", salary: "", position: "", degree: "" },
      ],
    }));
  };

  const removeJobOffer = (index: any) => {
    setFormData((prevData) => ({
      ...prevData,
      jobOffers:
        prevData.jobOffers.length > 1
          ? prevData.jobOffers.filter((_, i) => i !== index)
          : prevData.jobOffers,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      company: {
        name: formData.name,
        min_tenth_marks: parseFloat(formData.min_tenth_marks),
        min_higher_secondary_marks: parseFloat(
          formData.min_higher_secondary_marks
        ),
        min_cgpa: parseFloat(formData.min_cgpa),
        min_attendance: parseFloat(formData.min_attendance),
        is_pli: formData.is_pli,
        is_kt: formData.is_kt,
        is_backLog: formData.is_backLog,
        domain: formData.domain,
        is_ojt_aedp: formData.is_ojt_aedp,
        departments: formData.selectedDepartments,
        batch: formData.batch, // Added batch field to payload
      },
      offers: formData.jobOffers.map((offer) => ({
        type: offer.type,
        salary: parseFloat(offer.salary),
        position: offer.position,
        degree: offer.degree,
      })),
    };

    console.log(payload);

    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/placement/company/register/1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to register company");
      }

      const data = await response.json();
      console.log("company data now:", data);
      toast.success("Company registered successfully:");
      navigate(`/placement_officer/company_register`);
    } catch (error) {
      console.error("Error registering company:", error);
      alert("Error registering company. Check console for details.");
    }
  };

  return (
    <>
      <Container component="main" maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography component="h1" variant="h5">
            Company Registration
          </Typography>
          <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="min_tenth_marks"
                  label="Minimum required 10th Marks"
                  type="number"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="min_higher_secondary_marks"
                  label="Minimum required 12th Marks"
                  type="number"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="min_cgpa"
                  label="Minimum required CGPA"
                  type="number"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="min_attendance"
                  label="Minimum required Attendance"
                  type="number"
                  fullWidth
                  required
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="batch"
                  label="Batch"
                  fullWidth
                  required
                  type="text"
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_pli"
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Offering PLI (Placement Linked Internship)/AEDP" />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_ojt_aedp"
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Offering OJT/AEDP"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_kt"
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Accepting Active KT"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_backLog"
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Accepting Backlogs"
                />
              </Grid>
              <Grid item xs={12}>
                <Select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="core">Core</MenuItem>
                  <MenuItem value="it">IT</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Select
                  name="Departments"
                  value={formData.Departments}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      Departments: value,
                      selectedDepartments:
                        value === "all" ? [] : formData.selectedDepartments, // Clear when 'All' is selected
                    });
                  }}
                  fullWidth
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="select">Select Departments</MenuItem>
                </Select>
              </Grid>
              {formData.Departments === "select" && (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    {departmentOptions.map((dept) => (
                      <Grid item xs={6} key={dept}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={dept}
                              checked={formData.selectedDepartments.includes(
                                dept
                              )} // Fix here
                              onChange={handleDepartmentChange}
                              color="primary"
                            />
                          }
                          label={dept}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="h6">Job Offers</Typography>
                {formData.jobOffers.map((offer, index) => (
                  <Grid container spacing={2} key={index} alignItems="center">
                    <Grid item xs={2.5}>
                      <TextField
                        name="type"
                        label="Type"
                        value={offer.type}
                        onChange={(e) => handleJobOfferChange(index, e)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2.5}>
                      <TextField
                        name="salary"
                        label="Salary"
                        type="number"
                        value={offer.salary}
                        onChange={(e) => handleJobOfferChange(index, e)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2.5}>
                      <TextField
                        name="position"
                        label="Position"
                        value={offer.position}
                        onChange={(e) => handleJobOfferChange(index, e)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Select
                        name="degree"
                        value={offer.degree}
                        onChange={(e) => handleDegreeChange(index, e)}
                        fullWidth
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select Degree</em>
                        </MenuItem>
                        {degreeOptions.map((deg) => (
                          <MenuItem key={deg} value={deg}>
                            {deg}
                          </MenuItem>
                        ))}
                      </Select>

                    </Grid>
                    <Grid item xs={1.5}>
                      <Button
                        onClick={() => removeJobOffer(index)}
                        disabled={formData.jobOffers.length === 1}
                        color="error"
                        fullWidth
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Button onClick={addJobOffer} variant="contained" color="primary">
                  Add Job Offer
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CompanyRegistrationForm;
