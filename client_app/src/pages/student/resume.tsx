/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Paper,
  ThemeProvider,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import theme from "./components/theme";
import { PlusCircle, MinusCircle } from "lucide-react";
import { getCookie } from "@/utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const initialFormData = {
  name: "",
  photo: null as File | null,
  department: "",
  email: "",
  phone_no: "",
  city: "",
  education: [
    {
      degree: "",
      institution: "",
      start_date: "",
      end_date: "",
      percentage: "",
    },
  ],
  skills: [""],
  projects: [{ title: "", description: "" }],
  workExperience: [
    {
      company: "",
      position: "",
      description: "",
      start_date: "",
      end_date: "",
    },
  ],
  extracurricular: [""],
};

const departments = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Tele-Communication Engineering",
  "Electronics & Computer Science",
  "Mechanical Engineering",
  "Civil Engineering",
  "Computer Science & Engineering (Cyber Security)",
  "Mechanical and Mechatronics Engineering",
  "AI & ML",
  "AI & DS",
  "IOT",
];

const Resume = () => {
  const [_isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch("/api/student/resume/", {
          method: "GET",
          credentials: "include",
          headers: {
            "X-CSRF-Token": getCookie("csrftoken") || "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("API Response Data:", data);
          setFormData({
            ...initialFormData,
            ...data,
            education: data.education || initialFormData.education,
            skills: data.skills || initialFormData.skills,
            projects: data.projects || initialFormData.projects,
            workExperience: data.workExperience || initialFormData.workExperience,
            extracurricular: data.extracurricular || initialFormData.extracurricular,
          });
          setIsUpdate(true);
        } else {
          console.log("API Error:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    fetchResume();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string | File | null) => {
    if (field === "photo" && value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        localStorage.setItem("profilePhoto", base64String); // Store base64 string in LocalStorage
        setFormData({ ...formData, [field]: value }); // Keep File object for API
      };
      reader.readAsDataURL(value);
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleArrayChange = (
    section: keyof typeof formData,
    index: number,
    key: string | null,
    value: string
  ) => {
    const updatedArray = (formData[section] as any[]).map((item: any, i: number) =>
      i === index ? (key ? { ...item, [key]: value } : value) : item
    );
    setFormData({ ...formData, [section]: updatedArray });
  };

  const addNewField = (section: keyof typeof formData, defaultValue: any) => {
    setFormData({
      ...formData,
      [section]: [...(formData[section] as any[]), defaultValue],
    });
  };

  const removeField = (section: keyof typeof formData, index: number) => {
    const updatedArray = (formData[section] as any[]).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, [section]: updatedArray });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }
    formDataToSend.append("department", formData.department);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone_no", formData.phone_no);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("education", JSON.stringify(formData.education));
    formDataToSend.append("skills", JSON.stringify(formData.skills));
    formDataToSend.append("projects", JSON.stringify(formData.projects));
    formDataToSend.append("workExperience", JSON.stringify(formData.workExperience));
    formDataToSend.append("extracurricular", JSON.stringify(formData.extracurricular));

    try {
      const res = await fetch("/api/student/resume/", {
        method: isUpdate ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        body: formDataToSend,
      });
      if (res.ok) {
        toast.success(`Resume ${isUpdate ? "updated" : "created"} successfully`);
      } else {
        toast.error("Failed to save resume");
      }
    } catch (error) {
      toast.error("Error submitting resume");
      console.error("Submit Error:", error);
    }
    setIsSubmitted(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            Resume Form
          </Typography>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <Box mb={2}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                color="primary"
              />
            </Box>

            {/* Photo */}
            <Box mb={2}>
              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: "background.paper", px: 1 }}>
                  Photo
                </InputLabel>
                <label htmlFor="photo-upload" style={{ display: "block", marginTop: "16px" }}>
                  Upload Photo
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange("photo", e.target.files?.[0] || null)}
                  className="photo-upload-input"
                  placeholder="Choose a photo"
                />
              </FormControl>
            </Box>

            {/* Department */}
            <Box mb={2}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => handleInputChange("department", e.target.value as string)}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Email */}
            <Box mb={2}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                color="primary"
              />
            </Box>

            {/* Phone Number */}
            <Box mb={2}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone_no}
                onChange={(e) => handleInputChange("phone_no", e.target.value)}
                required
                color="primary"
              />
            </Box>

            {/* City */}
            <Box mb={2}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
                color="primary"
              />
            </Box>

            {/* Academic Qualifications */}
            <Typography variant="h6" mt={4} color="primary">
              Academic Qualifications
            </Typography>
            {Array.isArray(formData.education) &&
              formData.education.map((edu: any, index: number) => (
                <Box key={index} mb={2}>
                  <TextField
                    fullWidth
                    label="Institute Name"
                    value={edu.institution}
                    onChange={(e) =>
                      handleArrayChange("education", index, "institution", e.target.value)
                    }
                    required
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Degree"
                    value={edu.degree}
                    onChange={(e) => handleArrayChange("education", index, "degree", e.target.value)}
                    required
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={edu.start_date}
                    onChange={(e) =>
                      handleArrayChange("education", index, "start_date", e.target.value)
                    }
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={edu.end_date}
                    onChange={(e) =>
                      handleArrayChange("education", index, "end_date", e.target.value)
                    }
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Percentage/CGPA"
                    value={edu.percentage}
                    onChange={(e) =>
                      handleArrayChange("education", index, "percentage", e.target.value)
                    }
                    margin="dense"
                  />
                  <IconButton
                    onClick={() => removeField("education", index)}
                    color="secondary"
                    disabled={formData.education.length === 1}
                  >
                    <MinusCircle />
                  </IconButton>
                </Box>
              ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() =>
                addNewField("education", {
                  institution: "",
                  degree: "",
                  start_date: "",
                  end_date: "",
                  percentage: "",
                })
              }
              color="primary"
            >
              Add Academic Qualification
            </Button>

            {/* Skills */}
            <Typography variant="h6" mt={4} color="primary">
              Skills
            </Typography>
            {Array.isArray(formData.skills) &&
              formData.skills.map((skill: string, index: number) => (
                <Box key={index} display="flex" alignItems="center" mb={2}>
                  <TextField
                    fullWidth
                    label={`Skill ${index + 1}`}
                    value={skill}
                    onChange={(e) => handleArrayChange("skills", index, null, e.target.value)}
                    required
                  />
                  <IconButton
                    onClick={() => removeField("skills", index)}
                    color="secondary"
                    disabled={formData.skills.length === 1}
                  >
                    <MinusCircle />
                  </IconButton>
                </Box>
              ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() => addNewField("skills", "")}
              color="primary"
            >
              Add Skill
            </Button>

            {/* Projects */}
            <Typography variant="h6" mt={4} color="primary">
              Projects
            </Typography>
            {Array.isArray(formData.projects) &&
              formData.projects.map((project: any, index: number) => (
                <Box key={index} mb={2}>
                  <TextField
                    fullWidth
                    label="Project Title"
                    value={project.title}
                    onChange={(e) => handleArrayChange("projects", index, "title", e.target.value)}
                    required
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Project Description"
                    value={project.description}
                    onChange={(e) =>
                      handleArrayChange("projects", index, "description", e.target.value)
                    }
                    margin="dense"
                    multiline
                    rows={3}
                  />
                  <IconButton
                    onClick={() => removeField("projects", index)}
                    color="secondary"
                    disabled={formData.projects.length === 1}
                  >
                    <MinusCircle />
                  </IconButton>
                </Box>
              ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() => addNewField("projects", { title: "", description: "" })}
              color="primary"
            >
              Add Project
            </Button>

            {/* Work Experience */}
            <Typography variant="h6" mt={4} color="primary">
              Work Experience
            </Typography>
            {Array.isArray(formData.workExperience) &&
              formData.workExperience.map((work: any, index: number) => (
                <Box key={index} mb={2}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={work.company}
                    onChange={(e) =>
                      handleArrayChange("workExperience", index, "company", e.target.value)
                    }
                    required
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Position"
                    value={work.position}
                    onChange={(e) =>
                      handleArrayChange("workExperience", index, "position", e.target.value)
                    }
                    required
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={work.start_date}
                    onChange={(e) =>
                      handleArrayChange("workExperience", index, "start_date", e.target.value)
                    }
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={work.end_date}
                    onChange={(e) =>
                      handleArrayChange("workExperience", index, "end_date", e.target.value)
                    }
                    required
                    margin="dense"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={work.description}
                    onChange={(e) =>
                      handleArrayChange("workExperience", index, "description", e.target.value)
                    }
                    margin="dense"
                    multiline
                    rows={3}
                  />
                  <IconButton
                    onClick={() => removeField("workExperience", index)}
                    color="secondary"
                    disabled={formData.workExperience.length === 1}
                  >
                    <MinusCircle />
                  </IconButton>
                </Box>
              ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() =>
                addNewField("workExperience", {
                  company: "",
                  position: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                })
              }
              color="primary"
            >
              Add Work Experience
            </Button>

            {/* Co/Extra-Curricular Activities */}
            <Typography variant="h6" mt={4} color="primary">
              Co/Extra-Curricular Activities
            </Typography>
            {Array.isArray(formData.extracurricular) &&
              formData.extracurricular.map((activity: string, index: number) => (
                <Box key={index} display="flex" alignItems="center" mb={2}>
                  <TextField
                    fullWidth
                    label={`Activity ${index + 1}`}
                    value={activity}
                    onChange={(e) =>
                      handleArrayChange("extracurricular", index, null, e.target.value)
                    }
                    required
                  />
                  <IconButton
                    onClick={() => removeField("extracurricular", index)}
                    color="secondary"
                    disabled={formData.extracurricular.length === 1}
                  >
                    <MinusCircle />
                  </IconButton>
                </Box>
              ))}
            <Button
              startIcon={<PlusCircle />}
              onClick={() => addNewField("extracurricular", "")}
              color="primary"
            >
              Add Activity
            </Button>

            {/* Submit Button */}
            <Box display="flex" justifyContent="space-between" mt={2} gap={2}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                sx={{ flex: 1 }}
                onClick={() => navigate("/student/resume-preview")}
              >
                Preview
              </Button>
              <Button type="submit" variant="contained" sx={{ flex: 1 }}>
                {isUpdate ? "Update" : "Submit"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Resume;