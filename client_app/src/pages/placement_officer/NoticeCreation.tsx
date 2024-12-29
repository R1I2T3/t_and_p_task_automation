/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import axios from "axios";

//
import { getCookie } from "../../utils";
//

const NoticeCreationForm = () => {
  const [formData, setFormData] = useState({
    srNo: "",
    to: "",
    subject: "",
    date: "",
    intro: "",
    eligibility_criteria: "",
    roles: "",
    about: "",
    skill_required: "",
    Location: "",
    Documents_to_Carry: "",
    Walk_in_interview: "",
    Company_registration_Link: "",
    Note: "",
    From: "",
    From_designation: "",
    company: "",
  });

  interface Company {
    id: number;
    name: string;
  }

  const [companies, setCompanies] = useState<Company[]>([]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const csrfToken = getCookie("csrftoken");

    axios
      .get("/api/placement/company/", {
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        withCredentials: true, // Ensure cookies are included in the request
      })
      .then((response) => {
        const formattedCompanies = response.data.map((item: any) => ({
          id: item.company.id,
          name: item.company.name,
        }));
        setCompanies(formattedCompanies);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    axios
      .post(`/api/placement/notice/create/${formData.company}`, formData)
      .then((response) => {
        console.log("Notice created:", response.data);
        alert("Notice created successfully!");
      })
      .catch((error) => {
        console.error("Error creating notice:", error);
        alert("Failed to create notice!");
      });
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Create Placement Notice
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                label="Select Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                fullWidth
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sr No"
                name="srNo"
                value={formData.srNo}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="To"
                name="to"
                value={formData.to}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Introduction"
                name="intro"
                value={formData.intro}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Eligibility Criteria"
                name="eligibility_criteria"
                value={formData.eligibility_criteria}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Roles"
                name="roles"
                value={formData.roles}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About"
                name="about"
                value={formData.about}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Skills Required"
                name="skill_required"
                value={formData.skill_required}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="Location"
                value={formData.Location}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Documents to Carry"
                name="Documents_to_Carry"
                value={formData.Documents_to_Carry}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Walk-in Interview Details"
                name="Walk_in_interview"
                value={formData.Walk_in_interview}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Company Registration Link"
                name="Company_registration_Link"
                value={formData.Company_registration_Link}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Note"
                name="Note"
                value={formData.Note}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="From"
                name="From"
                value={formData.From}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="From Designation"
                name="From_designation"
                value={formData.From_designation}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Submit Notice
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default NoticeCreationForm;
